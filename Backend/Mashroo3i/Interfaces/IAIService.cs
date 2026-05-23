// Services/AI/IAIService.cs
namespace Mashroo3i.Services.AI
{
    /// Generic AI service for text/JSON generation
    /// Agnostic to what you're generating - market analysis, business plans, whatever
    public interface IAIService
    {
        /// Generate raw text response from AI
        /// Use for unstructured content (essays, descriptions, etc.)
        Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default);

        /// Generate structured JSON response from AI
        /// AI returns JSON, we deserialize to your type
        Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class;

        /// Provider name for logging (DeepSeek, Groq, OpenAI)
        string ProviderName { get; }
    }
}