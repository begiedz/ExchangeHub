using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Wallets;
using ExchangeHub.Application.Wallets.GetWallet;
using ExchangeHub.Application.Wallets.TopUp;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Tests;

public class TopUpTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private readonly FakeBalances _balances = new();
    private readonly FakeStore _uow = new();

    private Task<Result<BalanceDto>> TopUp(decimal amount, Guid? user = null) =>
        new TopUpHandler(_balances, _uow).Handle(new TopUpCommand(user ?? UserId, amount), CancellationToken.None);

    [Fact]
    public async Task FirstTopUp_OpensPlnBalance_AndLaterOnesAccumulate()
    {
        await TopUp(100m);
        var result = await TopUp(50.25m);

        Assert.Equal(new BalanceDto("PLN", 150.25m), result.Value);
        Assert.Single(_balances.Items);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(1_000_000.01)]
    [InlineData(10.123)]
    public async Task InvalidAmounts_AreRejected_AndNothingIsSaved(double amount)
    {
        var result = await TopUp((decimal)amount);

        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_balances.Items);
        Assert.Equal(0, _uow.SaveCount);
    }

    [Fact]
    public async Task Wallet_ShowsOnlyTheCallersBalances()
    {
        await TopUp(100m);
        await TopUp(999m, Guid.NewGuid());

        var wallet = (await new GetWalletHandler(_balances)
            .Handle(new GetWalletQuery(UserId), CancellationToken.None)).Value!;

        Assert.Equal([new BalanceDto("PLN", 100m)], wallet.Balances);
    }

    private sealed class FakeBalances : IBalanceRepository
    {
        public List<Balance> Items { get; } = [];

        public Task<IReadOnlyList<Balance>> GetForUser(Guid userId, CancellationToken ct) =>
            Task.FromResult<IReadOnlyList<Balance>>(Items.Where(b => b.UserId == userId).ToList());

        public Task<Balance?> Get(Guid userId, string code, CancellationToken ct) =>
            Task.FromResult(Items.FirstOrDefault(b => b.UserId == userId && b.CurrencyCode == code));

        public void Add(Balance balance) => Items.Add(balance);
    }
}
