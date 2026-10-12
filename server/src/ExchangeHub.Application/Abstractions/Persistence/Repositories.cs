using ExchangeHub.Domain.Users;

namespace ExchangeHub.Application.Abstractions.Persistence;

public interface IUserRepository
{
    Task<User?> GetById(Guid id, CancellationToken ct);
    Task<User?> GetByEmail(string normalizedEmail, CancellationToken ct);
    Task<bool> EmailExists(string normalizedEmail, CancellationToken ct);
    void Add(User user);
}

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByHash(string tokenHash, CancellationToken ct);
    void Add(RefreshToken token);

    /// <summary>Revokes every active token in one family (reuse detection, single-device logout).</summary>
    Task RevokeFamily(Guid familyId, DateTime nowUtc, CancellationToken ct);

    /// <summary>Revokes every active token of a user (logout from all devices).</summary>
    Task RevokeAllForUser(Guid userId, DateTime nowUtc, CancellationToken ct);
}

public interface IUnitOfWork
{
    Task SaveChanges(CancellationToken ct);
}
