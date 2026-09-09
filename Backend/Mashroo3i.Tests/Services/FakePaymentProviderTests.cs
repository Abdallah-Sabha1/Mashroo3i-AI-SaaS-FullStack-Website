using Mashroo3i.Enums;
using Mashroo3i.Services;
using Xunit;

namespace Mashroo3i.Tests.Services;

public class FakePaymentProviderTests
{
    private readonly FakePaymentProvider _provider = new();

    [Fact]
    public void Charge_WithDemoCard_ReturnsSuccessfulPayment()
    {
        var result = _provider.Charge("4242 4242 4242 4242", 3m, "JOD");

        Assert.Equal(PaymentStatus.Success, result.Status);
        Assert.StartsWith("FAKE_TXN_", result.TransactionRef);
        Assert.Null(result.ErrorMessage);
    }

    [Fact]
    public void Charge_WithDifferentCard_ReturnsFailedPayment()
    {
        var result = _provider.Charge("1111 1111 1111 1111", 3m, "JOD");

        Assert.Equal(PaymentStatus.Failed, result.Status);
        Assert.StartsWith("FAKE_TXN_", result.TransactionRef);
        Assert.False(string.IsNullOrWhiteSpace(result.ErrorMessage));
    }

    [Fact]
    public void Charge_RemovesSpacesBeforeCheckingDemoCard()
    {
        var result = _provider.Charge(" 4242 4242 4242 4242 ", 3m, "JOD");

        Assert.Equal(PaymentStatus.Success, result.Status);
    }
}
