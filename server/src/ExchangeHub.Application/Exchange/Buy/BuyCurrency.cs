using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;

namespace ExchangeHub.Application.Exchange.Buy;

/// <param name="Amount">Amount of foreign currency to buy, not the cost in PLN.</param>
public sealed record BuyCurrencyCommand(Guid UserId, string? Currency, decimal Amount) : ICommand<TransactionDto>;

internal sealed class BuyCurrencyHandler(CurrencyExchange exchange) : ICommandHandler<BuyCurrencyCommand, TransactionDto>
{
    public Task<Result<TransactionDto>> Handle(BuyCurrencyCommand command, CancellationToken ct) =>
        exchange.Execute(command.UserId, command.Currency, command.Amount, ExchangeDirection.Buy, ct);
}
