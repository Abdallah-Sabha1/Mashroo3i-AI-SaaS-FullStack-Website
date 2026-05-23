namespace Mashroo3i.Models
{
    public class MarketAnalysis
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IdeaId { get; set; }

        // ── Core fields (already existed) ─────────────────────────────────
        public string MarketSize { get; set; } = string.Empty;
        public string FatalFlaws { get; set; } = string.Empty;
        public string LikelyFailureMode { get; set; } = string.Empty;
        public string CompetitorAnalysis { get; set; } = string.Empty;

        // ── New fields ─────────────────────────────────────────────────────

        /// <summary>HIGH | MEDIUM | LOW — how crowded is this market in Jordan right now</summary>
        public string Saturation { get; set; } = string.Empty;

        /// <summary>
        /// JSON array of structured competitor objects.
        /// Shape: [{ "name", "description", "threat": HIGH|MEDIUM|LOW, "priceRange", "targetSegment", "mainStrength" }]
        /// Stored as JSON string — no extra table needed, frontend parses it.
        /// </summary>
        public string CompetitorsJson { get; set; } = "[]";

        /// <summary>
        /// JSON array of market opportunity strings.
        /// Shape: ["Opportunity 1", "Opportunity 2"]
        /// </summary>
        public string MarketOpportunitiesJson { get; set; } = "[]";

        /// <summary>GROWING | STABLE | DECLINING</summary>
        public string MarketTrend { get; set; } = string.Empty;

        /// <summary>One sentence explaining why this market is growing/stable/declining in Jordan right now</summary>
        public string MarketTrendReason { get; set; } = string.Empty;

        /// <summary>
        /// 2 sentences: what makes this business different from competitors,
        /// and whether that difference is strong or weak in the Jordan market.
        /// </summary>
        public string DifferentiationAnalysis { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public BusinessIdea BusinessIdea { get; set; } = null!;
    }
}