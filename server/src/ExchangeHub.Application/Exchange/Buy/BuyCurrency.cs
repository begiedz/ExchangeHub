using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Rates;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Exchange.Buy;

/// <param name="Amount">Amount of foreign currency to buy, not the cost in PLN.</param>
public sealed record BuyCurrencyCommand(Guid UserId, string? Currency, decimal Amount) : ICommand<TransactionDto>;

internal sealed class BuyCurrencyHandler(
    IBalanceRepository balances,
    ITransactionRepository transactions,
    IExchangeRateProvider rates,
    IUnitOfWork uow,
    IClock clock) : ICommandHandler<BuyCurrencyCommand, TransactionDto>
{
    public const decimal MaxAmount = 1_000_000m;

    public async Task<Result<TransactionDto>> Handle(BuyCurrencyCommand command, CancellationToken ct)
    {
        var currency = command.Currency?.Trim().ToUpperInvariant();
        if (currency is null || currency.Length != 3 || !currency.All(char.IsAsciiLetter) || currency == Balance.BaseCurrency)
            return WalletErrors.Validation("A three-letter foreign currency code is required.");
        if (command.Amount <= 0 || command.Amount > MaxAmount || decimal.Round(command.Amount, 2) != command.Amount)
            return WalletErrors.Validation($"Amount must be positive, at most {MaxAmount:0}, with at most two decimal places.");

        var table = await rates.GetCurrentTable(ct);
        if (table.IsFailure) return table.Error!;
        var rate = table.Value!.Rates.FirstOrDefault(r => r.Code == currency);
        if (rate is null)
            return new Error("Exchange.UnsupportedCurrency", "The currency is not supported.", ErrorType.Validation);
        if (rate.Ask <= 0) return RatesErrors.Unavailable;

        // NBP ask is PLN per unit of foreign currency. Round the actual debit to grosze.
        var cost = decimal.Round(command.Amount * rate.Ask, 2, MidpointRounding.AwayFromZero);
        if (cost <= 0) return WalletErrors.Validation("The purchase cost rounds to zero PLN.");

        var source = await balances.Get(command.UserId, Balance.BaseCurrency, ct);
        if (source is null || source.Amount < cost)
            return new Error("Exchange.InsufficientFunds", "Insufficient PLN funds.", ErrorType.UnprocessableEntity);

        var target = await balances.Get(command.UserId, currency, ct);
        if (target is null)
        {
            target = Balance.Open(command.UserId, currency);
            balances.Add(target);
        }

        source.Debit(cost);
        target.Credit(command.Amount);
        var transaction = Transaction.Purchase(command.UserId, currency, cost, command.Amount,
            rate.Ask, table.Value.EffectiveDate, clock.UtcNow);
        transactions.Add(transaction);

        // One SaveChanges commits both balances and history atomically. xmin detects competing spends.
        await uow.SaveChanges(ct);
        return TransactionDto.From(transaction);
    }
}
