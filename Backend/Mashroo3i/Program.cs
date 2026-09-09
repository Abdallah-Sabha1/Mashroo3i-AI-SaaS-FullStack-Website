using Mashroo3i.Configuration;
using Mashroo3i.Data;
using Mashroo3i.Interfaces;
using Mashroo3i.Services;
using Mashroo3i.Services.AI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IAIService>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var active = config["AIProvider:Active"] ?? "Groq";
    var providerSection = $"AIProvider:{active}";

    string GetRequiredSetting(string name)
    {
        var key = $"{providerSection}:{name}";
        var value = config[key];
        return !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new InvalidOperationException(
                $"Required configuration '{key}' is missing. Add it to appsettings.Development.json or environment variables.");
    }

    var settings = new ProviderSettings
    {
        ApiKey = GetRequiredSetting("ApiKey"),
        Model = GetRequiredSetting("Model"),
        BaseUrl = GetRequiredSetting("BaseUrl"),
    };
    return new OpenAICompatibleAIService(
        sp.GetRequiredService<IHttpClientFactory>(),
        settings,
        active,
        sp.GetRequiredService<ILogger<OpenAICompatibleAIService>>());
});

builder.Services.AddScoped<BusinessIdeaService>();
builder.Services.AddSingleton<EvaluationReferenceData>();
builder.Services.AddScoped<EvaluationService>();
builder.Services.AddSingleton<EvaluationBackgroundRunner>();
builder.Services.AddScoped<IFakePaymentProvider, FakePaymentProvider>();

string GetRequiredConfiguration(string key)
{
    var value = builder.Configuration[key];
    return !string.IsNullOrWhiteSpace(value)
        ? value
        : throw new InvalidOperationException($"Required configuration '{key}' is missing.");
}

var jwtKey = GetRequiredConfiguration("Jwt:Key");
var jwtIssuer = GetRequiredConfiguration("Jwt:Issuer");
var jwtAudience = GetRequiredConfiguration("Jwt:Audience");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
