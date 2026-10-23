using System.Net;
using System.Net.Http.Json;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using Microsoft.Extensions.Logging;

namespace ExchangeHub.Infrastructure.Nbp;

internal sealed class NbpHistoricalExchangeRateProvider(
    IHttpClientFactory httpFactory,
    IExchangeRateProvider currentRates,
    ILogger<NbpHistoricalExchangeRateProvider> logger) : IHistoricalExchangeRateProvider
{
    // https://api.nbp.pl/: one query covers at most 93 calendar days, including both endpoints.
    private const int MaxDaysPerRequest = 93;

    public async Task<Result<ExchangeRateHistoryDto>> GetHistory(string currency, DateOnly from, DateOnly to, CancellationToken ct)
    {
        try
        {
            var http = httpFactory.CreateClient(NbpOptions.HttpClientName);
            var rates = new List<HistoricalExchangeRateDto>();
            for (var start = from; start <= to;)
            {
                var end = start.AddDays(Math.Min(MaxDaysPerRequest - 1, to.DayNumber - start.DayNumber));
                var path = FormattableString.Invariant($"exchangerates/rates/C/{currency}/{start:yyyy-MM-dd}/{end:yyyy-MM-dd}/?format=json");
                using var response = await http.GetAsync(path, ct);
                if (response.StatusCode != HttpStatusCode.NotFound)
                {
                    response.EnsureSuccessStatusCode();
                    var data = await response.Content.ReadFromJsonAsync<NbpHistory>(ct);
                    if (data is null || data.Code != currency || data.Rates is null ||
                        data.Rates.Any(r => r.EffectiveDate < start || r.EffectiveDate > end || r.Bid <= 0 || r.Ask <= 0))
                        throw new InvalidOperationException("NBP returned invalid historical rates.");
                    rates.AddRange(data.Rates.Select(r => new HistoricalExchangeRateDto(r.EffectiveDate, r.Bid, r.Ask)));
                }

                if (end == to) break;
                start = end.AddDays(1);
            }

            // NBP uses 404 for both unknown currencies and empty intervals (weekends/holidays).
            // Successful archive responses stand on their own, including currencies retired from table C.
            if (rates.Count == 0)
            {
                var current = await currentRates.GetCurrentTable(ct);
                if (current.IsFailure) return current.Error!;
                if (!current.Value!.Rates.Any(r => r.Code == currency)) return RatesErrors.UnsupportedCurrency;
            }

            return new ExchangeRateHistoryDto(currency, rates.OrderBy(r => r.Date).DistinctBy(r => r.Date).ToList());
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            logger.LogWarning(ex, "NBP historical rates request failed for {Currency} ({From} to {To})", currency, from, to);
            return RatesErrors.Unavailable;
        }
    }

    private sealed record NbpHistory(string Code, List<NbpHistoricalRate>? Rates);
    private sealed record NbpHistoricalRate(DateOnly EffectiveDate, decimal Bid, decimal Ask);
}
