namespace Mashroo3i.Models
{
    public class SwotAnalysis
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdeaId { get; set; }

        // Keep these as plain text — the AI writes them, the frontend displays them as-is
        public string Strengths { get; set; } = string.Empty;
        public string Weaknesses { get; set; } = string.Empty;
        public string Opportunities { get; set; } = string.Empty;
        public string Threats { get; set; } = string.Empty;

        // Risk assessment — plain text paragraph from the AI
        public string Risks { get; set; } = string.Empty;

        // "Low" | "Medium" | "High" | "Critical"
        public string OverallRiskLevel { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public BusinessIdea BusinessIdea { get; set; } = null!;
    }
}