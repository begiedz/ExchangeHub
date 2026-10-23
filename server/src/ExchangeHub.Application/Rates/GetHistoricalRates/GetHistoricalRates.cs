using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Rates.GetHistoricalRates;

public sealed record GetHistoricalRatesQuery(string Code, DateOnly From, DateOnly To) : IQuery<ExchangeRateHistoryDto>;

internal sealed class GetHistoricalRatesHandler(IHistoricalExchangeRateProvider provider, IClock clock)
    : IQueryHandler<GetHistoricalRatesQuery, ExchangeRateHistoryDto>
{
    private static readonly DateOnly ArchiveStart = new(2002, 1, 2);

    public Task<Result<ExchangeRateHistoryDto>> Handle(GetHistoricalRatesQuery query, CancellationToken ct)
    {
        var code = query.Code?.Trim().ToUpperInvariant();
        if (code is null || code.Length != 3 || !code.All(char.IsAsciiLetter))
            return Task.FromResult<Result<ExchangeRateHistoryDto>>(RatesErrors.Validation("A three-letter currency code is required."));
        if (query.From < ArchiveStart || query.From > query.To || query.To > DateOnly.FromDateTime(clock.UtcNow))
            return Task.FromResult<Result<ExchangeRateHistoryDto>>(RatesErrors.Validation(
                "Dates must satisfy 2002-01-02 <= from <= to <= today (UTC)."));

        return provider.GetHistory(code, query.From, query.To, ct);
    }
}
