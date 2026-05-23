namespace Mashroo3i.Models
{
    public class FinancialProjection
    {
        public Guid PlanId { get; set; } = Guid.NewGuid();
        public Guid IdeaId { get; set; }

        // All 6 slider inputs — stored so user returns to exact same state
        public decimal InitialInvestment  { get; set; }  // CapEx
        public decimal MonthlyCosts       { get; set; }  // OpEx
        public decimal TicketSize         { get; set; }  // avg ticket JOD
        public decimal CustomersPerMonth  { get; set; }  // starting customers/month
        public decimal GrossMarginPct     { get; set; }  // margin %
        public decimal MonthlyGrowthRate  { get; set; }  // growth % per month
        public decimal MonthlyRevenue     { get; set; }  // ticket × customers (stored for reference)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public BusinessIdea BusinessIdea { get; set; } = null!;
    }
}
