using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Transactions.GetTransactions;
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
    private readonly FakeTransactions _transactions = new();
    private readonly FakeClock _clock = new();

    private Task<Result<BalanceDto>> TopUp(decimal amount, Guid? user = null) =>
        new TopUpHandler(_balances, _transactions, _uow, _clock).Handle(new TopUpCommand(user ?? UserId, amount), CancellationToken.None);

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
        Assert.Empty(_transactions.Items);
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

    [Fact]
    public async Task TopUp_RecordsAnImmutableHistoryEntry_WithoutAnExchangeRate()
    {
        await TopUp(75.5m);

        var entry = Assert.Single(_transactions.Items);
        Assert.Equal(TransactionType.TopUp, entry.Type);
        Assert.Equal(UserId, entry.UserId);
        Assert.Equal("PLN", entry.TargetCurrency);
        Assert.Equal(75.5m, entry.TargetAmount);
        Assert.Null(entry.SourceCurrency);
        Assert.Null(entry.ExchangeRate);
        Assert.Equal(_clock.UtcNow, entry.CreatedAtUtc);
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    public async Task History_RejectsBadPaging(int page, int pageSize)
    {
        var result = await new GetTransactionsHandler(_transactions)
            .Handle(new GetTransactionsQuery(UserId, page, pageSize), CancellationToken.None);

        Assert.Equal(ErrorType.Validation, result.Error!.Type);
    }

    [Fact]
    public async Task History_IsPagedNewestFirst_AndOnlyForTheCaller()
    {
        for (var i = 1; i <= 5; i++)
        {
            await TopUp(i * 10m);
            _clock.Advance(TimeSpan.FromMinutes(1));
        }
        await TopUp(999m, Guid.NewGuid());

        var page = (await new GetTransactionsHandler(_transactions)
            .Handle(new GetTransactionsQuery(UserId, 2, 2), CancellationToken.None)).Value!;

        Assert.Equal(5, page.TotalCount);
        Assert.Equal([30m, 20m], page.Items.Select(t => t.TargetAmount));
    }

    private sealed class FakeTransactions : ITransactionRepository
    {
        public List<Transaction> Items { get; } = [];

        public void Add(Transaction transaction) => Items.Add(transaction);

        public Task<(IReadOnlyList<Transaction> Items, int Total)> GetPage(Guid userId, int skip, int take, CancellationToken ct)
        {
            var mine = Items.Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAtUtc).ToList();
            return Task.FromResult<(IReadOnlyList<Transaction>, int)>((mine.Skip(skip).Take(take).ToList(), mine.Count));
        }
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
