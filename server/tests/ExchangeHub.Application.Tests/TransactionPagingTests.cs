using ExchangeHub.Application.Common;
using ExchangeHub.Application.Transactions;
using ExchangeHub.Application.Transactions.GetTransactions;
using ExchangeHub.Domain.Wallets;

namespace ExchangeHub.Application.Tests;

public sealed class TransactionPagingTests
{
    [Theory]
    [InlineData(int.MaxValue, 20)]
    [InlineData(int.MaxValue, 100)]
    [InlineData(21474838, 100)]
    [InlineData(429496731, 20)]
    public async Task OffsetBeyondSupportedRange_IsRejectedBeforeQueryingPersistence(int page, int pageSize)
    {
        var repository = new PagingSpy();

        var result = await new GetTransactionsHandler(repository)
            .Handle(new(Guid.NewGuid(), page, pageSize), CancellationToken.None);

        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Equal(0, repository.Calls);
    }

    [Theory]
    [InlineData(1, 100, 0)]
    [InlineData(int.MaxValue, 1, int.MaxValue - 1)]
    [InlineData(21474837, 100, 2147483600)]
    public async Task ValidBoundaryPages_AreQueriedWithoutWrapping(int page, int pageSize, int expectedSkip)
    {
        var repository = new PagingSpy();

        var result = await new GetTransactionsHandler(repository)
            .Handle(new(Guid.NewGuid(), page, pageSize), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(1, repository.Calls);
        Assert.Equal(expectedSkip, repository.Skip);
        Assert.Empty(result.Value!.Items);
    }

    private sealed class PagingSpy : ITransactionRepository
    {
        public int Calls { get; private set; }
        public int Skip { get; private set; }
        public void Add(Transaction transaction) => throw new NotSupportedException();
        public Task<(IReadOnlyList<Transaction> Items, int Total)> GetPage(Guid userId, int skip, int take, CancellationToken ct)
        {
            Calls++;
            Skip = skip;
            return Task.FromResult<(IReadOnlyList<Transaction>, int)>(([], 0));
        }
    }
}
