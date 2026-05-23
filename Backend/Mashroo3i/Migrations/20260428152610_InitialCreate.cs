using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mashroo3i.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false, defaultValue: "Entrepreneur"),
                    Education = table.Column<string>(type: "text", nullable: false),
                    Experience = table.Column<string>(type: "text", nullable: false),
                    BusinessInterest = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BusinessIdeas",
                columns: table => new
                {
                    IdeaId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ProblemStatement = table.Column<string>(type: "text", nullable: true),
                    TargetAudience = table.Column<string>(type: "text", nullable: true),
                    Usp = table.Column<string>(type: "text", nullable: true),
                    BusinessType = table.Column<string>(type: "text", nullable: false),
                    Sector = table.Column<string>(type: "text", nullable: false),
                    Provinces = table.Column<string>(type: "text", nullable: false),
                    BusinessTypeReason = table.Column<string>(type: "text", nullable: true),
                    EstimatedBudget = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "submitted"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessIdeas", x => x.IdeaId);
                    table.ForeignKey(
                        name: "FK_BusinessIdeas_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Plan = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subscriptions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdeaId = table.Column<Guid>(type: "uuid", nullable: false),
                    OverallScore = table.Column<int>(type: "integer", nullable: false),
                    MarketScore = table.Column<int>(type: "integer", nullable: false),
                    FinancialScore = table.Column<int>(type: "integer", nullable: false),
                    ExecutionScore = table.Column<int>(type: "integer", nullable: false),
                    InnovationScore = table.Column<int>(type: "integer", nullable: false),
                    Verdict = table.Column<string>(type: "text", nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    Strengths = table.Column<string>(type: "text", nullable: false),
                    Concerns = table.Column<string>(type: "text", nullable: false),
                    Recommendations = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvaluationScores_BusinessIdeas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "BusinessIdeas",
                        principalColumn: "IdeaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FinancialPlans",
                columns: table => new
                {
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdeaId = table.Column<Guid>(type: "uuid", nullable: false),
                    InitialInvestment = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyRevenue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyCosts = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BreakEvenMonths = table.Column<int>(type: "integer", nullable: false),
                    RoiPercentage = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    MonthlyProfit = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    GrossMarginPct = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BreakEvenUnits = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    LTV = table.Column<decimal>(type: "numeric", nullable: true),
                    CAC = table.Column<decimal>(type: "numeric", nullable: true),
                    LtvCacRatio = table.Column<decimal>(type: "numeric", nullable: true),
                    ARR = table.Column<decimal>(type: "numeric", nullable: true),
                    FinancialSummary = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialPlans", x => x.PlanId);
                    table.ForeignKey(
                        name: "FK_FinancialPlans_BusinessIdeas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "BusinessIdeas",
                        principalColumn: "IdeaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdeaId = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketSize = table.Column<string>(type: "text", nullable: false),
                    FatalFlaws = table.Column<string>(type: "text", nullable: false),
                    LikelyFailureMode = table.Column<string>(type: "text", nullable: false),
                    CompetitorAnalysis = table.Column<string>(type: "text", nullable: false),
                    Saturation = table.Column<string>(type: "text", nullable: false),
                    CompetitorsJson = table.Column<string>(type: "text", nullable: false),
                    MarketOpportunitiesJson = table.Column<string>(type: "text", nullable: false),
                    MarketTrend = table.Column<string>(type: "text", nullable: false),
                    MarketTrendReason = table.Column<string>(type: "text", nullable: false),
                    DifferentiationAnalysis = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketAnalyses_BusinessIdeas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "BusinessIdeas",
                        principalColumn: "IdeaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SwotAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdeaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Strengths = table.Column<string>(type: "text", nullable: false),
                    Weaknesses = table.Column<string>(type: "text", nullable: false),
                    Opportunities = table.Column<string>(type: "text", nullable: false),
                    Threats = table.Column<string>(type: "text", nullable: false),
                    Risks = table.Column<string>(type: "text", nullable: false),
                    OverallRiskLevel = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SwotAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SwotAnalyses_BusinessIdeas_IdeaId",
                        column: x => x.IdeaId,
                        principalTable: "BusinessIdeas",
                        principalColumn: "IdeaId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TransactionRef = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Payments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BusinessIdeas_UserId",
                table: "BusinessIdeas",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationScores_IdeaId",
                table: "EvaluationScores",
                column: "IdeaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FinancialPlans_IdeaId",
                table: "FinancialPlans",
                column: "IdeaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketAnalyses_IdeaId",
                table: "MarketAnalyses",
                column: "IdeaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_SubscriptionId",
                table: "Payments",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_UserId",
                table: "Payments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_UserId",
                table: "Subscriptions",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SwotAnalyses_IdeaId",
                table: "SwotAnalyses",
                column: "IdeaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EvaluationScores");

            migrationBuilder.DropTable(
                name: "FinancialPlans");

            migrationBuilder.DropTable(
                name: "MarketAnalyses");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "SwotAnalyses");

            migrationBuilder.DropTable(
                name: "Subscriptions");

            migrationBuilder.DropTable(
                name: "BusinessIdeas");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
