using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ExchangeHub.Infrastructure.Nbp;

public sealed class NbpOptions
{
    public const string SectionName = "Nbp";
    public const string HttpClientName = "nbp";

    public string BaseUrl { get; init; } = "https://api.nbp.pl/api/";

    /// <summary>NBP publishes at most one table a day, so a short cache is plenty fresh.</summary>
    public TimeSpan CacheDuration { get; init; } = TimeSpan.FromMinutes(15);
}

/// <summary>
/// Reads NBP table C. Fresh data is cached; if NBP is down we keep serving the last good table
/// rather than failing every request.
/// </summary>
internal sealed class NbpExchangeRateProvider(
    IHttpClientFactory httpFactory,
    IOptions<NbpOptions> options,
    IClock clock,
    ILogger<NbpExchangeRateProvider> logger) : IExchangeRateProvider
{
    private static readonly TimeSpan FailureBackoff = TimeSpan.FromMinutes(1);

    private readonly SemaphoreSlim _gate = new(1, 1);
    private ExchangeRateTableDto? _cached;
    private DateTime _nextRefreshUtc;

    public async Task<Result<ExchangeRateTableDto>> GetCurrentTable(CancellationToken ct)
    {
        if (IsFresh()) return _cached!;

        await _gate.WaitAsync(ct);
        try
        {
            if (IsFresh()) return _cached!;

            try
            {
                _cached = await Fetch(ct);
                _nextRefreshUtc = clock.UtcNow + options.Value.CacheDuration;
                return _cached;
            }
            // Anything NBP-side (HTTP, timeout, open circuit, bad payload) degrades to cache/503; only the caller's own cancel propagates.
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                logger.LogWarning(ex, "NBP request failed; {Fallback}",
                    _cached is null ? "no cached table to fall back to" : "serving the last cached table");

                if (_cached is null) return RatesErrors.Unavailable;

                // Back off briefly so an outage does not make every request wait on NBP retries.
                _nextRefreshUtc = clock.UtcNow + FailureBackoff;
                return _cached;
            }
        }
        finally
        {
            _gate.Release();
        }
    }

    private bool IsFresh() => _cached is not null && clock.UtcNow < _nextRefreshUtc;

    private async Task<ExchangeRateTableDto> Fetch(CancellationToken ct)
    {
        var http = httpFactory.CreateClient(NbpOptions.HttpClientName);
        var tables = await http.GetFromJsonAsync<List<NbpTable>>("exchangerates/tables/C/?format=json", ct);

        var table = tables?.FirstOrDefault()
            ?? throw new InvalidOperationException("NBP returned no table.");

        return new ExchangeRateTableDto(
            table.No,
            table.TradingDate,
            table.EffectiveDate,
            table.Rates.Select(r => new ExchangeRateDto(r.Currency, r.Code, r.Bid, r.Ask)).ToList());
    }

    private sealed record NbpTable(
        [property: JsonPropertyName("no")] string No,
        [property: JsonPropertyName("tradingDate")] DateOnly TradingDate,
        [property: JsonPropertyName("effectiveDate")] DateOnly EffectiveDate,
        [property: JsonPropertyName("rates")] List<NbpRate> Rates);

    private sealed record NbpRate(
        [property: JsonPropertyName("currency")] string Currency,
        [property: JsonPropertyName("code")] string Code,
        [property: JsonPropertyName("bid")] decimal Bid,
        [property: JsonPropertyName("ask")] decimal Ask);
}
