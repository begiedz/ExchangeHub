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
public sealed class SaleTests(ApiFactory factory)
{
    [Fact]
    public async Task TopUp_Buy_Sell_PersistsTheSaleAndCorrectBalances_OnlyForTheOwner()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var (other, _) = await factory.NewAuthenticatedUser();
        await Fund(client);
        var before = DateTime.UtcNow;

        // Neither the wallet owner nor the exchange rate may be selected by the caller.
        var response = await client.PostAsJsonAsync("/api/exchange/sell",
            new { currency = " eur ", amount = "50.00", exchangeRate = 99m, userId = Guid.NewGuid() });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var sale = (await response.Content.ReadFromJsonAsync<TransactionDto>())!;
        Assert.NotEqual(Guid.Empty, sale.Id);
        Assert.Equal("Sale", sale.Type);
        Assert.Equal("EUR", sale.SourceCurrency);
        Assert.Equal(50m, sale.SourceAmount);
        Assert.Equal("PLN", sale.TargetCurrency);
        Assert.Equal(215m, sale.TargetAmount);
        Assert.Equal(4.30m, sale.ExchangeRate);
        Assert.Equal(new DateOnly(2026, 1, 5), sale.NbpTableDate);
        Assert.InRange(sale.CreatedAtUtc, before, DateTime.UtcNow);
        var wallet = await Wallet(client);
        Assert.Equal(775m, wallet.Balances.Single(b => b.CurrencyCode == "PLN").Amount);
        Assert.Equal(50m, wallet.Balances.Single(b => b.CurrencyCode == "EUR").Amount);
        var history = await History(client);
        Assert.Equal(3, history.TotalCount);
        Assert.Equal(sale, history.Items.Single(t => t.Id == sale.Id));
        Assert.Empty((await Wallet(other)).Balances);
        Assert.Empty((await History(other)).Items);
    }

    [Theory]
    [InlineData(null, 1)]
    [InlineData("", 1)]
    [InlineData("PLN", 1)]
    [InlineData("EU", 1)]
    [InlineData("E1R", 1)]
    [InlineData("ZZZ", 1)]
    [InlineData("EUR", 0)]
    [InlineData("EUR", -1)]
    [InlineData("EUR", 1.001)]
    [InlineData("EUR", 1000000.01)]
    public async Task InvalidSale_DoesNotChangeBalancesOrHistory(string? currency, decimal amount)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await Fund(client);
        var beforeWallet = await Wallet(client);
        var beforeHistory = await History(client);

        var response = await client.PostAsJsonAsync("/api/exchange/sell", new { currency, amount });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertUnchanged(client, beforeWallet, beforeHistory);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Sale_RequiresEnoughForeignCurrency_EvenWhenPlnIsAvailable(bool hasForeignCurrency)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        if (hasForeignCurrency) await Fund(client, 1m);
        else await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 1000m });
        var beforeWallet = await Wallet(client);
        var beforeHistory = await History(client);

        var response = await client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount = 1.01m });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Contains("Exchange.InsufficientFunds", await response.Content.ReadAsStringAsync());
        await AssertUnchanged(client, beforeWallet, beforeHistory);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("not.a.jwt")]
    public async Task Sale_RequiresAValidAccessToken(string? token)
    {
        var client = factory.CreateClient();
        if (token is not null) client.DefaultRequestHeaders.Authorization = new("Bearer", token);
        var response = await client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount = 1m });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("unavailable")]
    [InlineData("zero")]
    [InlineData("negative")]
    public async Task MissingOrInvalidBid_LeavesTheWalletAndHistoryUnchanged(string failure)
    {
        var rates = new TestRates();
        using var host = WithRates(rates);
        var (client, _) = await factory.NewAuthenticatedUser(host);
        await Fund(client);
        var beforeWallet = await Wallet(client);
        var beforeHistory = await History(client);
        rates.Unavailable = failure == "unavailable";
        rates.Bid = failure == "negative" ? -1m : 0m;

        var response = await client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount = 1m });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        await AssertUnchanged(client, beforeWallet, beforeHistory);
    }

    [Fact]
    public async Task Sale_RoundsProceedsAwayFromZero_AndPreservesHistoricalBidAndTableDate()
    {
        var rates = new TestRates { Bid = 4.325m };
        using var host = WithRates(rates);
        var (client, _) = await factory.NewAuthenticatedUser(host);
        await Fund(client, 1m);

        var response = await client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount = 1m });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var sale = (await response.Content.ReadFromJsonAsync<TransactionDto>())!;
        Assert.Equal(4.33m, sale.TargetAmount);
        Assert.Equal(4.325m, sale.ExchangeRate);
        Assert.Equal(999.93m, (await Wallet(client)).Balances.Single(b => b.CurrencyCode == "PLN").Amount);
        Assert.Equal(0m, (await Wallet(client)).Balances.Single(b => b.CurrencyCode == "EUR").Amount);

        rates.Bid = 9m;
        rates.TableDate = new DateOnly(2026, 2, 1);
        await client.GetAsync("/api/rates/current");
        Assert.Equal(sale, (await History(client)).Items.Single(t => t.Id == sale.Id));
    }

    [Fact]
    public async Task Sale_RejectsProceedsThatRoundToZero_WithoutDebitingForeignCurrency()
    {
        var rates = new TestRates { Bid = 0.001m };
        using var host = WithRates(rates);
        var (client, _) = await factory.NewAuthenticatedUser(host);
        await Fund(client);
        var beforeWallet = await Wallet(client);
        var beforeHistory = await History(client);

        var response = await client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount = 0.01m });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertUnchanged(client, beforeWallet, beforeHistory);
    }

    [Fact]
    public async Task ConcurrentSales_CannotSellTheSameFundsTwice_AndFailedSalesLeaveNoHistory()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await Fund(client);

        var responses = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ =>
            client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount = 100m })));

        Assert.Equal(1, responses.Count(r => r.StatusCode == HttpStatusCode.Created));
        Assert.All(responses, r => Assert.Contains(r.StatusCode,
            new[] { HttpStatusCode.Created, HttpStatusCode.Conflict, HttpStatusCode.UnprocessableEntity }));
        var wallet = await Wallet(client);
        Assert.Equal(990m, wallet.Balances.Single(b => b.CurrencyCode == "PLN").Amount);
        Assert.Equal(0m, wallet.Balances.Single(b => b.CurrencyCode == "EUR").Amount);
        var history = await History(client);
        Assert.Equal(3, history.TotalCount);
        Assert.Equal(430m, Assert.Single(history.Items, t => t.Type == "Sale").TargetAmount);
    }

    [Fact]
    public async Task ConcurrentBuyingAndSelling_KeepBothBalancesConsistentWithHistory()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await Fund(client);

        var responses = await Task.WhenAll(Enumerable.Range(0, 12).Select(i =>
            client.PostAsJsonAsync(i % 2 == 0 ? "/api/exchange/buy" : "/api/exchange/sell",
                new { currency = "EUR", amount = 1m })));

        Assert.All(responses, r => Assert.Contains(r.StatusCode, new[] { HttpStatusCode.Created, HttpStatusCode.Conflict }));
        var history = await History(client);
        var purchases = history.Items.Where(t => t.Type == "Purchase").ToList();
        var sales = history.Items.Where(t => t.Type == "Sale").ToList();
        Assert.Equal(2 + responses.Count(r => r.StatusCode == HttpStatusCode.Created), history.TotalCount);
        var wallet = await Wallet(client);
        Assert.Equal(1000m - purchases.Sum(t => t.SourceAmount!.Value) + sales.Sum(t => t.TargetAmount),
            wallet.Balances.Single(b => b.CurrencyCode == "PLN").Amount);
        Assert.Equal(purchases.Sum(t => t.TargetAmount) - sales.Sum(t => t.SourceAmount!.Value),
            wallet.Balances.Single(b => b.CurrencyCode == "EUR").Amount);
    }

    private Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program> WithRates(TestRates rates) =>
        factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IExchangeRateProvider>();
            services.AddSingleton<IExchangeRateProvider>(rates);
        }));

    private static async Task Fund(HttpClient client, decimal euros = 100m)
    {
        var topUp = await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 1000m });
        Assert.Equal(HttpStatusCode.OK, topUp.StatusCode);
        var buy = await client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount = euros });
        Assert.Equal(HttpStatusCode.Created, buy.StatusCode);
    }

    private static async Task<WalletDto> Wallet(HttpClient client) =>
        (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!;

    private static async Task<PagedResult<TransactionDto>> History(HttpClient client) =>
        (await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions?pageSize=100"))!;

    private static async Task AssertUnchanged(HttpClient client, WalletDto beforeWallet, PagedResult<TransactionDto> beforeHistory)
    {
        Assert.Equal(beforeWallet.Balances.OrderBy(b => b.CurrencyCode), (await Wallet(client)).Balances.OrderBy(b => b.CurrencyCode));
        var history = await History(client);
        Assert.Equal(beforeHistory.TotalCount, history.TotalCount);
        Assert.Equal(beforeHistory.Items, history.Items);
    }

    private sealed class TestRates : IExchangeRateProvider
    {
        public decimal Bid { get; set; } = 4.30m;
        public bool Unavailable { get; set; }
        public DateOnly TableDate { get; set; } = new(2026, 1, 5);

        public Task<Result<ExchangeRateTableDto>> GetCurrentTable(CancellationToken ct) =>
            Task.FromResult<Result<ExchangeRateTableDto>>(Unavailable ? RatesErrors.Unavailable :
                new ExchangeRateTableDto("1/C/NBP/2026", new DateOnly(2026, 1, 2), TableDate,
                    [new ExchangeRateDto("euro", "EUR", Bid, 4.40m)]));
    }
}
