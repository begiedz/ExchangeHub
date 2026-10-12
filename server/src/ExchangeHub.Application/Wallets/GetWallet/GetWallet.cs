using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Wallets.GetWallet;

public sealed record GetWalletQuery(Guid UserId) : IQuery<WalletDto>;

internal sealed class GetWalletHandler(IBalanceRepository balances) : IQueryHandler<GetWalletQuery, WalletDto>
{
    public async Task<Result<WalletDto>> Handle(GetWalletQuery query, CancellationToken ct)
    {
        var owned = await balances.GetForUser(query.UserId, ct);

        return new WalletDto(owned
            .OrderBy(b => b.CurrencyCode)
            .Select(b => new BalanceDto(b.CurrencyCode, b.Amount))
            .ToList());
    }
}
