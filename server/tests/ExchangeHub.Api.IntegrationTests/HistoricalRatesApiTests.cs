using System.Net;
using System.Net.Http.Json;
using ExchangeHub.Application.Rates;

namespace ExchangeHub.Api.IntegrationTests;

[Collection(ApiCollection.Name)]
public sealed class HistoricalRatesApiTests(ApiFactory factory)
{
    [Fact]
    public async Task History_ReturnsPublishedDatesAndBothRates_ForNormalizedCurrency()
    {
        var (client, _) = await factory.NewAuthenticatedUser();

        var response = await client.GetAsync("/api/rates/eur/history?from=2025-01-01&to=2025-01-05");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var history = (await response.Content.ReadFromJsonAsync<ExchangeRateHistoryDto>())!;
        Assert.Equal("EUR", history.Currency);
        Assert.Equal(new HistoricalExchangeRateDto(new(2025, 1, 2), 4.22m, 4.31m), history.Rates[0]);
        Assert.Equal(new HistoricalExchangeRateDto(new(2025, 1, 3), 4.2410m, 4.3268m), history.Rates[1]);
        Assert.Equal(2, history.Rates.Count);
    }

    [Fact]
    public async Task WeekendWithoutPublications_Returns200AndAnEmptyList()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var response = await client.GetAsync("/api/rates/EUR/history?from=2025-01-04&to=2025-01-05");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty((await response.Content.ReadFromJsonAsync<ExchangeRateHistoryDto>())!.Rates);
    }

    [Fact]
    public async Task SameDayRange_IncludesThatDaysPublication()
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var history = await client.GetFromJsonAsync<ExchangeRateHistoryDto>("/api/rates/EUR/history?from=2025-01-02&to=2025-01-02");
        Assert.Equal(new DateOnly(2025, 1, 2), Assert.Single(history!.Rates).Date);
    }

    [Theory]
    [InlineData("/api/rates/EUR/history")]
    [InlineData("/api/rates/EUR/history?from=2025-01-01")]
    [InlineData("/api/rates/EUR/history?from=invalid&to=2025-01-05")]
    [InlineData("/api/rates/EUR/history?from=2025-02-30&to=2025-03-01")]
    [InlineData("/api/rates/EUR/history?from=2025-01-05&to=2025-01-01")]
    [InlineData("/api/rates/EUR/history?from=2002-01-01&to=2025-01-01")]
    [InlineData("/api/rates/EUR/history?from=2025-01-01&to=9999-12-31")]
    [InlineData("/api/rates/E1R/history?from=2025-01-01&to=2025-01-05")]
    public async Task InvalidOrMissingDatesAndCodes_Return400(string path)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(path)).StatusCode);
    }

    [Theory]
    [InlineData("ZZZ", HttpStatusCode.NotFound, "Rates.UnsupportedCurrency")]
    [InlineData("PLN", HttpStatusCode.NotFound, "Rates.UnsupportedCurrency")]
    [InlineData("USD", HttpStatusCode.ServiceUnavailable, "Rates.Unavailable")]
    public async Task ProviderErrors_ReturnTheExpectedStatusAndCode(string currency, HttpStatusCode status, string code)
    {
        var (client, _) = await factory.NewAuthenticatedUser();
        var response = await client.GetAsync($"/api/rates/{currency}/history?from=2025-01-01&to=2025-01-05");
        Assert.Equal(status, response.StatusCode);
        Assert.Contains(code, await response.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("not.a.jwt")]
    public async Task History_RequiresAValidAccessToken(string? token)
    {
        var client = factory.CreateClient();
        if (token is not null) client.DefaultRequestHeaders.Authorization = new("Bearer", token);
        var response = await client.GetAsync("/api/rates/EUR/history?from=2025-01-01&to=2025-01-05");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
