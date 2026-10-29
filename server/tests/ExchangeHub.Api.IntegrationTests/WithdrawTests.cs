using System.Net;
using System.Net.Http.Json;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets;

namespace ExchangeHub.Api.IntegrationTests;

[Collection(ApiCollection.Name)]
public sealed class WithdrawTests(ApiFactory factory)
{
    private static readonly CancellationToken Ct = CancellationToken.None;

    private static async Task TopUp(HttpClient client, decimal amount) =>
        Assert.Equal(HttpStatusCode.OK,
            (await client.PostAsJsonAsync("/api/wallet/top-up", new { amount }, Ct)).StatusCode);

    private static Task<HttpResponseMessage> Withdraw(HttpClient client, decimal amount) =>
        client.PostAsJsonAsync("/api/wallet/withdraw", new { amount }, Ct);

    [Fact]
    public async Task Withdraw_ReducesTheBalance_AndAppearsInHistory()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await TopUp(client, 200m);

        var response = await Withdraw(client, 75.5m);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(new BalanceDto("PLN", 124.5m), await response.Content.ReadFromJsonAsync<BalanceDto>(Ct));

        var history = (await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions", Ct))!;
        var newest = history.Items[0];
        Assert.Equal("Withdrawal", newest.Type);
        Assert.Equal(75.5m, newest.SourceAmount);
        Assert.Equal("PLN", newest.SourceCurrency);
        Assert.Null(newest.ExchangeRate);
        Assert.Equal("TopUp", history.Items[1].Type);
    }

    [Fact]
    public async Task Withdraw_MoreThanTheBalance_Gives422_AndLeavesEverythingUntouched()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await TopUp(client, 50m);

        var response = await Withdraw(client, 50.01m);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Contains("Wallet.InsufficientFunds", await response.Content.ReadAsStringAsync(Ct));
        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet", Ct))!;
        Assert.Equal(50m, Assert.Single(wallet.Balances).Amount);
        Assert.Equal(1, (await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions", Ct))!.TotalCount);
    }

    [Fact]
    public async Task Withdraw_WithAnEmptyWallet_Gives422()
    {
        var (client, _) = await factory.NewAuthenticatedUser();

        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Withdraw(client, 1m)).StatusCode);
    }

    [Fact]
    public async Task Withdraw_RejectsBadAmounts_And_RequiresLogin()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await TopUp(client, 100m);

        foreach (var amount in new[] { 0m, -1m, 10.123m, 1_000_000.01m })
            Assert.Equal(HttpStatusCode.BadRequest, (await Withdraw(client, amount)).StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized, (await Withdraw(factory.CreateClient(), 1m)).StatusCode);
    }

    [Fact]
    public async Task Withdraw_CannotTouchAnotherUsersFunds()
    {
        var (alice, _) = await factory.NewAuthenticatedUser();
        var (bob, _) = await factory.NewAuthenticatedUser();
        await TopUp(alice, 100m);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, (await Withdraw(bob, 10m)).StatusCode);
        Assert.Equal(100m, Assert.Single((await alice.GetFromJsonAsync<WalletDto>("/api/wallet", Ct))!.Balances).Amount);
    }

    [Fact]
    public async Task ConcurrentWithdrawals_CanNeverSpendTheSameFundsTwice()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await TopUp(client, 100m);

        // Twelve simultaneous attempts to withdraw the entire balance: at most one may win.
        var responses = await Task.WhenAll(Enumerable.Range(0, 12).Select(_ => Withdraw(client, 100m)));

        Assert.All(responses, r => Assert.Contains(r.StatusCode,
            new[] { HttpStatusCode.OK, HttpStatusCode.Conflict, HttpStatusCode.UnprocessableEntity }));
        Assert.Equal(1, responses.Count(r => r.StatusCode == HttpStatusCode.OK));

        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet", Ct))!;
        Assert.Equal(0m, Assert.Single(wallet.Balances).Amount);

        var history = (await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions", Ct))!;
        Assert.Equal(1, history.Items.Count(t => t.Type == "Withdrawal"));
    }

    [Fact]
    public async Task TopUpsAndWithdrawals_KeepBalanceEqualToHistory()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await TopUp(client, 500m);

        var calls = Enumerable.Range(0, 6).Select(_ => Withdraw(client, 20m))
            .Concat(Enumerable.Range(0, 6).Select(_ => client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 10m }, Ct)));
        await Task.WhenAll(calls);

        var wallet = (await client.GetFromJsonAsync<WalletDto>("/api/wallet", Ct))!;
        var history = (await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions?pageSize=100", Ct))!;
        var fromHistory = history.Items.Sum(t => t.Type == "Withdrawal" ? -t.SourceAmount!.Value : t.TargetAmount);

        // Whatever subset of the racing calls won, balance and ledger must agree to the grosz.
        Assert.Equal(fromHistory, Assert.Single(wallet.Balances).Amount);
    }
}
