using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Transactions;

public sealed record TransactionDto(
    Guid Id,
    string Type,
    string? SourceCurrency,
    decimal? SourceAmount,
    string TargetCurrency,
    decimal TargetAmount,
    decimal? ExchangeRate,
    DateTime CreatedAtUtc)
{
    public static TransactionDto From(Transaction t) => new(
        t.Id, t.Type.ToString(), t.SourceCurrency, t.SourceAmount,
        t.TargetCurrency, t.TargetAmount, t.ExchangeRate, t.CreatedAtUtc);
}

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public interface ITransactionRepository
{
    void Add(Transaction transaction);

    /// <summary>One page of a user's history, newest first.</summary>
    Task<(IReadOnlyList<Transaction> Items, int Total)> GetPage(Guid userId, int skip, int take, CancellationToken ct);
}
