using ExchangeHub.Api.Extensions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Transactions.GetTransactions;

namespace ExchangeHub.Api.Endpoints;

public static class TransactionEndpoints
{
    public static IEndpointRouteBuilder MapTransactionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/transactions", async (
                HttpContext http,
                IQueryHandler<GetTransactionsQuery, PagedResult<TransactionDto>> handler,
                CancellationToken ct,
                int page = 1,
                int pageSize = 20) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new GetTransactionsQuery(userId, page, pageSize), ct)).ToHttpResult()
                : Results.Unauthorized())
            .WithTags("Transactions")
            .RequireAuthorization()
            .WithSummary("Transaction history of the current user, newest first")
            .Produces<PagedResult<TransactionDto>>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        return app;
    }
}
