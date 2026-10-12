using ExchangeHub.Api.Extensions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Wallets;
using ExchangeHub.Application.Wallets.GetWallet;
using ExchangeHub.Application.Wallets.TopUp;

namespace ExchangeHub.Api.Endpoints;

public sealed record TopUpRequest(decimal Amount);

public static class WalletEndpoints
{
    public static IEndpointRouteBuilder MapWalletEndpoints(this IEndpointRouteBuilder app)
    {
        var wallet = app.MapGroup("/api/wallet").WithTags("Wallet").RequireAuthorization();

        wallet.MapGet("/", async (
                HttpContext http,
                IQueryHandler<GetWalletQuery, WalletDto> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new GetWalletQuery(userId), ct)).ToHttpResult()
                : Results.Unauthorized())
            .WithSummary("Balances of the current user, one entry per currency")
            .Produces<WalletDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        wallet.MapPost("/top-up", async (
                TopUpRequest request,
                HttpContext http,
                ICommandHandler<TopUpCommand, BalanceDto> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new TopUpCommand(userId, request.Amount), ct)).ToHttpResult()
                : Results.Unauthorized())
            .WithSummary("Simulated top-up of the PLN balance")
            .Produces<BalanceDto>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return app;
    }
}
