using ExchangeHub.Api.Extensions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Rates;
using ExchangeHub.Application.Rates.GetCurrentRates;
using ExchangeHub.Application.Rates.GetHistoricalRates;

namespace ExchangeHub.Api.Endpoints;

public static class RatesEndpoints
{
    public static IEndpointRouteBuilder MapRatesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/rates/current", async (
                IQueryHandler<GetCurrentRatesQuery, ExchangeRateTableDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new GetCurrentRatesQuery(), ct)).ToHttpResult())
            .WithTags("Rates")
            .RequireAuthorization()
            .WithSummary("Current NBP exchange rates (table C: bid and ask), as published")
            .Produces<ExchangeRateTableDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        app.MapGet("/api/rates/{code}/history", async (
                string code,
                DateOnly from,
                DateOnly to,
                IQueryHandler<GetHistoricalRatesQuery, ExchangeRateHistoryDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new GetHistoricalRatesQuery(code, from, to), ct)).ToHttpResult())
            .WithTags("Rates")
            .RequireAuthorization()
            .WithSummary("Historical NBP table C bid/ask rates for one currency")
            .WithDescription("Use inclusive dates from/to in YYYY-MM-DD format, from 2002-01-02 through today (UTC). Long ranges are split automatically. Returns published dates in ascending order; weekends/holidays are omitted, and an empty interval returns an empty rates list.")
            .Produces<ExchangeRateHistoryDto>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        return app;
    }
}
