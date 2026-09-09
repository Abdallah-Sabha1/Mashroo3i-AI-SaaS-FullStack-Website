namespace Mashroo3i.Services;

internal class ScoreAiResponse
{
    public int OverallScore { get; set; }
    public int MarketScore { get; set; }
    public int FinancialScore { get; set; }
    public int ExecutionScore { get; set; }
    public int InnovationScore { get; set; }
    public string? Verdict { get; set; }
    public string? Summary { get; set; }
    public List<string>? Strengths { get; set; }
    public List<string>? Concerns { get; set; }
    public List<string>? Recommendations { get; set; }
}

internal class RiskItem
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Mitigation { get; set; } = string.Empty;
}

internal class SwotAiResponse
{
    public string? Strengths { get; set; }
    public string? Weaknesses { get; set; }
    public string? Opportunities { get; set; }
    public string? Threats { get; set; }
    public List<RiskItem>? Risks { get; set; }
    public string? OverallRiskLevel { get; set; }
}

internal class MarketAiResponse
{
    public string? FatalFlaw { get; set; }
    public string? CompetitorAnalysis { get; set; }
    public string? LikelyFailureMode { get; set; }
    public string? MarketSize { get; set; }
    public string? Saturation { get; set; }
    public List<CompetitorItem>? Competitors { get; set; }
    public List<OpportunityItem>? MarketOpportunities { get; set; }
    public string? MarketTrend { get; set; }
    public string? MarketTrendReason { get; set; }
    public string? DifferentiationAnalysis { get; set; }
}

internal class CompetitorItem
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Threat { get; set; } = string.Empty;
    public string PriceRange { get; set; } = string.Empty;
    public string TargetSegment { get; set; } = string.Empty;
    public string MainStrength { get; set; } = string.Empty;
}

internal class OpportunityItem
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Benefit { get; set; } = string.Empty;
}
