using ExchangeHub.Domain.Users;

namespace ExchangeHub.Application.Abstractions.Auth;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public sealed record AccessToken(string Value, DateTime ExpiresAtUtc);

/// <param name="Value">Opaque value handed to the client.</param>
/// <param name="Hash">Deterministic hash; the only form that is persisted.</param>
public sealed record GeneratedRefreshToken(string Value, string Hash);

public interface ITokenService
{
    TimeSpan RefreshTokenLifetime { get; }
    AccessToken CreateAccessToken(User user);
    GeneratedRefreshToken CreateRefreshToken();
    string HashRefreshToken(string value);
}

public sealed class LoginProtectionOptions
{
    public const string SectionName = "Auth:LoginProtection";

    public int MaxFailedAttempts { get; set; } = 5;
    public TimeSpan LockoutDuration { get; set; } = TimeSpan.FromMinutes(15);
}
