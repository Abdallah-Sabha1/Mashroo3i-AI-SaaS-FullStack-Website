using Mashroo3i.Data;
using Mashroo3i.DTOs.FinancialPlan;
using Mashroo3i.Interfaces;
using Mashroo3i.Models;
using Mashroo3i.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Mashroo3i.Controllers
{
    [ApiController]
    [Route("api/financial-plans")]
    [Authorize]
    public class FinancialPlansController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IAIService _ai;

        public FinancialPlansController(AppDbContext db, IAIService ai)
        {
            _db = db;
            _ai = ai;
        }

        // GET /api/financial-plans/{ideaId} — returns all 6 saved slider values
        [HttpGet("{ideaId:guid}")]
        public async Task<IActionResult> Get(Guid ideaId, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId.Value, cancellationToken);
            if (idea == null) return NotFound(new { message = "Idea not found." });

            var plan = await _db.FinancialPlans
                .FirstOrDefaultAsync(f => f.IdeaId == ideaId, cancellationToken);
            if (plan == null) return NotFound(new { message = "No financial plan saved yet." });

            return Ok(new
            {
                plan.PlanId,
                plan.IdeaId,
                plan.InitialInvestment,
                plan.MonthlyCosts,
                plan.TicketSize,
                plan.CustomersPerMonth,
                plan.GrossMarginPct,
                plan.MonthlyGrowthRate,
                plan.CreatedAt,
                idea.EstimatedBudget,
            });
        }

        // POST /api/financial-plans/{ideaId} — save all 6 slider inputs
        [HttpPost("{ideaId:guid}")]
        public async Task<IActionResult> Upsert(Guid ideaId, [FromBody] SaveFinancialPlanDto dto, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId.Value, cancellationToken);
            if (idea == null) return NotFound(new { message = "Idea not found." });

            var existing = await _db.FinancialPlans
                .FirstOrDefaultAsync(f => f.IdeaId == ideaId, cancellationToken);

            if (existing != null)
            {
                existing.InitialInvestment = dto.CapEx;
                existing.MonthlyCosts = dto.OpEx;
                existing.TicketSize = dto.TicketSize;
                existing.CustomersPerMonth = dto.CustomersPerMonth;
                existing.GrossMarginPct = dto.GrossMargin;
                existing.MonthlyGrowthRate = dto.MonthlyGrowth;
                existing.MonthlyRevenue = dto.TicketSize * dto.CustomersPerMonth;
            }
            else
            {
                _db.FinancialPlans.Add(new FinancialProjection
                {
                    IdeaId = ideaId,
                    InitialInvestment = dto.CapEx,
                    MonthlyCosts = dto.OpEx,
                    TicketSize = dto.TicketSize,
                    CustomersPerMonth = dto.CustomersPerMonth,
                    GrossMarginPct = dto.GrossMargin,
                    MonthlyGrowthRate = dto.MonthlyGrowth,
                    MonthlyRevenue = dto.TicketSize * dto.CustomersPerMonth,
                });
            }

            await _db.SaveChangesAsync(cancellationToken);
            return Ok(new { message = "Financial plan saved." });
        }

        // POST /api/financial-plans/{ideaId}/insights — AI insights (cached)
        [HttpPost("{ideaId:guid}/insights")]
        public async Task<IActionResult> GetInsights(Guid ideaId, [FromBody] InsightsRequestDto dto, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId.Value, cancellationToken);
            if (idea == null) return NotFound(new { message = "Idea not found." });

            // ── Cache key: hash of all inputs that affect the insights ──────────
            var inputFingerprint = $"{dto.CapEx}|{dto.OpEx}|{dto.Ticket}|{dto.Customers}|{dto.Margin}|{dto.Growth}|{dto.Year1Revenue}|{dto.Year1Profit}|{dto.Roi}|{dto.BreakEvenMonth}";

            var plan = await _db.FinancialPlans.FirstOrDefaultAsync(f => f.IdeaId == ideaId, cancellationToken);

            // ── Return cached insights if inputs haven't changed ─────────────────
            if (plan != null
                && !string.IsNullOrEmpty(plan.InsightsJson)
                && plan.InsightsInputHash == inputFingerprint)
            {
                try
                {
                    var cached = System.Text.Json.JsonSerializer.Deserialize<List<InsightItem>>(
                        plan.InsightsJson,
                        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (cached != null && cached.Count > 0)
                        return Ok(cached);
                }
                catch { /* corrupt cache — fall through to regenerate */ }
            }

            // ── Generate fresh insights ──────────────────────────────────────────
            var prompt = $"""
                You are a financial advisor analyzing a Jordan startup. Generate exactly 3 concise insights.

                Business Financial Data:
                - Sector: {dto.SectorLabel}
                - Initial Investment (CapEx): {dto.CapEx} JOD
                - Monthly OpEx: {dto.OpEx} JOD
                - Ticket Size: {dto.Ticket} JOD
                - Starting Customers/Month: {dto.Customers}
                - Gross Margin: {dto.Margin}%
                - Monthly Growth Rate: {dto.Growth}%
                - Year 1 Revenue: {dto.Year1Revenue} JOD
                - Year 1 Net Profit: {dto.Year1Profit} JOD
                - ROI: {dto.Roi}%
                - Break-Even Month: {(dto.BreakEvenMonth.HasValue ? $"Month {dto.BreakEvenMonth}" : "Not within Year 1")}
                - Year 1 COGS: {dto.Year1Cogs} JOD
                - Year 1 OpEx Total: {dto.Year1Opex} JOD

                Return ONLY a JSON array with exactly 3 objects. No markdown, no extra text.
                Each object: "tone": "positive"|"info"|"warn", "title": "short title max 8 words", "body": "2 sentences, Jordan-specific" 

                Rules:
                - Insight 1: break-even or cash flow timeline
                - Insight 2: ROI vs Jordan SME benchmark (30-50%)
                - Insight 3: unit economics or margin health
                - Use actual numbers from the data above
                """;

            try
            {
                var result = await _ai.GenerateJsonAsync<List<InsightItem>>(prompt, cancellationToken);

                // ── Persist to DB ────────────────────────────────────────────────
                if (result != null && result.Count > 0 && plan != null)
                {
                    plan.InsightsJson = System.Text.Json.JsonSerializer.Serialize(result);
                    plan.InsightsInputHash = inputFingerprint;
                    await _db.SaveChangesAsync(cancellationToken);
                }

                return Ok(result);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch
            {
                return Ok(new List<InsightItem>());
            }
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

}
