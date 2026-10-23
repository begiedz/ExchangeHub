using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;

namespace ExchangeHub.Application.Exchange.Sell;

/// <param name="Amount">Amount of foreign currency to sell, not the proceeds in PLN.</param>
public sealed record SellCurrencyCommand(Guid UserId, string? Currency, decimal Amount) : ICommand<TransactionDto>;

internal sealed class SellCurrencyHandler(CurrencyExchange exchange) : ICommandHandler<SellCurrencyCommand, TransactionDto>
{
    public Task<Result<TransactionDto>> Handle(SellCurrencyCommand command, CancellationToken ct) =>
        exchange.Execute(command.UserId, command.Currency, command.Amount, ExchangeDirection.Sell, ct);
}
