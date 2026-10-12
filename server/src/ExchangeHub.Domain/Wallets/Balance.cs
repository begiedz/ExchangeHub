namespace ExchangeHub.Domain.Wallets;

/// <summary>A user's funds in one currency. The wallet is simply the set of a user's balances.</summary>
public sealed class Balance
{
    public const string BaseCurrency = "PLN";

    private Balance() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string CurrencyCode { get; private set; } = default!;
    public decimal Amount { get; private set; }

    public static Balance Open(Guid userId, string currencyCode) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        CurrencyCode = currencyCode.ToUpperInvariant()
    };

    public void Credit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Credit must be positive.");
        Amount += amount;
    }
}
