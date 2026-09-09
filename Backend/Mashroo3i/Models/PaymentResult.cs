using Mashroo3i.Enums;

namespace Mashroo3i.Models
{
    public record PaymentResult(
        PaymentStatus Status,
        string TransactionRef,
        string? ErrorMessage = null);
}
