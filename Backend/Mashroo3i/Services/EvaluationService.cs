using System.Text.Json;
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
        private readonly EvaluationReferenceData _referenceData;
        private readonly ILogger<EvaluationService> _logger;

        public EvaluationService(
            AppDbContext db, IAIService ai,
            EvaluationReferenceData referenceData, ILogger<EvaluationService> logger)
        {
            _db = db; _ai = ai; _referenceData = referenceData; _logger = logger;
        }

        public async Task EvaluateAsync(Guid ideaId, CancellationToken ct = default)
        {
            var idea = await _db.BusinessIdeas
                .Include(i => i.EvaluationScores)
                .Include(i => i.SwotAnalysis)
                .Include(i => i.MarketAnalysis)
                .FirstOrDefaultAsync(i => i.IdeaId == ideaId, ct);

            if (idea == null)
            {
                _logger.LogError("Idea {IdeaId} not found", ideaId);
                return;
            }

            if (idea.Status != BusinessIdea.StatusAnalyzing)
            {
                _logger.LogWarning(
                    "Idea {IdeaId} has status '{Status}' — expected 'analyzing', skipping",
                    ideaId, idea.Status);
                return;
            }

            var referenceData = _referenceData.Load(idea);
            var sharedCtx = BuildSharedContext(idea, referenceData.Economy, referenceData.Sector);

            try
            {
                _logger.LogInformation("Starting parallel AI evaluation for idea {IdeaId} | sector: {Sector}", ideaId, idea.Sector);

                var scoringTask = _ai.GenerateJsonAsync<ScoreAiResponse>(
                    BuildScoringPrompt(sharedCtx, referenceData.RedFlags, referenceData.Channels), ct);

                var swotTask = _ai.GenerateJsonAsync<SwotAiResponse>(
                    BuildSwotPrompt(sharedCtx), ct);

                var marketTask = _ai.GenerateJsonAsync<MarketAiResponse>(
                    BuildMarketPrompt(sharedCtx), ct);

                await Task.WhenAll(scoringTask, swotTask, marketTask);

                var scoreResult = await scoringTask;
                var swotResult = await swotTask;
                var marketResult = await marketTask;

                _logger.LogInformation("All 3 AI calls completed in parallel for idea {IdeaId}", ideaId);

                // 1. Scores
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
                _logger.LogInformation("Scoring saved. Score={Score} Verdict={Verdict}",
                    scores.OverallScore, scores.Verdict);

                // 2. SWOT
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
                _logger.LogInformation("SWOT saved. Risk={Level}", swot.OverallRiskLevel);

                // 3. Market
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
                _logger.LogInformation("Market saved. Trend={Trend} Saturation={Sat}", trend, sat);

                idea.Status = BusinessIdea.StatusCompleted;
                await _db.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Evaluation failed for idea {IdeaId}", ideaId);
                await _db.BusinessIdeas
                    .Where(i => i.IdeaId == ideaId)
                    .ExecuteUpdateAsync(s =>
                        s.SetProperty(i => i.Status, "failed"),
                    CancellationToken.None);
                throw;
            }
        }

        // FIX #4: Added IMPORTANT block so AI knows to match competitors to the specific idea,
        //         and to use its own knowledge when sector data lacks relevant entries.
        private static string BuildSharedContext(BusinessIdea idea, string economy, string? sector)
        {
            var sectorBlock = sector != null
                ? $"=== SECTOR: {idea.Sector.ToUpper()} ===\n{sector}"
                : $"=== SECTOR: {idea.Sector.ToUpper()} ===\nNo benchmark file available for this sector. Use your own knowledge of the Jordanian market for all benchmarks, costs, and competitors. Be honest about any uncertainty.";

            return $"""
                === JORDAN ECONOMY (Amman) ===
                {economy}

                {sectorBlock}

                === IDEA ===
                Title:        {idea.Title}
                Description:  {idea.Description}
                Sector:       {idea.Sector}
                Budget:       {idea.EstimatedBudget} JOD
                Location:     Amman, Jordan

                === IMPORTANT — READ BEFORE SCORING ===
                The sector file above covers MULTIPLE sub-sectors. Match data and competitors to THIS specific idea only.
                If a competitor entry has a relevantSubSectors field, only use that competitor if it matches this idea.
                If the sector data does not contain relevant competitors for this specific idea, use your own knowledge of the Jordanian market instead.
                Never include a competitor that does not actually compete with this specific idea.
                Use the aiPromptGuidance field inside marketSize_JOD to select the correct sub-market size for this idea.
                """;
        }

        // FIX #2 (innovation): Added explicit instruction to base innovation on all Jordan knowledge,
        //         not just sector data. Stops innovation being wrongly penalized by global tools.
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
                         Base this on ALL competitors you know about in Jordan — not only those listed in the sector data.
                         If the sector data lacks direct competitors for this specific idea, use your own knowledge of the Jordanian market.
                         Do not penalize innovation based on global free tools (e.g. Wave, Zoho, Canva) unless those tools are actively dominant in Jordan for this exact use case.
        overallScore:    weighted average (25% each)

        verdict: >=75 Highly Promising | 60-74 Promising | 45-59 Needs Refinement | 30-44 High Risk | <30 Not Viable

        summary: 3-4 sentences, 60-80 words. Cover the core opportunity, the main risk, and one key number. Simple language.

        strengths: Exactly 3 items.
                   Each item is ONE complete thought — never split a single strength across two items.
                   Each item: 2 sentences. First states the strength with a real number or Jordan-specific fact.
                   Second explains why it matters for this business.
                   Total per item: under 50 words.

        concerns: Exactly 3 items — no more, no less.
                  Each item is SELF-CONTAINED. A single concern must never be split across two list entries.
                  Format REQUIRED for every item: "Label: explanation"
                  Label = 3-5 plain words. No asterisks, no bold, no symbols, no colon inside the label itself.
                  Explanation = 2 sentences written as one continuous thought: first names the problem with a
                  Jordan-specific number or example, second explains the real-world consequence for this business.
                  Explain any financial term used simply in the same sentence.
                  Total per item: 50-65 words.

                  CORRECT example:
                  "Cash Flow Gap: B2B clients in Jordan typically pay 30-60 days after invoicing, meaning money earned is not cash in hand. With 1,200 JOD in monthly fixed costs you need at least 2 months of reserves before income stabilises."

                  WRONG — never do this (one concern split into two items):
                  Item 1: "Subscription Revenue Risk: Relying on subscriptions is risky if retention is low."
                  Item 2: "the typical retention rate for services is 80%, but one-off projects see lower retention."
                  The above is forbidden. Merge related thoughts into one self-contained item.

        recommendations: Exactly 3 items — no more, no less.
                         Each item is SELF-CONTAINED. A single recommendation must never be split across two list entries.
                         Format REQUIRED for every item: "Label: action"
                         Label = 3-5 plain words. No asterisks, no bold, no symbols.
                         Action = 2 sentences written as one continuous thought: first gives a specific actionable
                         step with a concrete detail (number, name, channel), second explains the expected outcome
                         and approximate timeline.
                         Use simple everyday language — no jargon.
                         Total per item: 50-65 words.

                         CORRECT example:
                         "Secure Anchor Clients First: Approach 3-5 Amman-based SMEs directly before launch and offer a 2-month pilot at a discounted rate. Locking in monthly retainers before going public gives you predictable cash flow from day one and reduces the risk of running out of money in month 3."

                         WRONG — never do this (one recommendation split into two items):
                         Item 1: "Build a Referral Program: Create a referral scheme to reduce acquisition cost."
                         Item 2: "offer a one-month free credit for every paying customer who refers a friend."
                         The above is forbidden. Merge into one self-contained item.

        Return ONLY valid JSON — no extra text, no markdown.
        strengths, concerns, and recommendations MUST be arrays of plain strings — NOT objects, NOT {"item":"..."}, NOT {"label":"..."}.
        Each array element is a single string. Example of correct format:
        {"overallScore":0,"marketScore":0,"financialScore":0,"executionScore":0,"innovationScore":0,"verdict":"","summary":"","strengths":["strength one here","strength two here","strength three here"],"concerns":["Label: explanation one here","Label: explanation two here","Label: explanation three here"],"recommendations":["Label: action one here","Label: action two here","Label: action three here"]}
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
        Each SWOT field: 3 points separated by \n.
        Each point: 2 sentences. First sentence states the fact with a specific number or Jordan-specific detail. Second sentence explains the business implication.
        Total per point: 35-50 words.
        Use the EXACT gross margin % from sector data that matches this specific idea's sub-sector. Be consistent with financialScore.
        Use simple language — explain any term you use.
        Name real Jordanian competitors relevant to THIS specific idea — not generic sector competitors.

        === RISK RULES ===
        Exactly 2 risks (cash flow + one other operational risk).
        title: 4-6 words, plain language.
        description: 2 sentences, Jordan-specific, under 50 words. First sentence explains the risk clearly with a real example or number. Second sentence describes the likely consequence for this specific business.
        mitigation: 2 sentences, concrete action, under 50 words. First sentence states what to do specifically. Second sentence explains how this reduces the risk.
        overallRiskLevel: "Low" or "Medium" or "High" or "Critical"

        Return ONLY valid JSON:
        {"strengths":"","weaknesses":"","opportunities":"","threats":"","risks":[{"title":"","description":"","mitigation":""}],"overallRiskLevel":""}
        """;
        }

        // FIX #1 (market size) + FIX #2 (competitors): Updated competitor instruction to show 3,
        //   filter by relevantSubSectors, allow AI override for irrelevant data entries,
        //   and use aiPromptGuidance for correct sub-market size selection.
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

        === OUTPUT RULES — substantive but focused ===
        fatalFlaw:               2 sentences, under 50 words. First sentence names the specific blocker in Jordan. Second explains why it matters for this business.
        competitorAnalysis:      2 sentences, under 50 words. Name the 2 most relevant competitors to THIS specific idea with their actual price ranges and strengths. Second sentence explains what makes them a real threat to this specific idea.
        likelyFailureMode:       2 sentences, under 45 words. First sentence describes the failure scenario specifically. Second explains the warning signs to watch for.
        marketSize:              STEP 1 — check if marketSize_JOD contains an aiPromptGuidance field. If yes, follow it exactly to pick the correct sub-market.
                                 STEP 2 — if no aiPromptGuidance, pick the MOST SPECIFIC sub-market field that matches this idea. Never use a total-sector revenue figure for a single-product startup.
                                 STEP 3 — format the chosen value as "~X JOD" using the midpoint of the range. Example: "28-38M" → "~33M JOD".
        saturation:              "HIGH" or "MEDIUM" or "LOW" — one word only. Base on real competitor density for this specific idea in Jordan.
        marketTrend:             Use the growthTrend field from marketSize_JOD in the sector data: output "GROWING", "STABLE", or "DECLINING" exactly.
        marketTrendReason:       2 sentences, under 45 words. First sentence gives one Jordan-specific stat or trend relevant to this idea. Second sentence explains what this means for the business.
        differentiationAnalysis: 3 sentences, under 60 words total. First explains the current gap in the market. Second describes how this idea fills it. Third states the realistic competitive advantage.
        competitors:             Exactly 3 competitors relevant to THIS specific idea.
                                 STEP 1 — check the knownCompetitors list in the sector data. For each entry, check its relevantSubSectors field. Only use it if it matches this idea's specific sub-sector.
                                 STEP 2 — if a competitor in the data does NOT match this idea (wrong sub-sector, irrelevant product), SKIP it entirely.
                                 STEP 3 — if fewer than 3 relevant competitors exist in the sector data, use your own knowledge of real businesses operating in Jordan to fill the remaining slots.
                                 STEP 4 — never include a competitor that does not actually compete with this specific idea. A gym competitor must never appear for a cafe idea. An invoicing app competitor must never appear for a fitness studio.
                                 Each competitor must have: name, description (phrase under 10 words), threat (HIGH or MEDIUM or LOW), priceRange, targetSegment, mainStrength.
                                 If using a competitor from your own knowledge, still populate all fields with accurate real-world data.

        marketOpportunities:     Exactly 3 opportunities — no more, no less.
                                 Every opportunity MUST have all 3 fields populated. Never leave title empty or generic.

                                 title: 5-8 words describing the specific actionable opportunity.
                                        The title must describe WHAT to do or WHAT the opportunity is — not just name a concept.
                                        BAD title (too vague, just a concept): "Shared office for freelancers"
                                        BAD title (empty or generic): "Growth opportunity" / "Market expansion"
                                        GOOD title: "Target Freelancers Through Coworking Space Partnerships"
                                        GOOD title: "Offer Corporate Wellness Packages to Amman SMEs"

                                 description: 2 sentences, under 45 words.
                                              First sentence describes the opportunity with a Jordan-specific stat or context.
                                              Second sentence explains exactly how to capture it with a concrete action.

                                 benefit: phrase under 10 words, specific and measurable — not vague.
                                          BAD benefit: "Good opportunity" / "Increases revenue"
                                          GOOD benefit: "Cuts customer acquisition cost by up to 40%"
                                          GOOD benefit: "Adds a stable recurring revenue stream"

        Return ONLY valid JSON:
        {"fatalFlaw":"","competitorAnalysis":"","likelyFailureMode":"","marketSize":"","saturation":"","competitors":[{"name":"","description":"","threat":"","priceRange":"","targetSegment":"","mainStrength":""}],"marketOpportunities":[{"title":"","description":"","benefit":""}],"marketTrend":"","marketTrendReason":"","differentiationAnalysis":""}
        """;
        }

        private static int Clamp(int v) => Math.Clamp(v, 0, 100);

    }
}
