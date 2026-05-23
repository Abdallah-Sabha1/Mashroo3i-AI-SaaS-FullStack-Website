using Mashroo3i.Data;
using Mashroo3i.DTOs.BusinessIdea;
using Mashroo3i.Models;

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
                ProblemStatement = dto.ProblemStatement,
                TargetAudience = dto.TargetAudience,
                Usp = dto.Usp,
                BusinessType = dto.BusinessType,
                Sector = dto.Sector,
                BusinessTypeReason = dto.BusinessTypeReason,
                EstimatedBudget = dto.EstimatedBudget,
                Status = BusinessIdea.StatusSubmitted
            };

            _db.BusinessIdeas.Add(idea);
            await _db.SaveChangesAsync();

            return idea;
        }
    }
}