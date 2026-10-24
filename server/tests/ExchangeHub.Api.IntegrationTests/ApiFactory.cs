using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using System.Net.Http.Json;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;

namespace ExchangeHub.Api.IntegrationTests;

/// <summary>One real Postgres per test run; the API applies its own migrations on startup (Development).</summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder().WithImage("postgres:17").Build();

    Task IAsyncLifetime.InitializeAsync() => _db.StartAsync();

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _db.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:Database", _db.GetConnectionString());
        // Secrets are not in any appsettings file, so each run signs tokens with its own random key.
        builder.UseSetting("Auth:Jwt:SigningKey",
            Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(48)));

        // NBP is an external service: tests must not depend on it being up.
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IExchangeRateProvider>();
            services.AddSingleton<IExchangeRateProvider, FakeRates>();
            services.RemoveAll<IHistoricalExchangeRateProvider>();
            services.AddSingleton<IHistoricalExchangeRateProvider, FakeHistoricalRates>();
        });
    }

    public async Task<(HttpClient Client, string Email)> NewAuthenticatedUser(WebApplicationFactory<Program>? host = null)
    {
        var client = (host ?? this).CreateClient();
        var email = $"user-{Guid.NewGuid():N}@example.com";

        await client.PostAsJsonAsync("/api/auth/register", new { email, password = "Passw0rd123" });
        var tokens = await (await client.PostAsJsonAsync("/api/auth/login", new { email, password = "Passw0rd123" }))
            .Content.ReadFromJsonAsync<Tokens>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        return (client, email);
    }

    public sealed record Tokens(string AccessToken, string RefreshToken);

    private sealed class FakeRates : IExchangeRateProvider
    {
        public Task<Result<ExchangeRateTableDto>> GetCurrentTable(CancellationToken ct) =>
            Task.FromResult<Result<ExchangeRateTableDto>>(new ExchangeRateTableDto(
                "1/C/NBP/2026", new DateOnly(2026, 1, 2), new DateOnly(2026, 1, 5),
                [new ExchangeRateDto("euro", "EUR", 4.30m, 4.40m)]));
    }

    private sealed class FakeHistoricalRates : IHistoricalExchangeRateProvider
    {
        public Task<Result<ExchangeRateHistoryDto>> GetHistory(string currency, DateOnly from, DateOnly to, CancellationToken ct) =>
            Task.FromResult<Result<ExchangeRateHistoryDto>>(currency switch
            {
                "EUR" => new ExchangeRateHistoryDto(currency,
                    new HistoricalExchangeRateDto[]
                    {
                        new(new(2025, 1, 2), 4.22m, 4.31m),
                        new(new(2025, 1, 3), 4.2410m, 4.3268m)
                    }.Where(r => r.Date >= from && r.Date <= to).ToList()),
                "USD" => RatesErrors.Unavailable,
                _ => RatesErrors.UnsupportedCurrency
            });
    }
}

[CollectionDefinition(Name)]
public sealed class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
