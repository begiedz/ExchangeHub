using ExchangeHub.Api.Extensions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Exchange.Buy;
using ExchangeHub.Application.Exchange.Sell;
using ExchangeHub.Application.Transactions;

namespace ExchangeHub.Api.Endpoints;

public sealed record BuyCurrencyRequest(string? Currency, decimal Amount);
public sealed record SellCurrencyRequest(string? Currency, decimal Amount);

public static class ExchangeEndpoints
{
    public static IEndpointRouteBuilder MapExchangeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/exchange/buy", async (
                BuyCurrencyRequest request,
                HttpContext http,
                ICommandHandler<BuyCurrencyCommand, TransactionDto> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new BuyCurrencyCommand(userId, request.Currency, request.Amount), ct))
                    .ToHttpResult(t => Results.Created("/api/transactions", t))
                : Results.Unauthorized())
            .RequireAuthorization()
            .WithTags("Exchange")
            .WithSummary("Buy foreign currency for PLN at the server's current NBP ask rate")
            .WithDescription("Amount is the quantity of foreign currency to buy (up to 1,000,000, at most two decimal places). PLN cost is rounded to two decimal places, midpoint away from zero. Both balances and history are saved atomically; concurrent changes may return 409.")
            .Produces<TransactionDto>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        app.MapPost("/api/exchange/sell", async (
                SellCurrencyRequest request,
                HttpContext http,
                ICommandHandler<SellCurrencyCommand, TransactionDto> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new SellCurrencyCommand(userId, request.Currency, request.Amount), ct))
                    .ToHttpResult(t => Results.Created("/api/transactions", t))
                : Results.Unauthorized())
            .RequireAuthorization()
            .WithTags("Exchange")
            .WithSummary("Sell foreign currency for PLN at the server's current NBP bid rate")
            .WithDescription("Amount is the quantity of foreign currency to sell (up to 1,000,000, at most two decimal places). PLN proceeds are rounded to two decimal places, midpoint away from zero. Both balances and history are saved atomically; concurrent changes may return 409.")
            .Produces<TransactionDto>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        return app;
    }
}
