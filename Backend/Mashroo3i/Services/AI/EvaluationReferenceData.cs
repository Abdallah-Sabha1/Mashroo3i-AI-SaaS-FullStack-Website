using System.Text.Json;
using System.Text.Json.Nodes;
using Mashroo3i.Models;

namespace Mashroo3i.Services;

public class EvaluationReferenceData
{
    private static readonly HashSet<string> NoiseKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "_meta", "label", "labelAr", "examplesAmman",
        "unit", "confidence", "sources", "purpose", "version",
        "lastUpdated", "file", "sectorKey", "message"
    };

    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<EvaluationReferenceData> _logger;

    public EvaluationReferenceData(
        IWebHostEnvironment environment,
        ILogger<EvaluationReferenceData> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public EvaluationReferenceContext Load(BusinessIdea idea)
    {
        var economy = LoadAndCompress("shared", "jordan_economy_snapshot.json");
        var redFlags = LoadAndCompress("shared", "red_flag_rules.json");
        var channels = LoadAndCompress("shared", "acquisition_channels.json");

        var sectorFile = ResolveSectorFile(idea.Sector);
        var sector = sectorFile == null ? null : LoadAndCompress("sectors", sectorFile);

        return new EvaluationReferenceContext(economy, redFlags, channels, sector);
    }

    private string LoadAndCompress(string folder, string fileName)
    {
        var path = Path.Combine(_environment.ContentRootPath, "Data", folder, fileName);
        if (!File.Exists(path))
        {
            _logger.LogWarning("Evaluation reference-data file not found: {Path}", path);
            return "{}";
        }

        return CompressJson(File.ReadAllText(path));
    }

    private static string? ResolveSectorFile(string sector) => sector.ToLowerInvariant() switch
    {
        "tech" or "software" or "tech_software" or "saas" or "app" or "it" => "tech_software.json",
        "food" or "fnb" or "food_and_beverage" or "cafe" or "restaurant" or "coffee" or "catering" or "kitchen" => "food_and_beverage.json",
        "health" or "wellness" or "health_wellness" or "fitness" or "gym" or "medical" or "beauty" or "salon" => "health_wellness.json",
        "education" or "edtech" or "education_training" or "tutoring" or "training" or "school" or "courses" => "education_training.json",
        "professional" or "services" or "professional_services" or "freelance" or "agency" or "consulting" or "design" => "professional_services.json",
        "retail" or "ecommerce" or "retail_ecommerce" or "shop" or "store" or "handmade" or "fashion" => "retail_ecommerce.json",
        _ => null
    };

    private static string CompressJson(string json)
    {
        try
        {
            var node = JsonNode.Parse(json);
            if (node == null)
                return json;

            StripNoise(node);
            return node.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
        }
        catch (JsonException)
        {
            return json;
        }
    }

    private static void StripNoise(JsonNode node)
    {
        if (node is JsonObject jsonObject)
        {
            var keysToRemove = jsonObject
                .Select(property => property.Key)
                .Where(NoiseKeys.Contains)
                .ToList();

            foreach (var key in keysToRemove)
                jsonObject.Remove(key);

            foreach (var property in jsonObject)
                if (property.Value != null)
                    StripNoise(property.Value);
        }
        else if (node is JsonArray jsonArray)
        {
            foreach (var item in jsonArray)
                if (item != null)
                    StripNoise(item);
        }
    }
}

public record EvaluationReferenceContext(
    string Economy,
    string RedFlags,
    string Channels,
    string? Sector);
