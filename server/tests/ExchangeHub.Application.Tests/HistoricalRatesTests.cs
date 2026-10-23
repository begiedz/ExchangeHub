using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using ExchangeHub.Application.Rates.GetHistoricalRates;

namespace ExchangeHub.Application.Tests;

public sealed class HistoricalRatesTests
{
    [Theory]
    [InlineData("EU", "2025-01-01", "2025-01-02")]
    [InlineData("E1R", "2025-01-01", "2025-01-02")]
    [InlineData("", "2025-01-01", "2025-01-02")]
    [InlineData("EUR", "2002-01-01", "2025-01-02")]
    [InlineData("EUR", "2025-01-02", "2025-01-01")]
    [InlineData("EUR", "2025-01-01", "2026-01-02")]
    public async Task InvalidInput_IsRejectedBeforeCallingNbp(string code, string from, string to)
    {
        var provider = new FakeHistory();
        var handler = new GetHistoricalRatesHandler(provider, new FakeClock());

        var result = await handler.Handle(new(code, DateOnly.Parse(from), DateOnly.Parse(to)), CancellationToken.None);

        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Equal(0, provider.Calls);
    }

    [Fact]
    public async Task NormalizesCurrency_AndAllowsAnInclusiveRangeThroughToday()
    {
        var provider = new FakeHistory();
        var clock = new FakeClock();
        var from = new DateOnly(2002, 1, 2);
        var to = DateOnly.FromDateTime(clock.UtcNow);
        var handler = new GetHistoricalRatesHandler(provider, clock);

        var result = await handler.Handle(new(" eur ", from, to), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(("EUR", from, to), provider.Request);
        Assert.Equal("EUR", result.Value!.Currency);
    }

    [Theory]
    [InlineData(ErrorType.NotFound)]
    [InlineData(ErrorType.ServiceUnavailable)]
    public async Task ProviderErrors_ArePreserved(ErrorType errorType)
    {
        var error = errorType == ErrorType.NotFound ? RatesErrors.UnsupportedCurrency : RatesErrors.Unavailable;
        var provider = new FakeHistory { Error = error };
        var result = await new GetHistoricalRatesHandler(provider, new FakeClock())
            .Handle(new("EUR", new(2025, 1, 1), new(2025, 1, 2)), CancellationToken.None);
        Assert.Equal(error, result.Error);
    }

    private sealed class FakeHistory : IHistoricalExchangeRateProvider
    {
        public int Calls { get; private set; }
        public (string, DateOnly, DateOnly) Request { get; private set; }
        public Error? Error { get; init; }

        public Task<Result<ExchangeRateHistoryDto>> GetHistory(string currency, DateOnly from, DateOnly to, CancellationToken ct)
        {
            Calls++;
            Request = (currency, from, to);
            return Task.FromResult<Result<ExchangeRateHistoryDto>>(Error is null ? new ExchangeRateHistoryDto(currency, []) : Error);
        }
    }
}
