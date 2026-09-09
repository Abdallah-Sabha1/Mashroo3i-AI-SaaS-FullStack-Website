namespace Mashroo3i.DTOs.FinancialPlan
{
    public class InsightsRequestDto
    {
        public string SectorLabel { get; set; } = string.Empty;
        public decimal CapEx { get; set; }
        public decimal OpEx { get; set; }
        public decimal Ticket { get; set; }
        public decimal Customers { get; set; }
        public decimal Margin { get; set; }
        public decimal Growth { get; set; }
        public decimal Year1Revenue { get; set; }
        public decimal Year1Profit { get; set; }
        public decimal Year1Cogs { get; set; }
        public decimal Year1Opex { get; set; }
        public decimal Roi { get; set; }
        public int? BreakEvenMonth { get; set; }
    }
}
