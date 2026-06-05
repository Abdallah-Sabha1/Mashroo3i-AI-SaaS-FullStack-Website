using Mashroo3i.Data;
using Mashroo3i.Models;
using Mashroo3i.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Mashroo3i.Controllers
{
    [ApiController]
    [Route("api/evaluation")]
    [Authorize]
    public class EvaluationController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EvaluationController> _logger;

        public EvaluationController(
            AppDbContext db,
            IServiceScopeFactory scopeFactory,
            ILogger<EvaluationController> logger)
        {
            _db = db;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        // POST /api/evaluation/{ideaId}/start
        // Kicks off the evaluation in the background, returns 202 immediately.
        // Client polls GET /results until status is "completed" or "failed".
        [HttpPost("{ideaId:guid}/start")]
        public async Task<IActionResult> Start(Guid ideaId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // ── Step 1: Atomic credit deduction ──────────────────────────────
            // Single UPDATE WHERE Credits > 0 — eliminates the TOCTOU window
            // between reading credits and deducting them.
            var creditRows = await _db.Users
                .Where(u => u.Id == userId.Value && u.EvaluationCredits > 0)
                .ExecuteUpdateAsync(s =>
                    s.SetProperty(u => u.EvaluationCredits, u => u.EvaluationCredits - 1));

            if (creditRows == 0)
            {
                // Either user doesn't exist or has no credits.
                var userExists = await _db.Users.AnyAsync(u => u.Id == userId.Value);
                if (!userExists) return Unauthorized();

                return BadRequest(new
                {
                    message = "You have no evaluation credits. Please purchase credits to continue.",
                    code = "NO_CREDITS"
                });
            }

            // ── Step 2: Atomic status transition: pending → analyzing ─────────
            // ExecuteUpdateAsync generates a single UPDATE … WHERE IdeaId = x AND Status = 'pending'.
            // If 0 rows are affected, another request already owns this evaluation slot.
            // In that case we refund the credit we just deducted.
            var rowsUpdated = await _db.BusinessIdeas
                .Where(i => i.IdeaId == ideaId
                         && i.UserId == userId.Value
                         && i.Status == BusinessIdea.StatusSubmitted)
                .ExecuteUpdateAsync(s =>
                    s.SetProperty(i => i.Status, BusinessIdea.StatusAnalyzing));

            if (rowsUpdated == 0)
            {
                // Refund — we own the credit deduction but not the evaluation slot.
                await _db.Users
                    .Where(u => u.Id == userId.Value)
                    .ExecuteUpdateAsync(s =>
                        s.SetProperty(u => u.EvaluationCredits, u => u.EvaluationCredits + 1));

                var existing = await _db.BusinessIdeas
                    .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId.Value);

                if (existing == null)
                    return NotFound(new { message = "Idea not found." });

                if (existing.Status == BusinessIdea.StatusCompleted)
                    return Ok(new { message = "Already evaluated.", existing.Status });

                return Accepted(new { message = "Evaluation already in progress.", existing.Status });
            }

            // ── Step 3: Fire-and-forget with a fresh DI scope ─────────────────
            // On failure, EvaluateAsync marks status = "failed" and we refund the credit.
            _ = Task.Run(async () =>
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var evalService = scope.ServiceProvider.GetRequiredService<EvaluationService>();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                try
                {
                    await evalService.EvaluateAsync(ideaId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background evaluation failed for idea {IdeaId} — refunding credit", ideaId);

                    // Refund the credit since evaluation didn't complete.
                    await db.Users
                        .Where(u => u.Id == userId.Value)
                        .ExecuteUpdateAsync(s =>
                            s.SetProperty(u => u.EvaluationCredits, u => u.EvaluationCredits + 1));
                }
            });

            return Accepted(new
            {
                message = "Evaluation started. Poll GET /api/evaluation/{ideaId}/results for updates.",
                ideaId,
                status = BusinessIdea.StatusAnalyzing
            });
        }

        // GET /api/evaluation/{ideaId}/results
        // Returns the full evaluation results. Frontend polls this after calling /start.
        [HttpGet("{ideaId:guid}/results")]
        public async Task<IActionResult> GetResults(Guid ideaId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _db.BusinessIdeas
                .Include(i => i.EvaluationScores)
                .Include(i => i.SwotAnalysis)
                .Include(i => i.MarketAnalysis)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId.Value);

            if (idea == null) return NotFound(new { message = "Idea not found." });

            return Ok(new
            {
                ideaId = idea.IdeaId,
                status = idea.Status,

                scoring = idea.EvaluationScores == null ? null : new
                {
                    idea.EvaluationScores.OverallScore,
                    idea.EvaluationScores.MarketScore,
                    idea.EvaluationScores.FinancialScore,
                    idea.EvaluationScores.ExecutionScore,
                    idea.EvaluationScores.InnovationScore,
                    idea.EvaluationScores.Verdict,
                    idea.EvaluationScores.Summary,
                    strengths = idea.EvaluationScores.Strengths.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                    concerns = idea.EvaluationScores.Concerns.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                    recommendations = idea.EvaluationScores.Recommendations.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                },

                swot = idea.SwotAnalysis == null ? null : new
                {
                    idea.SwotAnalysis.Strengths,
                    idea.SwotAnalysis.Weaknesses,
                    idea.SwotAnalysis.Opportunities,
                    idea.SwotAnalysis.Threats,
                    idea.SwotAnalysis.Risks,
                    idea.SwotAnalysis.OverallRiskLevel,
                },

                market = idea.MarketAnalysis == null ? null : new
                {
                    idea.MarketAnalysis.MarketSize,
                    idea.MarketAnalysis.Saturation,
                    idea.MarketAnalysis.MarketTrend,
                    idea.MarketAnalysis.MarketTrendReason,
                    idea.MarketAnalysis.FatalFlaws,
                    idea.MarketAnalysis.LikelyFailureMode,
                    idea.MarketAnalysis.CompetitorAnalysis,
                    idea.MarketAnalysis.DifferentiationAnalysis,
                    competitors = ParseJson(idea.MarketAnalysis.CompetitorsJson),
                    marketOpportunities = ParseJson(idea.MarketAnalysis.MarketOpportunitiesJson),
                    analyzedAt = idea.MarketAnalysis.CreatedAt,
                }
            });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private Guid? GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }

        private static List<object> ParseJson(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new();
            try { return JsonSerializer.Deserialize<List<object>>(json) ?? new(); }
            catch { return new(); }
        }
    }
}