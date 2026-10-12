using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace ExchangeHub.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<ExchangeHub.Domain.Wallets.Balance> Balances => Set<ExchangeHub.Domain.Wallets.Balance>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    public async Task SaveChanges(CancellationToken ct)
    {
        try
        {
            await base.SaveChangesAsync(ct);
        }
        catch (Exception ex) when (ex is DbUpdateConcurrencyException
                                       or DbUpdateException { InnerException: Npgsql.PostgresException { SqlState: "23505" } })
        {
            // Lost an optimistic-concurrency race or hit a unique index: let the caller retry instead of a 500.
            throw new ExchangeHub.Application.Wallets.ConcurrencyConflictException(ex);
        }
    }
}
