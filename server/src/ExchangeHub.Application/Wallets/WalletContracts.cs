using ExchangeHub.Application.Common;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Wallets;

public sealed record BalanceDto(string CurrencyCode, decimal Amount);

public sealed record WalletDto(IReadOnlyList<BalanceDto> Balances);

public interface IBalanceRepository
{
    Task<IReadOnlyList<Balance>> GetForUser(Guid userId, CancellationToken ct);
    Task<Balance?> Get(Guid userId, string currencyCode, CancellationToken ct);
    void Add(Balance balance);
}

/// <summary>Thrown by persistence when a balance was changed by someone else between read and write.</summary>
public sealed class ConcurrencyConflictException(Exception inner)
    : Exception("The data was modified by another operation.", inner);

public static class WalletErrors
{
    public static Error Validation(string description) => new("Wallet.Validation", description, ErrorType.Validation);

    public static readonly Error InsufficientFunds =
        new("Wallet.InsufficientFunds", "Insufficient PLN funds.", ErrorType.UnprocessableEntity);
}
