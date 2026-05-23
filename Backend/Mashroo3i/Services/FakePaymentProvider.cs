using Mashroo3i.Enums;

namespace Mashroo3i.Services
{
    // ── Result returned by the provider ──────────────────────────────────
    public record PaymentResult(
        PaymentStatus Status,
        string TransactionRef,
        string? ErrorMessage = null
    );

    // ── Interface ─────────────────────────────────────────────────────────
    public interface IFakePaymentProvider
    {
        PaymentResult Charge(string cardNumber, decimal amount, string currency);
    }

    // ── Implementation ────────────────────────────────────────────────────
    /// <summary>
    /// Simulates a payment gateway for demo/university purposes.
    ///
    /// Rules:
    ///   Card 4242 4242 4242 4242 → always succeeds
    ///   Any other card number    → always fails
    ///
    /// This keeps the demo realistic without touching real money or Stripe.
    /// </summary>
    public class FakePaymentProvider : IFakePaymentProvider
    {
        private const string MagicCard = "4242424242424242";

        public PaymentResult Charge(string cardNumber, decimal amount, string currency)
        {
            // Strip spaces — users might type "4242 4242 4242 4242"
            var normalized = cardNumber.Replace(" ", "").Trim();

            if (normalized == MagicCard)
            {
                return new PaymentResult(
                    Status: PaymentStatus.Success,
                    TransactionRef: $"FAKE_TXN_{Guid.NewGuid():N}"
                );
            }

            return new PaymentResult(
                Status: PaymentStatus.Failed,
                TransactionRef: $"FAKE_TXN_{Guid.NewGuid():N}",
                ErrorMessage: "Your card was declined. Use 4242 4242 4242 4242 to test a successful payment."
            );
        }
    }
}