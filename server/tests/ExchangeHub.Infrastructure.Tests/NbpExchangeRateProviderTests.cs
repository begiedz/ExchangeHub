using System.Net;
using System.Text;
using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Common;
using ExchangeHub.Infrastructure.Nbp;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace ExchangeHub.Infrastructure.Tests;

public class NbpExchangeRateProviderTests
{
    private const string Payload = """
        [{"table":"C","no":"198/C/NBP/2026","tradingDate":"2026-10-09","effectiveDate":"2026-10-12",
          "rates":[{"currency":"dolar amerykański","code":"USD","bid":3.8813,"ask":3.9597},
                   {"currency":"euro","code":"EUR","bid":4.3447,"ask":4.4325}]}]
        """;

    private readonly StubHandler _handler = new();
    private readonly TestClock _clock = new();

    private NbpExchangeRateProvider CreateProvider() => new(
        new StubFactory(_handler),
        Options.Create(new NbpOptions { CacheDuration = TimeSpan.FromMinutes(15) }),
        _clock,
        NullLogger<NbpExchangeRateProvider>.Instance);

    [Fact]
    public async Task ReturnsNbpTableUntouched()
    {
        _handler.Respond(HttpStatusCode.OK, Payload);

        var result = await CreateProvider().GetCurrentTable(CancellationToken.None);

        var table = result.Value!;
        Assert.Equal("198/C/NBP/2026", table.TableNo);
        Assert.Equal(new DateOnly(2026, 10, 12), table.EffectiveDate);
        Assert.Equal(new DateOnly(2026, 10, 9), table.TradingDate);
        var usd = Assert.Single(table.Rates, r => r.Code == "USD");
        Assert.Equal(3.8813m, usd.Bid);
        Assert.Equal(3.9597m, usd.Ask);
    }

    [Fact]
    public async Task CachesWithinTheCacheWindow_ThenRefreshes()
    {
        _handler.Respond(HttpStatusCode.OK, Payload);
        var provider = CreateProvider();

        await provider.GetCurrentTable(CancellationToken.None);
        await provider.GetCurrentTable(CancellationToken.None);
        Assert.Equal(1, _handler.Calls);

        _clock.Advance(TimeSpan.FromMinutes(16));
        await provider.GetCurrentTable(CancellationToken.None);
        Assert.Equal(2, _handler.Calls);
    }

    [Fact]
    public async Task WhenNbpFailsAfterASuccess_ServesLastTable_AndBacksOff()
    {
        _handler.Respond(HttpStatusCode.OK, Payload);
        var provider = CreateProvider();
        await provider.GetCurrentTable(CancellationToken.None);

        _clock.Advance(TimeSpan.FromMinutes(16));
        _handler.Respond(HttpStatusCode.ServiceUnavailable, "");

        var stale = await provider.GetCurrentTable(CancellationToken.None);
        Assert.True(stale.IsSuccess);
        Assert.Equal("198/C/NBP/2026", stale.Value!.TableNo);

        var callsAfterFailure = _handler.Calls;
        await provider.GetCurrentTable(CancellationToken.None);
        Assert.Equal(callsAfterFailure, _handler.Calls); // backoff: no new NBP call right away
    }

    [Fact]
    public async Task WhenNbpFailsWithNothingCached_ReturnsServiceUnavailable()
    {
        _handler.Respond(HttpStatusCode.InternalServerError, "");

        var result = await CreateProvider().GetCurrentTable(CancellationToken.None);

        Assert.Equal(ErrorType.ServiceUnavailable, result.Error!.Type);
    }

    [Fact]
    public async Task EmptyOrMalformedPayload_IsTreatedAsUnavailable()
    {
        _handler.Respond(HttpStatusCode.OK, "[]");
        Assert.True((await CreateProvider().GetCurrentTable(CancellationToken.None)).IsFailure);

        _handler.Respond(HttpStatusCode.OK, "not json");
        Assert.True((await CreateProvider().GetCurrentTable(CancellationToken.None)).IsFailure);
    }

    private sealed class TestClock : IClock
    {
        public DateTime UtcNow { get; private set; } = new(2026, 10, 12, 10, 0, 0, DateTimeKind.Utc);
        public void Advance(TimeSpan by) => UtcNow += by;
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        private HttpStatusCode _status = HttpStatusCode.OK;
        private string _body = "";
        public int Calls { get; private set; }

        public void Respond(HttpStatusCode status, string body) => (_status, _body) = (status, body);

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Calls++;
            return Task.FromResult(new HttpResponseMessage(_status)
            {
                Content = new StringContent(_body, Encoding.UTF8, "application/json")
            });
        }
    }

    private sealed class StubFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false)
        {
            BaseAddress = new Uri("https://api.nbp.pl/api/")
        };
    }
}
