using System.Text.Json;
using System.Text.Json.Nodes;
using Mashroo3i.Data;
using Mashroo3i.Models;
using Mashroo3i.Services.AI;
using Microsoft.EntityFrameworkCore;

namespace Mashroo3i.Services
{
    public class EvaluationService
    {
        private readonly AppDbContext _db;
        private readonly IAIService _ai;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<EvaluationService> _logger;

        private static readonly HashSet<string> _noiseKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "_meta", "label", "labelAr", "description", "subSectors", "examplesAmman",
            "notes", "unit", "confidence", "sources", "purpose", "version",
            "lastUpdated", "file", "sector", "sectorKey", "message",
        };

        public EvaluationService(
            AppDbContext db, IAIService ai,
            IWebHostEnvironment env, ILogger<EvaluationService> logger)
        {
            _db = db; _ai = ai; _env = env; _logger = logger;
        }

        public async Task EvaluateAsync(Guid ideaId, CancellationToken ct = default)
        {
            var idea = await _db.BusinessIdeas
                .Include(i => i.EvaluationScores)
                .Include(i => i.SwotAnalysis)
                .Include(i => i.MarketAnalysis)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId, ct);

            if (idea == null) { _logger.LogError("Idea {IdeaId} not found", ideaId); return; }

            if (idea.Status == BusinessIdea.StatusCompleted)
            {
                _logger.LogWarning("Idea {IdeaId} already evaluated", ideaId);
                return;
            }

            idea.Status = BusinessIdea.StatusAnalyzing;
            await _db.SaveChangesAsync(ct);

            var economy = CompressJson(LoadJson("shared", "jordan_economy_snapshot.json"));
            var redFlags = CompressJson(LoadJson("shared", "red_flag_rules.json"));
            var channels = CompressJson(LoadJson("shared", "acquisition_channels.json"));

            var sectorFile = ResolveSectorFile(idea.Sector);
            var sector = sectorFile != null ? CompressJson(LoadJson("sectors", sectorFile)) : null;

            var sharedCtx = BuildSharedContext(idea, economy, sector);

