using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Wallets;
using ExchangeHub.Application.Wallets.Withdraw;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Tests;

public class WithdrawTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private readonly Balances _balances = new();
    private readonly History _history = new();
    private readonly FakeStore _uow = new();
    private readonly FakeClock _clock = new();

    private Task<Result<BalanceDto>> Withdraw(decimal amount, Guid? user = null) =>
        new WithdrawHandler(_balances, _history, _uow, _clock)
            .Handle(new WithdrawCommand(user ?? UserId, amount), CancellationToken.None);

    private void Fund(decimal amount, Guid? user = null)
    {
        var balance = Balance.Open(user ?? UserId, "PLN");
        balance.Credit(amount);
        _balances.Items.Add(balance);
    }

    [Fact]
    public async Task Withdrawal_ReducesTheBalance_AndRecordsHistory()
    {
        Fund(100m);

        var result = await Withdraw(30.25m);

        Assert.Equal(new BalanceDto("PLN", 69.75m), result.Value);
        var entry = Assert.Single(_history.Items);
        Assert.Equal(TransactionType.Withdrawal, entry.Type);
        Assert.Equal(UserId, entry.UserId);
        Assert.Equal("PLN", entry.SourceCurrency);
        Assert.Equal(30.25m, entry.SourceAmount);
        Assert.Equal(30.25m, entry.TargetAmount);
        Assert.Null(entry.ExchangeRate);
        Assert.Equal(_clock.UtcNow, entry.CreatedAtUtc);
        Assert.Equal(1, _uow.SaveCount);
    }

    [Fact]
    public async Task WithdrawingTheWholeBalance_IsAllowed_AndLeavesZero()
    {
        Fund(50m);

        Assert.Equal(0m, (await Withdraw(50m)).Value!.Amount);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(1_000_000.01)]
    [InlineData(10.123)]
    public async Task InvalidAmounts_AreRejected_AndNothingChanges(double amount)
    {
        Fund(2_000_000m);

        var result = await Withdraw((decimal)amount);

        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Equal(2_000_000m, _balances.Items.Single().Amount);
        Assert.Empty(_history.Items);
        Assert.Equal(0, _uow.SaveCount);
    }

    [Fact]
    public async Task MoreThanTheBalance_IsRefused_WithoutTouchingFundsOrHistory()
    {
        Fund(100m);

        var result = await Withdraw(100.01m);

        Assert.Equal(WalletErrors.InsufficientFunds, result.Error);
        Assert.Equal(100m, _balances.Items.Single().Amount);
        Assert.Empty(_history.Items);
        Assert.Equal(0, _uow.SaveCount);
    }

    [Fact]
    public async Task WithoutAnyBalance_ItIsInsufficientFunds_NotAnError()
    {
        var result = await Withdraw(1m);

        Assert.Equal(WalletErrors.InsufficientFunds, result.Error);
    }

    [Fact]
    public async Task CannotWithdrawFromSomeoneElsesWallet()
    {
        Fund(100m, Guid.NewGuid());

        var result = await Withdraw(10m);

        Assert.Equal(WalletErrors.InsufficientFunds, result.Error);
        Assert.Equal(100m, _balances.Items.Single().Amount);
    }

    private sealed class Balances : IBalanceRepository
    {
        public List<Balance> Items { get; } = [];

        public Task<IReadOnlyList<Balance>> GetForUser(Guid userId, CancellationToken ct) =>
            Task.FromResult<IReadOnlyList<Balance>>(Items.Where(b => b.UserId == userId).ToList());

        public Task<Balance?> Get(Guid userId, string code, CancellationToken ct) =>
            Task.FromResult(Items.FirstOrDefault(b => b.UserId == userId && b.CurrencyCode == code));

        public void Add(Balance balance) => Items.Add(balance);
    }

    private sealed class History : ITransactionRepository
    {
        public List<Transaction> Items { get; } = [];

        public void Add(Transaction transaction) => Items.Add(transaction);

        public Task<(IReadOnlyList<Transaction> Items, int Total)> GetPage(Guid userId, int skip, int take, CancellationToken ct) =>
            Task.FromResult<(IReadOnlyList<Transaction>, int)>((Items, Items.Count));
    }
}
