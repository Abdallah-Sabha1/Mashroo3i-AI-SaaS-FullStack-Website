namespace Mashroo3i.DTOs.FinancialPlan;

public class FinancialPlanDto
{
    public Guid PlanId { get; set; }
    public Guid IdeaId { get; set; }
    public decimal InitialInvestment { get; set; }
    public decimal MonthlyCosts { get; set; }
    public decimal TicketSize { get; set; }
    public decimal CustomersPerMonth { get; set; }
    public decimal GrossMarginPct { get; set; }
    public decimal MonthlyGrowthRate { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal EstimatedBudget { get; set; }
}
