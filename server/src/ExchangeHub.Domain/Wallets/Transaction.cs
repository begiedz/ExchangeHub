namespace ExchangeHub.Domain.Wallets;

public enum TransactionType
{
    TopUp,
    Purchase,
    Sale,
    Withdrawal
}

/// <summary>
/// Immutable record of one completed wallet operation. Once written it never changes, so later rate
/// movements cannot rewrite history: the rate that applied is stored on the row.
/// </summary>
public sealed class Transaction
{
    private Transaction() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public TransactionType Type { get; private set; }

    /// <summary>Currency that was paid out; null for a top-up (money comes from outside the wallet).</summary>
    public string? SourceCurrency { get; private set; }
    public decimal? SourceAmount { get; private set; }

    public string TargetCurrency { get; private set; } = default!;
    public decimal TargetAmount { get; private set; }

    /// <summary>Exchange rate applied; null when no conversion took place (top-up).</summary>
    public decimal? ExchangeRate { get; private set; }

    public DateOnly? NbpTableDate { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    public static Transaction TopUp(Guid userId, decimal amount, DateTime nowUtc) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Type = TransactionType.TopUp,
        TargetCurrency = Balance.BaseCurrency,
        TargetAmount = amount,
        CreatedAtUtc = nowUtc
    };

    /// <summary>
    /// Funds leave the wallet for good (simulated). There is no conversion, so source and target are both the
    /// withdrawn PLN amount and no exchange rate is stored.
    /// </summary>
    public static Transaction Withdrawal(Guid userId, decimal amount, DateTime nowUtc) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Type = TransactionType.Withdrawal,
        SourceCurrency = Balance.BaseCurrency,
        SourceAmount = amount,
        TargetCurrency = Balance.BaseCurrency,
        TargetAmount = amount,
        CreatedAtUtc = nowUtc
    };

    public static Transaction Purchase(Guid userId, string currency, decimal sourceAmount,
        decimal targetAmount, decimal exchangeRate, DateOnly nbpTableDate, DateTime nowUtc) =>
        CreateExchange(userId, TransactionType.Purchase, currency, sourceAmount, targetAmount, exchangeRate, nbpTableDate, nowUtc);

    public static Transaction Sale(Guid userId, string currency, decimal sourceAmount,
        decimal targetAmount, decimal exchangeRate, DateOnly nbpTableDate, DateTime nowUtc) =>
        CreateExchange(userId, TransactionType.Sale, currency, sourceAmount, targetAmount, exchangeRate, nbpTableDate, nowUtc);

    private static Transaction CreateExchange(Guid userId, TransactionType type, string currency, decimal sourceAmount,
        decimal targetAmount, decimal exchangeRate, DateOnly nbpTableDate, DateTime nowUtc)
    {
        if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3 ||
            !currency.All(char.IsAsciiLetter) || currency.Equals(Balance.BaseCurrency, StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("A foreign currency code is required.", nameof(currency));
        if (sourceAmount <= 0) throw new ArgumentOutOfRangeException(nameof(sourceAmount));
        if (targetAmount <= 0) throw new ArgumentOutOfRangeException(nameof(targetAmount));
        if (exchangeRate <= 0) throw new ArgumentOutOfRangeException(nameof(exchangeRate));

        return new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            SourceCurrency = type == TransactionType.Purchase ? Balance.BaseCurrency : currency.ToUpperInvariant(),
            SourceAmount = sourceAmount,
            TargetCurrency = type == TransactionType.Purchase ? currency.ToUpperInvariant() : Balance.BaseCurrency,
            TargetAmount = targetAmount,
            ExchangeRate = exchangeRate,
            NbpTableDate = nbpTableDate,
            // PostgreSQL timestamps retain microseconds. Return exactly the value history will read.
            CreatedAtUtc = nowUtc.AddTicks(-(nowUtc.Ticks % TimeSpan.TicksPerMicrosecond))
        };
    }
}
