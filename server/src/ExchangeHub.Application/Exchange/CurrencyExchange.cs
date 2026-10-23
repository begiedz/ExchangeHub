using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Exchange;

internal enum ExchangeDirection { Buy, Sell }

/// <summary>Shared validation, pricing and atomic balance/history update for buying and selling.</summary>
internal sealed class CurrencyExchange(
    IBalanceRepository balances,
    ITransactionRepository transactions,
    IExchangeRateProvider rates,
    IUnitOfWork uow,
    IClock clock)
{
    private const decimal MaxAmount = 1_000_000m;

    public async Task<Result<TransactionDto>> Execute(Guid userId, string? currencyCode, decimal amount,
        ExchangeDirection direction, CancellationToken ct)
    {
        var currency = currencyCode?.Trim().ToUpperInvariant();
        if (currency is null || currency.Length != 3 || !currency.All(char.IsAsciiLetter) || currency == Balance.BaseCurrency)
            return WalletErrors.Validation("A three-letter foreign currency code is required.");
        if (amount <= 0 || amount > MaxAmount || decimal.Round(amount, 2) != amount)
            return WalletErrors.Validation($"Amount must be positive, at most {MaxAmount:0}, with at most two decimal places.");

        var table = await rates.GetCurrentTable(ct);
        if (table.IsFailure) return table.Error!;
        var rate = table.Value!.Rates.FirstOrDefault(r => r.Code == currency);
        if (rate is null)
            return new Error("Exchange.UnsupportedCurrency", "The currency is not supported.", ErrorType.Validation);

        var buying = direction == ExchangeDirection.Buy;
        var exchangeRate = buying ? rate.Ask : rate.Bid;
        if (exchangeRate <= 0) return RatesErrors.Unavailable;

        // NBP bid/ask are PLN per unit of foreign currency; round the PLN amount to grosze.
        var plnAmount = decimal.Round(amount * exchangeRate, 2, MidpointRounding.AwayFromZero);
        if (plnAmount <= 0) return WalletErrors.Validation("The exchange value rounds to zero PLN.");
        var sourceCurrency = buying ? Balance.BaseCurrency : currency;
        var targetCurrency = buying ? currency : Balance.BaseCurrency;
        var sourceAmount = buying ? plnAmount : amount;
        var targetAmount = buying ? amount : plnAmount;

        var source = await balances.Get(userId, sourceCurrency, ct);
        if (source is null || source.Amount < sourceAmount)
            return new Error("Exchange.InsufficientFunds", $"Insufficient {sourceCurrency} funds.", ErrorType.UnprocessableEntity);

        var target = await balances.Get(userId, targetCurrency, ct);
        if (target is null)
        {
            target = Balance.Open(userId, targetCurrency);
            balances.Add(target);
        }

        source.Debit(sourceAmount);
        target.Credit(targetAmount);
        var transaction = buying
            ? Transaction.Purchase(userId, currency, sourceAmount, targetAmount, exchangeRate, table.Value.EffectiveDate, clock.UtcNow)
            : Transaction.Sale(userId, currency, sourceAmount, targetAmount, exchangeRate, table.Value.EffectiveDate, clock.UtcNow);
        transactions.Add(transaction);

        // One SaveChanges commits both balances and history atomically. xmin detects competing spends.
        await uow.SaveChanges(ct);
        return TransactionDto.From(transaction);
    }
}
