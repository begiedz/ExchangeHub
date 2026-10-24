using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace ExchangeHub.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    public async Task SaveChanges(CancellationToken ct) => await base.SaveChangesAsync(ct);
}
