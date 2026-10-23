using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using ExchangeHub.Infrastructure.Nbp;
using Microsoft.Extensions.Logging.Abstractions;

namespace ExchangeHub.Infrastructure.Tests;

public sealed class NbpHistoricalExchangeRateProviderTests
{
    private readonly StubHandler _http = new();
    private readonly CurrentRates _current = new();
    private NbpHistoricalExchangeRateProvider Provider() => new(
        new HttpFactory(_http), _current, NullLogger<NbpHistoricalExchangeRateProvider>.Instance);

    [Theory]
    [InlineData(1, 1)]
    [InlineData(93, 1)]
    [InlineData(94, 2)]
    [InlineData(186, 2)]
    [InlineData(187, 3)]
    public async Task SplitsInclusiveRangesIntoAtMost93Days_WithoutGapsOrOverlaps(int days, int expectedRequests)
    {
        var from = new DateOnly(2025, 1, 1);
        var to = from.AddDays(days - 1);
        _http.Respond = uri => Payload(Range(uri).From);

        var result = await Provider().GetHistory("EUR", from, to, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(expectedRequests, _http.Requests.Count);
        var expectedStart = from;
        foreach (var uri in _http.Requests)
        {
            var range = Range(uri);
            Assert.Equal(expectedStart, range.From);
            Assert.InRange(range.To.DayNumber - range.From.DayNumber + 1, 1, 93);
            Assert.Contains("/rates/C/EUR/", uri.AbsolutePath);
            Assert.Equal("?format=json", uri.Query);
            expectedStart = range.To.AddDays(1);
        }
        Assert.Equal(to.AddDays(1), expectedStart);
        Assert.Equal(expectedRequests, result.Value!.Rates.Count);
        Assert.Equal(0, _current.Calls);
    }

    [Fact]
    public async Task PreservesBidAndAsk_SortsDates_AndDoesNotRequireCurrentRatesForAvailableHistory()
    {
        _current.Unavailable = true;
        _http.Respond = _ => Json("""
            {"code":"EUR","rates":[
              {"effectiveDate":"2025-01-03","bid":4.2410,"ask":4.3268},
              {"effectiveDate":"2025-01-02","bid":4.22,"ask":4.31}]}
            """);

        var result = await Provider().GetHistory("EUR", new(2025, 1, 1), new(2025, 1, 5), CancellationToken.None);

        Assert.Equal(new HistoricalExchangeRateDto(new(2025, 1, 2), 4.22m, 4.31m), result.Value!.Rates[0]);
        Assert.Equal(new HistoricalExchangeRateDto(new(2025, 1, 3), 4.2410m, 4.3268m), result.Value.Rates[1]);
        Assert.Equal(0, _current.Calls);
    }

    [Fact]
    public async Task EmptyChunk_IsSkipped_AndFollowingChunksAreStillFetched()
    {
        _http.Respond = uri => _http.Requests.Count == 1 ? new(HttpStatusCode.NotFound) : Payload(Range(uri).From);
        var from = new DateOnly(2025, 1, 1);

        var result = await Provider().GetHistory("EUR", from, from.AddDays(93), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(from.AddDays(93), Assert.Single(result.Value!.Rates).Date);
        Assert.Equal(2, _http.Requests.Count);
    }

    [Theory]
    [InlineData("EUR", true)]
    [InlineData("ZZZ", false)]
    [InlineData("PLN", false)]
    public async Task EmptyInterval_IsDistinguishedFromUnsupportedCurrency(string currency, bool supported)
    {
        _http.Respond = _ => new(HttpStatusCode.NotFound);

        var result = await Provider().GetHistory(currency, new(2025, 1, 4), new(2025, 1, 5), CancellationToken.None);

        Assert.Equal(supported, result.IsSuccess);
        if (supported) Assert.Empty(result.Value!.Rates);
        else Assert.Equal(RatesErrors.UnsupportedCurrency, result.Error);
    }

    [Fact]
    public async Task CannotDetermineSupport_WhenBothArchiveAndCurrentRatesAreUnavailable()
    {
        _current.Unavailable = true;
        _http.Respond = _ => new(HttpStatusCode.NotFound);
        var result = await Provider().GetHistory("EUR", new(2025, 1, 4), new(2025, 1, 5), CancellationToken.None);
        Assert.Equal(RatesErrors.Unavailable, result.Error);
    }

    [Theory]
    [InlineData("not json")]
    [InlineData("null")]
    [InlineData("{}")]
    [InlineData("{\"code\":\"USD\",\"rates\":[]}")]
    [InlineData("{\"code\":\"EUR\",\"rates\":[{\"bid\":4,\"ask\":5}]}")]
    [InlineData("{\"code\":\"EUR\",\"rates\":[{\"effectiveDate\":\"2025-01-02\",\"bid\":0,\"ask\":5}]}")]
    [InlineData("{\"code\":\"EUR\",\"rates\":[{\"effectiveDate\":\"2025-02-02\",\"bid\":4,\"ask\":5}]}")]
    public async Task MalformedOrInvalidNbpResponse_Returns503(string body)
    {
        _http.Respond = _ => Json(body);
        var result = await Provider().GetHistory("EUR", new(2025, 1, 1), new(2025, 1, 5), CancellationToken.None);
        Assert.Equal(RatesErrors.Unavailable, result.Error);
    }

    [Fact]
    public async Task FailureInLaterChunk_DoesNotReturnIncompleteHistory()
    {
        _http.Respond = uri => _http.Requests.Count == 1 ? Payload(Range(uri).From) : new(HttpStatusCode.ServiceUnavailable);
        var result = await Provider().GetHistory("EUR", new(2025, 1, 1), new(2025, 5, 1), CancellationToken.None);
        Assert.Equal(RatesErrors.Unavailable, result.Error);
        Assert.Null(result.Value);
        Assert.Equal(2, _http.Requests.Count);
    }

    [Fact]
    public async Task Timeout_Returns503()
    {
        _http.Respond = _ => throw new TaskCanceledException("Upstream timed out");
        var result = await Provider().GetHistory("EUR", new(2025, 1, 1), new(2025, 1, 5), CancellationToken.None);
        Assert.Equal(RatesErrors.Unavailable, result.Error);
    }

    [Fact]
    public async Task CallerCancellation_Propagates()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            Provider().GetHistory("EUR", new(2025, 1, 1), new(2025, 1, 5), cts.Token));
    }

