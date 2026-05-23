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

            var idea = await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId.Value);

            if (idea == null) return NotFound(new { message = "Idea not found." });

            if (idea.Status == BusinessIdea.StatusCompleted)
                return Ok(new { message = "Already evaluated.", idea.Status });

            if (idea.Status == BusinessIdea.StatusAnalyzing)
                return Accepted(new { message = "Evaluation already in progress.", idea.Status });

            // ── Credits check ─────────────────────────────────────────────
            var user = await _db.Users.FindAsync(userId.Value);
            if (user == null) return Unauthorized();

            if (user.EvaluationCredits <= 0)
                return BadRequest(new
                {
                    message = "You have no evaluation credits. Please purchase credits to continue.",
                    code = "NO_CREDITS"
                });

            // Deduct one credit before starting the background job
            user.EvaluationCredits -= 1;
            await _db.SaveChangesAsync();

            // Fire-and-forget with a fresh DI scope.
            _ = Task.Run(async () =>
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var evalService = scope.ServiceProvider.GetRequiredService<EvaluationService>();
                try
                {
                    await evalService.EvaluateAsync(ideaId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background evaluation failed for idea {IdeaId}", ideaId);
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
                .Include(i => i.MarketAnalysis)          // ← added
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
                    // Deserialize JSON columns back to arrays for the frontend
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

        /// <summary>
        /// Safely deserializes a JSON array string back to a list of objects.
        /// Returns an empty list instead of throwing if the value is null or malformed.
        /// </summary>
        private static List<object> ParseJson(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new();
            try { return JsonSerializer.Deserialize<List<object>>(json) ?? new(); }
            catch { return new(); }
        }
    }
}