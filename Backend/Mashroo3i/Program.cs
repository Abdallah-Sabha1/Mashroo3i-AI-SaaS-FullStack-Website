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
    var settings = new ProviderSettings
    {
        ApiKey = config[$"AIProvider:{active}:ApiKey"]!,
        Model = config[$"AIProvider:{active}:Model"]!,
        BaseUrl = config[$"AIProvider:{active}:BaseUrl"]!,
    };
    return new OpenAICompatibleAIService(
        sp.GetRequiredService<IHttpClientFactory>(),
        settings,
        active,
        sp.GetRequiredService<ILogger<OpenAICompatibleAIService>>());
});

builder.Services.AddScoped<BusinessIdeaService>();
builder.Services.AddScoped<EvaluationService>();
builder.Services.AddScoped<IFakePaymentProvider, FakePaymentProvider>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173";
        policy.WithOrigins(allowedOrigins.Split(",", StringSplitOptions.RemoveEmptyEntries))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
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