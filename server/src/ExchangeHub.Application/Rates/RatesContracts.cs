using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Rates;

/// <summary>One currency as published by NBP table C. Values are passed through untouched.</summary>
public sealed record ExchangeRateDto(string Currency, string Code, decimal Bid, decimal Ask);

public sealed record ExchangeRateTableDto(
    string TableNo,
    DateOnly TradingDate,
    DateOnly EffectiveDate,
    IReadOnlyList<ExchangeRateDto> Rates);

public interface IExchangeRateProvider
{
    /// <summary>Latest published table. When NBP has not published a new one, that is simply the previous table.</summary>
    Task<Result<ExchangeRateTableDto>> GetCurrentTable(CancellationToken ct);
}

public static class RatesErrors
{
    public static readonly Error Unavailable =
        new("Rates.Unavailable", "Exchange rates are temporarily unavailable.", ErrorType.ServiceUnavailable);
}
