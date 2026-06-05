using Mashroo3i.Enums;

namespace Mashroo3i.Models
{
    public class Payment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public decimal Amount { get; set; }
        public string Currency { get; set; } = "JOD";
        public string Provider { get; set; } = "FakeGateway";

        public PaymentStatus Status { get; set; }
        public string TransactionRef { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}