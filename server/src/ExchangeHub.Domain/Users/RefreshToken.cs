namespace ExchangeHub.Domain.Users;

/// <summary>
/// Single-use refresh token. Tokens issued from the same login share a <see cref="FamilyId"/>,
/// which lets us revoke the whole chain when a rotated token is replayed.
/// </summary>
public sealed class RefreshToken
{
    private RefreshToken() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid FamilyId { get; private set; }
    public string TokenHash { get; private set; } = default!;
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime? RevokedAtUtc { get; private set; }

    public bool IsRevoked => RevokedAtUtc is not null;
    public bool IsExpired(DateTime nowUtc) => ExpiresAtUtc <= nowUtc;

    public static RefreshToken Issue(Guid userId, Guid familyId, string tokenHash, DateTime nowUtc, TimeSpan lifetime) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        FamilyId = familyId,
        TokenHash = tokenHash,
        CreatedAtUtc = nowUtc,
        ExpiresAtUtc = nowUtc + lifetime
    };

    public void Revoke(DateTime nowUtc) => RevokedAtUtc ??= nowUtc;
}
