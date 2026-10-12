using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Wallets.TopUp;

public sealed record TopUpCommand(Guid UserId, decimal Amount) : ICommand<BalanceDto>;

/// <summary>Simulated account top-up: credits PLN, no real payment involved.</summary>
internal sealed class TopUpHandler(
    IBalanceRepository balances,
    ITransactionRepository transactions,
    IUnitOfWork uow,
    IClock clock)
    : ICommandHandler<TopUpCommand, BalanceDto>
{
    public const decimal MaxAmount = 1_000_000m;
    public const int AmountDecimals = 2;

    public async Task<Result<BalanceDto>> Handle(TopUpCommand command, CancellationToken ct)
    {
        if (command.Amount <= 0)
            return WalletErrors.Validation("Amount must be greater than zero.");
        if (command.Amount > MaxAmount)
            return WalletErrors.Validation($"Amount must not exceed {MaxAmount:0} {Balance.BaseCurrency}.");
        if (decimal.Round(command.Amount, AmountDecimals) != command.Amount)
            return WalletErrors.Validation($"Amount can have at most {AmountDecimals} decimal places.");

        var balance = await balances.Get(command.UserId, Balance.BaseCurrency, ct);
        if (balance is null)
        {
            balance = Balance.Open(command.UserId, Balance.BaseCurrency);
            balances.Add(balance);
        }

        balance.Credit(command.Amount);
        transactions.Add(Transaction.TopUp(command.UserId, command.Amount, clock.UtcNow));
        await uow.SaveChanges(ct);

        return new BalanceDto(balance.CurrencyCode, balance.Amount);
    }
}
