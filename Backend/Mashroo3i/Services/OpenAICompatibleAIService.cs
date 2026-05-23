// Services/AI/OpenAICompatibleAIService.cs
using Mashroo3i.Configuration;
using Mashroo3i.Services.AI;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Mashroo3i.Services
{
    public class OpenAICompatibleAIService : IAIService
    {
        private readonly HttpClient _http;
        private readonly ProviderSettings _settings;
        private readonly string _completionsUrl;
        private readonly ILogger<OpenAICompatibleAIService> _logger;

        public string ProviderName { get; }

        public OpenAICompatibleAIService(
            IHttpClientFactory httpClientFactory,
            ProviderSettings settings,
            string providerName,
            ILogger<OpenAICompatibleAIService> logger)
        {
            _settings = settings;
            ProviderName = providerName;
            _logger = logger;

            var baseUrl = _settings.BaseUrl.TrimEnd('/');

            _completionsUrl = baseUrl.EndsWith("/v1")
                ? baseUrl + "/chat/completions"
                : baseUrl + "/v1/chat/completions";

            _http = httpClientFactory.CreateClient();
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        }

        public async Task<string> GenerateTextAsync(string prompt, CancellationToken ct = default)
        {
            var requestBody = new
            {
                model = _settings.Model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.4,
                max_tokens = 1500
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation("[{Provider}] POST {Url} | {Length} chars",
                ProviderName, _completionsUrl, prompt.Length);

            HttpResponseMessage response;
            try
            {
                response = await _http.PostAsync(_completionsUrl, content, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[{Provider}] Connection failed to {Url}", ProviderName, _completionsUrl);
                throw new HttpRequestException(
                    $"{ProviderName}: connection failed — {ex.GetType().Name}: {ex.Message}", ex);
            }

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("[{Provider}] HTTP {Status}: {Body}", ProviderName, (int)response.StatusCode, errorBody);
                throw new HttpRequestException(
                    $"{ProviderName} returned HTTP {(int)response.StatusCode}: {errorBody}");
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(responseJson);

            var text = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return text ?? string.Empty;
        }

        public async Task<T> GenerateJsonAsync<T>(string prompt, CancellationToken ct = default) where T : class
        {
            var jsonPrompt =
                prompt +
                "\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no code blocks, no explanation. Just the raw JSON object.";

            var raw = await GenerateTextAsync(jsonPrompt, ct);

            var cleaned = raw.Trim();
            if (cleaned.StartsWith("```"))
            {
                var firstNewline = cleaned.IndexOf('\n');
                var lastFence = cleaned.LastIndexOf("```");
                if (firstNewline >= 0 && lastFence > firstNewline)
                    cleaned = cleaned[(firstNewline + 1)..lastFence].Trim();
            }

            try
            {
                var result = JsonSerializer.Deserialize<T>(cleaned, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                });

                return result ?? throw new JsonException("Deserialization returned null");
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "[{Provider}] Bad JSON: {Raw}", ProviderName, cleaned);
                throw new InvalidOperationException(
                    $"{ProviderName} returned invalid JSON: {cleaned[..Math.Min(300, cleaned.Length)]}", ex);
            }
        }
    }
}