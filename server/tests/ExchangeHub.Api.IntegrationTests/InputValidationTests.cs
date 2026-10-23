using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets;
using Microsoft.AspNetCore.Hosting;

namespace ExchangeHub.Api.IntegrationTests;

[Collection(ApiCollection.Name)]
public sealed class InputValidationTests(ApiFactory factory)
{
    [Theory]
    [InlineData("/api/wallet/top-up")]
    [InlineData("/api/exchange/buy")]
    [InlineData("/api/exchange/sell")]
    public async Task InvalidWalletBodies_Return400WithCode_AndDoNotChangeWalletOrHistory(string path)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var bodies = new[]
        {
            "", "null", "[]", "{broken", "{}", "{\"amount\":null}",
            "{\"currency\":\"EUR\",\"amount\":true}",
            "{\"currency\":\"EUR\",\"amount\":\"NaN\"}",
            "{\"currency\":\"EUR\",\"amount\":79228162514264337593543950336}",
            "{\"currency\":\"EUR\",\"amount\":0.001}",
            "{\"currency\":\"EUR\",\"amount\":1000000.01}"
        };
        foreach (var body in bodies)
        {
            var response = await client.PostAsync(path, Json(body));
            await AssertProblem(response, HttpStatusCode.BadRequest);
        }

        Assert.Empty((await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!.Balances);
        Assert.Empty((await client.GetFromJsonAsync<PagedResult<TransactionDto>>("/api/transactions"))!.Items);
    }

    [Theory]
    [InlineData("/api/auth/register")]
    [InlineData("/api/auth/login")]
    [InlineData("/api/auth/refresh")]
    [InlineData("/api/auth/logout")]
    public async Task UnparseableAuthBodies_Return400WithStableCode(string path)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        foreach (var body in new[] { "", "null", "[]", "{broken", "{\"email\":123,\"password\":true,\"refreshToken\":[]}" })
        {
            var response = await client.PostAsync(path, Json(body));
            await AssertProblem(response, HttpStatusCode.BadRequest, "Request.Malformed");
        }
    }

    [Fact]
    public async Task MissingRegistrationFieldsAndOversizedCredentials_AreRejected()
    {
        var client = factory.CreateClient();
        foreach (var credentials in new[]
        {
            new { email = (string?)null, password = (string?)null },
            new { email = (string?)"not-an-email", password = (string?)"Passw0rd123" },
            new { email = (string?)(new string('a', 254) + "@example.com"), password = (string?)"Passw0rd123" },
            new { email = (string?)"valid@example.com", password = (string?)new string('a', 129) }
        })
        {
            await AssertProblem(await client.PostAsJsonAsync("/api/auth/register", credentials), HttpStatusCode.BadRequest, "Auth.Validation");
            await AssertProblem(await client.PostAsJsonAsync("/api/auth/login", credentials), HttpStatusCode.Unauthorized, "Auth.InvalidCredentials");
        }
        await AssertProblem(await client.PostAsync("/api/auth/register", Json("{}")), HttpStatusCode.BadRequest, "Auth.Validation");
        await AssertProblem(await client.PostAsync("/api/auth/refresh", Json("{}")), HttpStatusCode.Unauthorized, "Auth.InvalidRefreshToken");
    }

    [Theory]
    [InlineData("page=2147483647&pageSize=20")]
    [InlineData("page=429496731&pageSize=20")]
    [InlineData("page=21474838&pageSize=100")]
    [InlineData("page=0")]
    [InlineData("page=-1")]
    [InlineData("page=1&pageSize=0")]
    [InlineData("page=1&pageSize=101")]
    [InlineData("page=1.5")]
    [InlineData("page=2147483648")]
    [InlineData("pageSize=")]
    public async Task InvalidPaging_Returns400WithCode(string query)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        await AssertProblem(await client.GetAsync("/api/transactions?" + query), HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task LargestSupportedOffset_ReturnsAnEmptyPageInsteadOfOverflowing()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var response = await client.GetAsync("/api/transactions?page=2147483647&pageSize=1");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty((await response.Content.ReadFromJsonAsync<PagedResult<TransactionDto>>())!.Items);
    }

    [Theory]
    [InlineData(0.01)]
    [InlineData(1000000)]
    public async Task ValidFinancialAmountBoundaries_RemainAccepted(decimal amount)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        // Five top-ups fund even the maximum purchase, each within the top-up limit.
        for (var i = 0; i < 5; i++)
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/wallet/top-up", new { amount = 1000000m })).StatusCode);
        Assert.Equal(HttpStatusCode.Created,
            (await client.PostAsJsonAsync("/api/exchange/buy", new { currency = "EUR", amount })).StatusCode);
        Assert.Equal(HttpStatusCode.Created,
            (await client.PostAsJsonAsync("/api/exchange/sell", new { currency = "EUR", amount })).StatusCode);
        Assert.Equal(0m, (await client.GetFromJsonAsync<WalletDto>("/api/wallet"))!.Balances.Single(b => b.CurrencyCode == "EUR").Amount);
    }

    [Theory]
    [InlineData("Development")]
    [InlineData("Production")]
    public async Task BindingErrors_HaveTheSameProblemFormat_InEveryEnvironment(string environment)
    {
        using var host = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment(environment);
            builder.UseSetting("Auth:Jwt:SigningKey", "validation-tests-signing-key-0123456789");
        });
        var client = host.CreateClient();
        await AssertProblem(await client.PostAsync("/api/auth/register", Json("{broken")), HttpStatusCode.BadRequest, "Request.Malformed");
        var response = await client.PostAsync("/api/auth/register", new StringContent("email=test", Encoding.UTF8, "text/plain"));
        await AssertProblem(response, HttpStatusCode.UnsupportedMediaType, "Request.Malformed");
    }

    private static StringContent Json(string body) => new(body, Encoding.UTF8, "application/json");

    private static async Task AssertProblem(HttpResponseMessage response, HttpStatusCode status, string? code = null)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == status, $"Expected {(int)status}, got {(int)response.StatusCode}: {body}");
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var problem = JsonDocument.Parse(body);
        Assert.Equal((int)status, problem.RootElement.GetProperty("status").GetInt32());
        Assert.True(problem.RootElement.TryGetProperty("code", out var actualCode), $"Missing error code: {body}");
        Assert.False(string.IsNullOrWhiteSpace(actualCode.GetString()));
        if (code is not null) Assert.Equal(code, actualCode.GetString());
        Assert.DoesNotContain("   at ", body);
    }
}
