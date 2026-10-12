using ExchangeHub.Domain.Wallets;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExchangeHub.Infrastructure.Persistence.Configurations;

internal sealed class BalanceConfiguration : IEntityTypeConfiguration<Balance>
{
    public void Configure(EntityTypeBuilder<Balance> builder)
    {
        builder.ToTable("balances");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(b => b.Amount).HasPrecision(18, 4);
        builder.HasIndex(b => new { b.UserId, b.CurrencyCode }).IsUnique();
        builder.HasOne<ExchangeHub.Domain.Users.User>().WithMany().HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);

        // Postgres system column: two concurrent updates of one balance can't both win.
        builder.Property<uint>("xmin").HasColumnType("xid").ValueGeneratedOnAddOrUpdate().IsConcurrencyToken();
    }
}
