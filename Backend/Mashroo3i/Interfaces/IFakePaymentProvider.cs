using Mashroo3i.Models;

namespace Mashroo3i.Interfaces
{
    public interface IFakePaymentProvider
    {
        PaymentResult Charge(string cardNumber, decimal amount, string currency);
    }
}
