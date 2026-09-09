namespace Mashroo3i.DTOs.BusinessIdea
{
    public class BusinessIdeaSummaryDto
    {
        public Guid IdeaId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Sector { get; set; } = string.Empty;
        public decimal EstimatedBudget { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? OverallScore { get; set; }
        public string? Verdict { get; set; }
    }
}
