using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Rates.GetCurrentRates;

public sealed record GetCurrentRatesQuery : IQuery<ExchangeRateTableDto>;

internal sealed class GetCurrentRatesHandler(IExchangeRateProvider provider)
    : IQueryHandler<GetCurrentRatesQuery, ExchangeRateTableDto>
{
    public Task<Result<ExchangeRateTableDto>> Handle(GetCurrentRatesQuery query, CancellationToken ct) =>
        provider.GetCurrentTable(ct);
}
