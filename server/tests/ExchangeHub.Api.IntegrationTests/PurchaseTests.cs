using System.Net;
using System.Net.Http.Json;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ExchangeHub.Api.IntegrationTests;

[Collection(ApiCollection.Name)]
public sealed class PurchaseTests(ApiFactory factory)
{
    [Fact]
    public async Task Purchase_PersistsAllFields_UpdatesBalances_AndIsVisibleOnlyToItsOwner()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var (other, _) = await factory.NewAuthenticatedUser();
        await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 1000m });
        var before = DateTime.UtcNow;

        // A client-supplied rate and userId must never control the purchase.
        var response = await client.PostAsJsonAsync("/api/exchange/buy",
            new { currency = "eur", amount = "100.00", exchangeRate = 0.01m, userId = Guid.NewGuid() });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var purchase = (await response.Content.ReadFromJsonAsync<TransactionDto>())!;
        Assert.NotEqual(Guid.Empty, purchase.Id);
        Assert.Equal("Purchase", purchase.Type);
        Assert.Equal("PLN", purchase.SourceCurrency);
        Assert.Equal(440m, purchase.SourceAmount);
        Assert.Equal("EUR", purchase.TargetCurrency);
        Assert.Equal(100m, purchase.TargetAmount);
        Assert.Equal(4.40m, purchase.ExchangeRate);
        Assert.Equal(new DateOnly(2026, 1, 5), purchase.NbpTableDate);
        Assert.InRange(purchase.CreatedAtUtc, before, DateTime.UtcNow);

        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!;
        Assert.Equal(560m, wallet.Balances.Single(b => b.CurrencyCode == "PLN").Amount);
        Assert.Equal(100m, wallet.Balances.Single(b => b.CurrencyCode == "EUR").Amount);
        var history = await History(client);
        Assert.Equal(purchase, history.Items.Single(t => t.Id == purchase.Id));
        Assert.Equal(2, history.TotalCount);
        Assert.Empty((await History(other)).Items);
        Assert.Empty((await other.GetFromJsonAsync<WalletDto>("/api/wallet"))!.Balances);
    }

    [Theory]
    [InlineData(null, 1)]
    [InlineData("", 1)]
    [InlineData("PLN", 1)]
    [InlineData("ZZZ", 1)]
    [InlineData("EU", 1)]
    [InlineData("EUR", 0)]
    [InlineData("EUR", -1)]
    [InlineData("EUR", 1.001)]
    [InlineData("EUR", 1000000.01)]
    public async Task InvalidPurchase_DoesNotChangeBalancesOrHistory(string? currency, decimal amount)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 100m });

        var response = await client.PostAsJsonAsync("/api/exchange/buy", new { currency, amount });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!;
        Assert.Equal(100m, Assert.Single(wallet.Balances).Amount);
        Assert.Equal("TopUp", Assert.Single((await History(client)).Items).Type);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task InsufficientFunds_DoesNotCreateCurrencyBalanceOrHistory(bool hasPlnBalance)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        if (hasPlnBalance) await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 4.39m });

        var response = await client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = 1m });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Contains("Exchange.InsufficientFunds", await response.Content.ReadAsStringAsync());
        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!;
        Assert.DoesNotContain(wallet.Balances, b => b.CurrencyCode == "EUR");
        Assert.Equal(hasPlnBalance ? 1 : 0, (await History(client)).TotalCount);
        if (hasPlnBalance) Assert.Equal(4.39m, Assert.Single(wallet.Balances).Amount);
    }

    [Fact]
    public async Task Purchase_RequiresAuthentication()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = 1m });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MissingRates_Returns503_WithoutAnyWalletChange()
    {
        var rates = new TestRates { Unavailable = true };
        using var host = WithRates(rates);
        var (client, _) = await factory.NewAuthenticatedUser(host);
        await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 100m });

        var response = await client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = 1m });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal(100m, Assert.Single((await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!.Balances).Amount);
        Assert.Equal("TopUp", Assert.Single((await History(client)).Items).Type);
    }

    [Fact]
    public async Task Purchase_RoundsPlnCostAwayFromZero_AndKeepsTheOriginalRateInHistory()
    {
        var rates = new TestRates { Ask = 4.325m };
        using var host = WithRates(rates);
        var (client, _) = await factory.NewAuthenticatedUser(host);
        await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 10m });

        var response = await client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = 1m });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var purchase = (await response.Content.ReadFromJsonAsync<TransactionDto>())!;
        Assert.Equal(4.33m, purchase.SourceAmount);
        Assert.Equal(4.325m, purchase.ExchangeRate);
        Assert.Equal(5.67m, (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!.Balances.Single(b => b.CurrencyCode == "PLN").Amount);

        rates.Ask = 9m;
        await client.GetAsync("/api/rates/current");
        Assert.Equal(purchase, (await History(client)).Items.Single(t => t.Id == purchase.Id));
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ConcurrentPurchases_CannotSpendTheSameFunds_AndFailedPurchasesLeaveNoHistory(bool existingTarget)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = existingTarget ? 444.4m : 440m });
        if (existingTarget)
        {
            var first = await client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = 1m });
            Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        }

        var responses = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ =>
            client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = 100m })));

        Assert.Equal(1, responses.Count(r => r.StatusCode == HttpStatusCode.Created));
        Assert.All(responses, r => Assert.Contains(r.StatusCode,
            new[] { HttpStatusCode.Created, HttpStatusCode.Conflict, HttpStatusCode.UnprocessableEntity }));
        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!;
        Assert.Equal(0m, wallet.Balances.Single(b => b.CurrencyCode == "PLN").Amount);
        Assert.Equal(existingTarget ? 101m : 100m, wallet.Balances.Single(b => b.CurrencyCode == "EUR").Amount);
        var history = await History(client);
        Assert.Equal(existingTarget ? 3 : 2, history.TotalCount);
        Assert.Equal(existingTarget ? 444.4m : 440m, history.Items.Where(t => t.Type == "Purchase").Sum(t => t.SourceAmount));
    }

    private Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> WithRates(TestRates rates) =>
        factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IExchangeRateProvider>();
            services.AddSingleton<IExchangeRateProvider>(rates);
        }));

    private static async Task<PagedResult<TransactionDto>> History(HttpClient client) =>
        (await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions?pageSize=100"))!;

    private sealed class TestRates : IExchangeRateProvider
    {
        public decimal Ask { get; set; } = 4.4m;
        public bool Unavailable { get; init; }

        public Task<Result<ExchangeRateTableDto>> GetCurrentTable(CancellationToken ct) =>
            Task.FromResult<Result<ExchangeRateTableDto>>(Unavailable ? RatesErrors.Unavailable :
                new ExchangeRateTableDto("1/C/NBP/2026", new DateOnly(2026, 1, 2), new DateOnly(2026, 1, 5),
                    [new ExchangeRateDto("euro", "EUR", 4.30m, Ask)]));
    }
}
