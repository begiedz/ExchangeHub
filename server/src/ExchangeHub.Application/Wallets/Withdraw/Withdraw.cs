using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets.TopUp;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Wallets.Withdraw;

public sealed record WithdrawCommand(Guid UserId, decimal Amount) : ICommand<BalanceDto>;

/// <summary>Simulated withdrawal of PLN: the inverse of a top-up, no real payout involved.</summary>
internal sealed class WithdrawHandler(
    IBalanceRepository balances,
    ITransactionRepository transactions,
    IUnitOfWork uow,
    IClock clock)
    : ICommandHandler<WithdrawCommand, BalanceDto>
{
    public async Task<Result<BalanceDto>> Handle(WithdrawCommand command, CancellationToken ct)
    {
        // Same amount rules as a top-up, so the two operations can never disagree about what a valid amount is.
        if (command.Amount <= 0)
            return WalletErrors.Validation("Amount must be greater than zero.");
        if (command.Amount > TopUpHandler.MaxAmount)
            return WalletErrors.Validation($"Amount must not exceed {TopUpHandler.MaxAmount:0} {Balance.BaseCurrency}.");
        if (decimal.Round(command.Amount, TopUpHandler.AmountDecimals) != command.Amount)
            return WalletErrors.Validation($"Amount can have at most {TopUpHandler.AmountDecimals} decimal places.");

        var balance = await balances.Get(command.UserId, Balance.BaseCurrency, ct);
        if (balance is null || balance.Amount < command.Amount)
            return WalletErrors.InsufficientFunds;

        balance.Debit(command.Amount);
        transactions.Add(Transaction.Withdrawal(command.UserId, command.Amount, clock.UtcNow));

        // Balance and history commit together; xmin makes two competing withdrawals unable to spend the same funds.
        await uow.SaveChanges(ct);

        return new BalanceDto(balance.CurrencyCode, balance.Amount);
    }
}