    private static (DateOnly From, DateOnly To) Range(Uri uri)
    {
        var parts = uri.AbsolutePath.Trim('/').Split('/');
        return (DateOnly.ParseExact(parts[^2], "yyyy-MM-dd", CultureInfo.InvariantCulture),
            DateOnly.ParseExact(parts[^1], "yyyy-MM-dd", CultureInfo.InvariantCulture));
    }

    private static HttpResponseMessage Payload(DateOnly date) => Json(JsonSerializer.Serialize(new
    {
        code = "EUR", rates = new[] { new { effectiveDate = date, bid = 4.22m, ask = 4.31m } }
    }));

    private static HttpResponseMessage Json(string body) => new(HttpStatusCode.OK)
    {
        Content = new StringContent(body, Encoding.UTF8, "application/json")
    };

    private sealed class StubHandler : HttpMessageHandler
    {
        public List<Uri> Requests { get; } = [];
        public Func<Uri, HttpResponseMessage> Respond { get; set; } = _ => new(HttpStatusCode.InternalServerError);
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            ct.ThrowIfCancellationRequested();
            Requests.Add(request.RequestUri!);
            return Task.FromResult(Respond(request.RequestUri!));
        }
    }

    private sealed class HttpFactory(StubHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, false) { BaseAddress = new("https://api.nbp.pl/api/") };
    }

    private sealed class CurrentRates : IExchangeRateProvider
    {
        public int Calls { get; private set; }
        public bool Unavailable { get; set; }
        public Task<Result<ExchangeRateTableDto>> GetCurrentTable(CancellationToken ct)
        {
            Calls++;
            return Task.FromResult<Result<ExchangeRateTableDto>>(Unavailable ? RatesErrors.Unavailable :
                new ExchangeRateTableDto("1/C/NBP/2025", new(2025, 1, 3), new(2025, 1, 3),
                    [new("euro", "EUR", 4.22m, 4.31m)]));
        }
    }
}
