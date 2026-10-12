using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Wallets;

namespace ExchangeHub.Application.Transactions.GetTransactions;

public sealed record GetTransactionsQuery(Guid UserId, int Page, int PageSize)
    : IQuery<PagedResult<TransactionDto>>;

internal sealed class GetTransactionsHandler(ITransactionRepository transactions)
    : IQueryHandler<GetTransactionsQuery, PagedResult<TransactionDto>>
{
    public const int MaxPageSize = 100;

    public async Task<Result<PagedResult<TransactionDto>>> Handle(GetTransactionsQuery query, CancellationToken ct)
    {
        if (query.Page < 1)
            return WalletErrors.Validation("Page must be 1 or greater.");
        if (query.PageSize is < 1 or > MaxPageSize)
            return WalletErrors.Validation($"Page size must be between 1 and {MaxPageSize}.");

        var (items, total) = await transactions.GetPage(
            query.UserId, (query.Page - 1) * query.PageSize, query.PageSize, ct);

        return new PagedResult<TransactionDto>(
            items.Select(TransactionDto.From).ToList(), query.Page, query.PageSize, total);
    }
}
