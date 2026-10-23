namespace ExchangeHub.Domain.Wallets;

public enum TransactionType
{
    TopUp,
    Purchase,
    Sale
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

    public static Transaction Purchase(Guid userId, string currency, decimal sourceAmount,
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
            Type = TransactionType.Purchase,
            SourceCurrency = Balance.BaseCurrency,
            SourceAmount = sourceAmount,
            TargetCurrency = currency.ToUpperInvariant(),
            TargetAmount = targetAmount,
            ExchangeRate = exchangeRate,
            NbpTableDate = nbpTableDate,
            // PostgreSQL timestamps retain microseconds. Return exactly the value history will read.
            CreatedAtUtc = nowUtc.AddTicks(-(nowUtc.Ticks % TimeSpan.TicksPerMicrosecond))
        };
    }
}
