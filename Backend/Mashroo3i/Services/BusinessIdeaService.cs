using Mashroo3i.Data;
using Mashroo3i.DTOs.BusinessIdea;
using Mashroo3i.Models;
using Microsoft.EntityFrameworkCore;

namespace Mashroo3i.Services
{
    public class BusinessIdeaService
    {
        private readonly AppDbContext _db;

        public BusinessIdeaService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<BusinessIdea> CreateAsync(CreateBusinessIdeaDto dto, Guid userId)
        {
            var idea = new BusinessIdea
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                Sector = dto.Sector,
                EstimatedBudget = dto.EstimatedBudget,
                Status = BusinessIdea.StatusSubmitted
            };

            _db.BusinessIdeas.Add(idea);
            await _db.SaveChangesAsync();

            return idea;
        }

        public async Task<List<BusinessIdeaSummaryDto>> GetAllAsync(Guid userId)
        {
            return await _db.BusinessIdeas
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new BusinessIdeaSummaryDto
                {
                    IdeaId = i.IdeaId,
                    Title = i.Title,
                    Sector = i.Sector,
                    EstimatedBudget = i.EstimatedBudget,
                    Status = i.Status,
                    CreatedAt = i.CreatedAt,
                    OverallScore = i.EvaluationScores != null ? (int?)i.EvaluationScores.OverallScore : null,
                    Verdict = i.EvaluationScores != null ? i.EvaluationScores.Verdict : null,
                })
                .ToListAsync();
        }

        public async Task<BusinessIdea?> GetByIdAsync(Guid ideaId, Guid userId)
        {
            return await _db.BusinessIdeas
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId && i.UserId == userId);
        }

        public async Task<BusinessIdeaDeleteResult> DeleteAsync(Guid ideaId, Guid userId)
        {
            var idea = await GetByIdAsync(ideaId, userId);
            if (idea == null)
                return BusinessIdeaDeleteResult.NotFound;

            if (idea.Status == BusinessIdea.StatusAnalyzing)
                return BusinessIdeaDeleteResult.Analyzing;

            _db.BusinessIdeas.Remove(idea);
            await _db.SaveChangesAsync();

            return BusinessIdeaDeleteResult.Deleted;
        }
    }

    public enum BusinessIdeaDeleteResult
    {
        Deleted,
        NotFound,
        Analyzing
    }
}