            try
            {
                _logger.LogInformation("Scoring idea {IdeaId} | sector: {Sector}", ideaId, idea.Sector);

                var scoreResult = await _ai.GenerateJsonAsync<ScoreAiResponse>(
                    BuildScoringPrompt(sharedCtx, redFlags, channels), ct);

                var scores = new EvaluationScores
                {
                    IdeaId = ideaId,
                    OverallScore = Clamp(scoreResult.OverallScore),
                    MarketScore = Clamp(scoreResult.MarketScore),
                    FinancialScore = Clamp(scoreResult.FinancialScore),
                    ExecutionScore = Clamp(scoreResult.ExecutionScore),
                    InnovationScore = Clamp(scoreResult.InnovationScore),
                    Verdict = scoreResult.Verdict ?? "Needs Refinement",
                    Summary = scoreResult.Summary ?? string.Empty,
                    Strengths = string.Join("; ", scoreResult.Strengths ?? new()),
                    Concerns = string.Join("; ", scoreResult.Concerns ?? new()),
                    Recommendations = string.Join("; ", scoreResult.Recommendations ?? new()),
                };

                if (idea.EvaluationScores != null)
                    _db.Entry(idea.EvaluationScores).CurrentValues.SetValues(scores);
                else
                    _db.EvaluationScores.Add(scores);

                await _db.SaveChangesAsync(ct);
                _logger.LogInformation("Scoring done. Score={Score} Verdict={Verdict}",
                    scores.OverallScore, scores.Verdict);

                _logger.LogInformation("SWOT for idea {IdeaId}", ideaId);

                var swotResult = await _ai.GenerateJsonAsync<SwotAiResponse>(
                    BuildSwotPrompt(sharedCtx), ct);

                var risksJson = JsonSerializer.Serialize(
                    swotResult.Risks ?? new List<RiskItem>(),
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                var swot = new SwotAnalysis
                {
                    IdeaId = ideaId,
                    Strengths = swotResult.Strengths ?? string.Empty,
                    Weaknesses = swotResult.Weaknesses ?? string.Empty,
                    Opportunities = swotResult.Opportunities ?? string.Empty,
                    Threats = swotResult.Threats ?? string.Empty,
                    Risks = risksJson,
                    OverallRiskLevel = swotResult.OverallRiskLevel ?? "Medium",
                };

                if (idea.SwotAnalysis != null)
                    _db.Entry(idea.SwotAnalysis).CurrentValues.SetValues(swot);
                else
                    _db.SwotAnalyses.Add(swot);

                await _db.SaveChangesAsync(ct);
                _logger.LogInformation("SWOT done. Risk={Level}", swot.OverallRiskLevel);

                _logger.LogInformation("Market analysis for idea {IdeaId}", ideaId);

                var marketResult = await _ai.GenerateJsonAsync<MarketAiResponse>(
                    BuildMarketPrompt(sharedCtx), ct);

                var rawTrend = (marketResult.MarketTrend ?? "STABLE").ToUpperInvariant();
                var trend = rawTrend is "GROWING" or "DECLINING" ? rawTrend : "STABLE";

                var rawSat = (marketResult.Saturation ?? "MEDIUM").ToUpperInvariant();
                var sat = rawSat is "HIGH" or "LOW" ? rawSat : "MEDIUM";

                var competitorsJson = JsonSerializer.Serialize(
                    marketResult.Competitors ?? new List<CompetitorItem>(),
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                var opportunitiesJson = JsonSerializer.Serialize(
                    marketResult.MarketOpportunities ?? new List<OpportunityItem>(),
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                var market = new MarketAnalysis
                {
                    IdeaId = ideaId,
                    MarketSize = marketResult.MarketSize ?? string.Empty,
                    FatalFlaws = marketResult.FatalFlaw ?? string.Empty,
                    LikelyFailureMode = marketResult.LikelyFailureMode ?? string.Empty,
                    CompetitorAnalysis = marketResult.CompetitorAnalysis ?? string.Empty,
                    Saturation = sat,
                    CompetitorsJson = competitorsJson,
                    MarketOpportunitiesJson = opportunitiesJson,
                    MarketTrend = trend,
                    MarketTrendReason = marketResult.MarketTrendReason ?? string.Empty,
                    DifferentiationAnalysis = marketResult.DifferentiationAnalysis ?? string.Empty,
                };

                if (idea.MarketAnalysis != null)
                    _db.Entry(idea.MarketAnalysis).CurrentValues.SetValues(market);
                else
                    _db.MarketAnalyses.Add(market);

                await _db.SaveChangesAsync(ct);
                _logger.LogInformation("Market done. Trend={Trend} Saturation={Sat}", trend, sat);

                idea.Status = BusinessIdea.StatusCompleted;
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Evaluation failed for idea {IdeaId}", ideaId);
                idea.Status = "failed";
                await _db.SaveChangesAsync(CancellationToken.None);
                throw;
            }
        }

        private static string BuildSharedContext(BusinessIdea idea, string economy, string? sector)
        {
            var sectorBlock = sector != null
                ? $"=== SECTOR: {idea.Sector.ToUpper()} ===\n{sector}"
                : $"=== SECTOR: {idea.Sector.ToUpper()} ===\nNo benchmark file. Infer from idea + economy data.";

            return $"""
                === JORDAN ECONOMY (Amman) ===
                {economy}

                {sectorBlock}

                === IDEA ===
                Title:        {idea.Title}
                Description:  {idea.Description}
                Problem:      {idea.ProblemStatement ?? "—"}
                Target:       {idea.TargetAudience ?? "—"}
                USP:          {idea.Usp ?? "—"}
                Type:         {idea.BusinessType}
                Sector:       {idea.Sector}
                Budget:       {idea.EstimatedBudget} JOD
                Location:     {idea.Provinces}
                """;
        }

        private static string BuildScoringPrompt(string sharedCtx, string redFlags, string channels)
        {
            return $$"""
        You are a senior analyst scoring a startup idea for the Jordanian market.
        Score honestly — do not be optimistic. Use ONLY plain text, no markdown, no asterisks.
        Write for a first-time entrepreneur with no finance background.
        When using a financial term, explain it simply in the same sentence.
        Example: "gross margin (the percentage you keep after product costs) is 35%, below the healthy 40% benchmark."
        Keep explanations natural — not in brackets, just as part of the sentence.

        {{sharedCtx}}

        === FINANCIAL RED FLAGS ===
        {{redFlags}}

        === ACQUISITION CHANNELS & CAC ===
        {{channels}}

        === SCORING (0-100 each) ===
        marketScore:     demand + purchasing power in Jordan for this idea
        financialScore:  budget vs startup costs; use the EXACT gross margin % from sector data above
        executionScore:  can a small team realistically launch in Jordan today?
        innovationScore: is the USP genuinely different from what exists in Jordan?
        overallScore:    weighted average (25% each)

        verdict: >=75 Highly Promising | 60-74 Promising | 45-59 Needs Refinement | 30-44 High Risk | <30 Not Viable

        summary:         2 sentences max, under 40 words, no markdown. Simple language.
        strengths:       2-3 items. Each is 1 sentence, under 25 words, cites a real number. Simple language.
        concerns:        Exactly 4 items. Format: "Label: explanation"
                         Label = 3-5 plain words, NO asterisks, NO bold, NO markdown.
                         Explanation = 1 sentence, Jordan-specific, under 35 words.
                         Explain any financial term used simply in the same sentence.
                         Total per item: under 45 words.
        recommendations: Exactly 4 items. Format: "Label: action"
                         Label = 3-5 plain words, NO asterisks, NO bold, NO markdown.
                         Action = 1 sentence, starts with a verb, under 35 words.
                         Use simple everyday language — no jargon.
                         Total per item: under 45 words.

        Return ONLY valid JSON — no extra text, no markdown:
        {"overallScore":0,"marketScore":0,"financialScore":0,"executionScore":0,"innovationScore":0,"verdict":"","summary":"","strengths":[],"concerns":[],"recommendations":[]}
        """;
        }

        private static string BuildSwotPrompt(string sharedCtx)
        {
            return $$"""
        You are a strategic advisor for the Jordanian startup ecosystem.
        Use ONLY plain text — no markdown, no asterisks, no bold symbols.
        Write for a first-time entrepreneur with no finance background.
        When using a financial term, explain it simply in the same sentence.
        Example: "delivery commissions (the fees Talabat takes per order) reach 30%, squeezing profit."
        Keep explanations natural — not in brackets, just as part of the sentence.
        Be specific — name real Jordan competitors and cite real figures.
        CRITICAL: The idea budget is clearly stated in the IDEA section above. Never invent, assume, or change this number. Always use the exact budget from the IDEA section when mentioning costs or budget.

        {{sharedCtx}}

        === SWOT RULES ===
        Each SWOT field: 2 points separated by \n.
        Each point: exactly 1 sentence, 20-30 words.
        Use the EXACT gross margin % from sector data. Be consistent with financialScore.
        Use simple language — explain any term you use.

        === RISK RULES ===
        Exactly 2 risks (cash flow + one other operational risk).
        title: 4-6 words, plain language.
        description: 1 sentence, Jordan-specific, under 30 words. Explain any financial term used.
        mitigation: 1 sentence, concrete action, under 30 words. Simple actionable language.
        overallRiskLevel: "Low" or "Medium" or "High" or "Critical"

        Return ONLY valid JSON:
        {"strengths":"","weaknesses":"","opportunities":"","threats":"","risks":[{"title":"","description":"","mitigation":""}],"overallRiskLevel":""}
        """;
        }
        private static string BuildMarketPrompt(string sharedCtx)
        {
            return $$"""
        You are a Jordanian seed investor doing market and competitor research.
        Name actual businesses operating in Jordan. Use ONLY plain text — no markdown, no asterisks.
        Write for a first-time entrepreneur with no finance background.
        When using a financial term, explain it simply in the same sentence.
        Example: "market saturation (how crowded the market is) is HIGH, meaning many competitors already exist."
        Keep explanations natural — not in brackets, just as part of the sentence.

        {{sharedCtx}}

        === OUTPUT RULES — keep all responses SHORT and SIMPLE ===
        fatalFlaw:               1 sentence, under 25 words. The single biggest blocker in Jordan. Plain language.
        competitorAnalysis:      1 sentence, under 25 words. Name 2 real Jordan businesses. Plain language.
        likelyFailureMode:       1 sentence, under 20 words. Present tense. Simple and direct.
        marketSize:              Format: "~45M JOD" — number only.
        saturation:              "HIGH" or "MEDIUM" or "LOW" — one word only.
        marketTrend:             "GROWING" or "STABLE" or "DECLINING" — one word only.
        marketTrendReason:       1 sentence, under 20 words, one Jordan-specific stat. Simple language.
        differentiationAnalysis: 2 sentences, under 40 words total. Plain language, no jargon.
        competitors:             Exactly 2 real Jordan competitors.
                                 Each: name, description (phrase under 8 words),
                                 threat (HIGH or MEDIUM or LOW),
                                 priceRange, targetSegment, mainStrength.
        marketOpportunities:     Exactly 3 opportunities.
                                 title: 5-8 words, plain language, no trailing dots.
                                 description: 1 sentence, under 25 words, simple language.
                                 benefit: phrase under 8 words, simple and direct.

        Return ONLY valid JSON:
        {"fatalFlaw":"","competitorAnalysis":"","likelyFailureMode":"","marketSize":"","saturation":"","competitors":[{"name":"","description":"","threat":"","priceRange":"","targetSegment":"","mainStrength":""}],"marketOpportunities":[{"title":"","description":"","benefit":""}],"marketTrend":"","marketTrendReason":"","differentiationAnalysis":""}
        """;
        }

        private static string? ResolveSectorFile(string sector) => sector.ToLower() switch
        {
            "tech" or "software" or "tech_software" => "tech_software.json",
            "food" or "fnb" or "food_and_beverage" => "food_and_beverage.json",
            "health" or "wellness" or "health_wellness" => "health_wellness.json",
            "education" or "edtech" or "education_training" => "education_training.json",
            "professional" or "services" or "professional_services" => "professional_services.json",
            "retail" or "ecommerce" or "retail_ecommerce" => "retail_ecommerce.json",
            _ => null,
        };

        private string LoadJson(string folder, string fileName)
        {
            var path = Path.Combine(_env.ContentRootPath, "Data", folder, fileName);
            if (!File.Exists(path))
            {
                _logger.LogWarning("Data file not found: {Path}", path);
                return "{}";
            }
            return File.ReadAllText(path);
        }

        private static string CompressJson(string json)
        {
            try
            {
                var node = JsonNode.Parse(json);
                if (node == null) return json;
                StripNoise(node);
                return node.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
            }
            catch { return json; }
        }

        private static void StripNoise(JsonNode node)
        {
            if (node is JsonObject obj)
            {
                var toRemove = obj.Select(kvp => kvp.Key)
                    .Where(k => _noiseKeys.Contains(k)).ToList();
                foreach (var key in toRemove) obj.Remove(key);
                foreach (var child in obj) StripNoise(child.Value!);
            }
            else if (node is JsonArray arr)
            {
                foreach (var item in arr)
                    if (item != null) StripNoise(item);
            }
        }

        private static int Clamp(int v) => Math.Clamp(v, 0, 100);

        private class ScoreAiResponse
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

        private class RiskItem
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Mitigation { get; set; } = string.Empty;
        }

        private class SwotAiResponse
        {
            public string? Strengths { get; set; }
            public string? Weaknesses { get; set; }
            public string? Opportunities { get; set; }
            public string? Threats { get; set; }
            public List<RiskItem>? Risks { get; set; }
            public string? OverallRiskLevel { get; set; }
        }

        private class MarketAiResponse
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

        private class CompetitorItem
        {
            public string Name { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Threat { get; set; } = string.Empty;
            public string PriceRange { get; set; } = string.Empty;
            public string TargetSegment { get; set; } = string.Empty;
            public string MainStrength { get; set; } = string.Empty;
        }

        private class OpportunityItem
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Benefit { get; set; } = string.Empty;
        }
    }
}