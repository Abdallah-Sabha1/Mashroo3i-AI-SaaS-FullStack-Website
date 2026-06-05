// Configuration/AIProviderConfig.cs
namespace Mashroo3i.Configuration
{
    public class AIProviderConfig
    {
        public string Active { get; set; } = "Groq";
        public ProviderSettings DeepSeek { get; set; } = new();
        public ProviderSettings Groq { get; set; } = new();
        public ProviderSettings OpenAI { get; set; } = new();

        public ProviderSettings Mistral { get; set; } = new();
    }

    public class ProviderSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = string.Empty;
    }
}