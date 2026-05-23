using Mashroo3i.Data;
using Mashroo3i.DTOs.BusinessIdea;
using Mashroo3i.Models;
using Mashroo3i.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Mashroo3i.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BusinessIdeaController : ControllerBase
    {
        private readonly BusinessIdeaService _service;
        private readonly AppDbContext _db;

        public BusinessIdeaController(BusinessIdeaService service, AppDbContext db)
        {
            _service = service;
            _db = db;
        }

        // POST /api/business-idea
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBusinessIdeaDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _service.CreateAsync(dto, userId.Value);

            return CreatedAtAction(nameof(GetById), new { id = idea.IdeaId }, new
            {
                idea.IdeaId,
                idea.Title,
                idea.Status
            });
        }

        // GET /api/business-idea
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var ideas = await _db.BusinessIdeas
                .Where(i => i.UserId == userId.Value)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new
                {
                    i.IdeaId,
                    i.Title,
                    i.Sector,
                    i.BusinessType,
                    i.EstimatedBudget,
                    i.Status,
                    i.CreatedAt,
                    OverallScore = i.EvaluationScores != null ? (int?)i.EvaluationScores.OverallScore : null,
                    Verdict = i.EvaluationScores != null ? i.EvaluationScores.Verdict : null,
                })
                .ToListAsync();

            return Ok(ideas);
        }

        // GET /api/business-idea/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == id && i.UserId == userId.Value);

            if (idea == null) return NotFound();

            return Ok(idea);
        }

        // DELETE /api/business-idea/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var idea = await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == id && i.UserId == userId.Value);

            if (idea == null) return NotFound(new { message = "Idea not found." });

            if (idea.Status == BusinessIdea.StatusAnalyzing)
                return Conflict(new { message = "Cannot delete an idea while it is being analyzed. Wait for evaluation to finish." });

            _db.BusinessIdeas.Remove(idea);
            await _db.SaveChangesAsync();

            return NoContent(); // 204
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}