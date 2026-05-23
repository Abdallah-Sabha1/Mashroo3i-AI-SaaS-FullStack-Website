namespace Mashroo3i.Models
{
    public class EvaluationScores
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdeaId { get; set; }

        public int OverallScore { get; set; }
        public int MarketScore { get; set; }
        public int FinancialScore { get; set; }
        public int ExecutionScore { get; set; }
        public int InnovationScore { get; set; }

        // "Highly Promising" | "Promising" | "Needs Refinement" | "High Risk" | "Not Viable"
        public string Verdict { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;

        // Semicolon-separated lists — simple to store, easy to split on the frontend
        // e.g. "Strong local demand; Low competition in sector; Mobile-first fits Jordan market"
        public string Strengths { get; set; } = string.Empty;
        public string Concerns { get; set; } = string.Empty;
        public string Recommendations { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public BusinessIdea BusinessIdea { get; set; } = null!;
    }
}