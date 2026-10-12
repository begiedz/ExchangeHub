using ExchangeHub.Domain.Users;
using ExchangeHub.Domain.Wallets;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExchangeHub.Infrastructure.Persistence.Configurations;

internal sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("transactions");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Type).HasConversion<string>().HasMaxLength(16);
        builder.Property(t => t.SourceCurrency).HasMaxLength(3);
        builder.Property(t => t.TargetCurrency).HasMaxLength(3).IsRequired();
        builder.Property(t => t.SourceAmount).HasPrecision(18, 4);
        builder.Property(t => t.TargetAmount).HasPrecision(18, 4);
        builder.Property(t => t.ExchangeRate).HasPrecision(18, 8);
        builder.HasIndex(t => new { t.UserId, t.CreatedAtUtc });
        builder.HasOne<User>().WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
