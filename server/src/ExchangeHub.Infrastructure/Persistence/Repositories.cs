using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace ExchangeHub.Infrastructure.Persistence;

internal sealed class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetById(Guid id, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmail(string normalizedEmail, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

    public Task<bool> EmailExists(string normalizedEmail, CancellationToken ct) =>
        db.Users.AnyAsync(u => u.Email == normalizedEmail, ct);

    public void Add(User user) => db.Users.Add(user);
}

internal sealed class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByHash(string tokenHash, CancellationToken ct) =>
        db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

    public void Add(RefreshToken token) => db.RefreshTokens.Add(token);

    public async Task RevokeFamily(Guid familyId, DateTime nowUtc, CancellationToken ct)
    {
        var active = await db.RefreshTokens
            .Where(t => t.FamilyId == familyId && t.RevokedAtUtc == null)
            .ToListAsync(ct);
        active.ForEach(t => t.Revoke(nowUtc));
    }

    public async Task RevokeAllForUser(Guid userId, DateTime nowUtc, CancellationToken ct)
    {
        var active = await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ToListAsync(ct);
        active.ForEach(t => t.Revoke(nowUtc));
    }
}

internal sealed class BalanceRepository(AppDbContext db) : ExchangeHub.Application.Wallets.IBalanceRepository
{
    public async Task<IReadOnlyList<ExchangeHub.Domain.Wallets.Balance>> GetForUser(Guid userId, CancellationToken ct) =>
        await db.Balances.Where(b => b.UserId == userId).ToListAsync(ct);

    public Task<ExchangeHub.Domain.Wallets.Balance?> Get(Guid userId, string currencyCode, CancellationToken ct) =>
        db.Balances.FirstOrDefaultAsync(b => b.UserId == userId && b.CurrencyCode == currencyCode, ct);

    public void Add(ExchangeHub.Domain.Wallets.Balance balance) => db.Balances.Add(balance);
}

internal sealed class TransactionRepository(AppDbContext db) : ExchangeHub.Application.Transactions.ITransactionRepository
{
    public void Add(ExchangeHub.Domain.Wallets.Transaction transaction) => db.Transactions.Add(transaction);

    public async Task<(IReadOnlyList<ExchangeHub.Domain.Wallets.Transaction> Items, int Total)> GetPage(
        Guid userId, int skip, int take, CancellationToken ct)
    {
        var query = db.Transactions.AsNoTracking().Where(t => t.UserId == userId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(t => t.CreatedAtUtc).ThenByDescending(t => t.Id)
            .Skip(skip).Take(take)
            .ToListAsync(ct);

        return (items, total);
    }
}
