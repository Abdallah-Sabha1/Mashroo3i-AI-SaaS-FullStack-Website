namespace Mashroo3i.DTOs.FinancialPlan
{
    public class SaveFinancialPlanDto
    {
        public decimal CapEx { get; set; }
        public decimal OpEx { get; set; }
        public decimal TicketSize { get; set; }
        public decimal CustomersPerMonth { get; set; }
        public decimal GrossMargin { get; set; }
        public decimal MonthlyGrowth { get; set; }
    }
}
