namespace Mashroo3i.DTOs.Subscription;

public class PurchaseCreditsResponseDto
{
    public string Message { get; set; } = string.Empty;
    public int CreditsAdded { get; set; }
    public int TotalCredits { get; set; }
    public string TransactionRef { get; set; } = string.Empty;
}
