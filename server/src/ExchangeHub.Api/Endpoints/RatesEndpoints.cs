using ExchangeHub.Api.Extensions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Rates;
using ExchangeHub.Application.Rates.GetCurrentRates;

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

        return app;
    }
}
