using System.Net;
using System.Net.Http.Json;

namespace ExchangeHub.Api.IntegrationTests;

[Collection(ApiCollection.Name)]
public class ApiTests(ApiFactory factory)
{
    private const string Password = "Passw0rd123";

    private static readonly CancellationToken Ct = CancellationToken.None;

    [Fact]
    public async Task Health_IsHealthyAndAnonymous()
    {
        var response = await factory.CreateClient().GetAsync("/health", Ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("GET", "/api/users/me")]
    [InlineData("GET", "/api/wallet")]
    [InlineData("POST", "/api/wallet/top-up")]
    [InlineData("GET", "/api/rates/current")]
    [InlineData("POST", "/api/auth/logout")]
    [InlineData("POST", "/api/auth/logout-all")]
    public async Task PrivateEndpoints_RejectAnonymousAndGarbageTokens(string method, string path)
    {
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.SendAsync(new(new(method), path), Ct)).StatusCode);

        var garbage = factory.CreateClient();
        garbage.DefaultRequestHeaders.Authorization = new("Bearer", "not.a.jwt");
        Assert.Equal(HttpStatusCode.Unauthorized, (await garbage.SendAsync(new(new(method), path), Ct)).StatusCode);
    }

    [Fact]
    public async Task RefreshToken_CannotBeUsedAsAccessToken()
    {
        var client = factory.CreateClient();
        var email = $"u-{Guid.NewGuid():N}@example.com";
        await client.PostAsJsonAsync("/api/auth/register", new { email, password = Password }, Ct);
        var tokens = (await (await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password }, Ct))
            .Content.ReadFromJsonAsync<ApiFactory.Tokens>(Ct))!;

        client.DefaultRequestHeaders.Authorization = new("Bearer", tokens.RefreshToken);

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/users/me", Ct)).StatusCode);
    }

    [Fact]
    public async Task Register_Login_Me_FullFlow_WithCaseInsensitiveEmail()
    {
        var client = factory.CreateClient();
        var email = $"flow-{Guid.NewGuid():N}@example.com";

        Assert.Equal(HttpStatusCode.Created,
            (await client.PostAsJsonAsync("/api/auth/register", new { email = email.ToUpperInvariant(), password = Password }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,
            (await client.PostAsJsonAsync("/api/auth/register", new { email, password = Password }, Ct)).StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password }, Ct);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var tokens = (await login.Content.ReadFromJsonAsync<ApiFactory.Tokens>(Ct))!;

        client.DefaultRequestHeaders.Authorization = new("Bearer", tokens.AccessToken);
        var me = await client.GetFromJsonAsync<Me>("/api/users/me", Ct);
        Assert.Equal(email, me!.Email);
    }

    [Fact]
    public async Task RefreshRotation_AndReplayRevokesTheChain()
    {
        var client = factory.CreateClient();
        var email = $"rot-{Guid.NewGuid():N}@example.com";
        await client.PostAsJsonAsync("/api/auth/register", new { email, password = Password }, Ct);
        var first = (await (await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password }, Ct))
            .Content.ReadFromJsonAsync<ApiFactory.Tokens>(Ct))!;

        var rotated = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = first.RefreshToken }, Ct);
        Assert.Equal(HttpStatusCode.OK, rotated.StatusCode);
        var second = (await rotated.Content.ReadFromJsonAsync<ApiFactory.Tokens>(Ct))!;

        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = first.RefreshToken }, Ct)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = second.RefreshToken }, Ct)).StatusCode);
    }

    [Fact]
    public async Task LogoutAll_KillsRefreshTokensOnEveryDevice()
    {
        var (device1, email) = await factory.NewAuthenticatedUser();
        var other = factory.CreateClient();
        var second = (await (await other.PostAsJsonAsync("/api/auth/login", new { email, password = Password }, Ct))
            .Content.ReadFromJsonAsync<ApiFactory.Tokens>(Ct))!;

        Assert.Equal(HttpStatusCode.NoContent, (await device1.PostAsync("/api/auth/logout-all", null, Ct)).StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized,
            (await other.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = second.RefreshToken }, Ct)).StatusCode);
    }

    [Fact]
    public async Task LoginIsLockedAfterRepeatedFailures()
    {
        var client = factory.CreateClient();
        var email = $"lock-{Guid.NewGuid():N}@example.com";
        await client.PostAsJsonAsync("/api/auth/register", new { email, password = Password }, Ct);

        var codes = new List<HttpStatusCode>();
        for (var i = 0; i < 6; i++)
            codes.Add((await client.PostAsJsonAsync("/api/auth/login", new { email, password = "wrongPass1" }, Ct)).StatusCode);

        Assert.Equal(HttpStatusCode.TooManyRequests, codes[^1]);
        Assert.Equal(HttpStatusCode.TooManyRequests,
            (await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password }, Ct)).StatusCode);
    }

    [Fact]
    public async Task Wallet_IsIsolatedPerUser()
    {
        var (alice, _) = await factory.NewAuthenticatedUser();
        var (bob, _) = await factory.NewAuthenticatedUser();

        await alice.PostAsJsonAsync("/api/wallet/top-up", new { amount = 250.5m }, Ct);

        var aliceWallet = await alice.GetFromJsonAsync<Wallet>("/api/wallet", Ct);
        var bobWallet = await bob.GetFromJsonAsync<Wallet>("/api/wallet", Ct);

        Assert.Equal(250.5m, Assert.Single(aliceWallet!.Balances).Amount);
        Assert.Empty(bobWallet!.Balances);
    }

    [Fact]
    public async Task TopUp_RejectsBadAmounts()
    {
        var (client, _) = await factory.NewAuthenticatedUser();

        foreach (var amount in new[] { 0m, -1m, 10.123m, 1_000_000.01m })
            Assert.Equal(HttpStatusCode.BadRequest,
                (await client.PostAsJsonAsync("/api/wallet/top-up", new { amount }, Ct)).StatusCode);
    }

    [Fact]
    public async Task ConcurrentTopUps_NeverLoseMoney()
    {
        var (client, _) = await factory.NewAuthenticatedUser();

        var responses = await Task.WhenAll(Enumerable.Range(0, 12)
            .Select(_ => client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 10m }, Ct)));

        Assert.All(responses, r => Assert.Contains(r.StatusCode, new[] { HttpStatusCode.OK, HttpStatusCode.Conflict }));
        var succeeded = responses.Count(r => r.StatusCode == HttpStatusCode.OK);

        var wallet = await client.GetFromJsonAsync<Wallet>("/api/wallet", Ct);
        Assert.Equal(succeeded * 10m, Assert.Single(wallet!.Balances).Amount);
    }

    [Fact]
    public async Task Rates_AreReturnedForAuthenticatedUsers()
    {
        var (client, _) = await factory.NewAuthenticatedUser();

        var table = await client.GetFromJsonAsync<RateTable>("/api/rates/current", Ct);

        Assert.Equal("EUR", Assert.Single(table!.Rates).Code);
    }

    [Fact]
    public async Task MalformedJson_Gives400ProblemDetails_NotAStackTrace()
    {
        var response = await factory.CreateClient().PostAsync("/api/auth/login",
            new StringContent("{broken", System.Text.Encoding.UTF8, "application/json"), Ct);
        var body = await response.Content.ReadAsStringAsync(Ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.DoesNotContain("   at ", body);
    }

    private sealed record Me(Guid Id, string Email);
    private sealed record Balance(string CurrencyCode, decimal Amount);
    private sealed record Wallet(List<Balance> Balances);
    private sealed record Rate(string Code);
    private sealed record RateTable(List<Rate> Rates);
}
