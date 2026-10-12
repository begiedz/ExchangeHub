using System.Net.Mail;
using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Domain.Users;

namespace ExchangeHub.Application.Auth;

public sealed record UserDto(Guid Id, string Email);

public sealed record AuthTokensDto(
    string AccessToken,
    DateTime AccessTokenExpiresAtUtc,
    string RefreshToken,
    DateTime RefreshTokenExpiresAtUtc);

internal static class AuthInputRules
{
    public const int MinPasswordLength = 8;
    public const int MaxPasswordLength = 128;
    public const int MaxEmailLength = 254;

    public static string NormalizeEmail(string? email) => (email ?? string.Empty).Trim().ToLowerInvariant();

    public static Error? ValidateEmail(string normalizedEmail)
    {
        if (normalizedEmail.Length is 0 or > MaxEmailLength
            || !MailAddress.TryCreate(normalizedEmail, out var parsed)
            || parsed.Address != normalizedEmail)
        {
            return AuthErrors.Validation("Email is not a valid address.");
        }

        return null;
    }

    public static Error? ValidateNewPassword(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < MinPasswordLength)
            return AuthErrors.Validation($"Password must be at least {MinPasswordLength} characters long.");
        if (password.Length > MaxPasswordLength)
            return AuthErrors.Validation($"Password must be at most {MaxPasswordLength} characters long.");
        if (!password.Any(char.IsLetter) || !password.Any(char.IsDigit))
            return AuthErrors.Validation("Password must contain at least one letter and one digit.");

        return null;
    }
}

/// <summary>Issues an access/refresh pair and stages the refresh token for persistence.</summary>
internal sealed class TokenIssuer(ITokenService tokens, IRefreshTokenRepository refreshTokens, IClock clock)
{
    public AuthTokensDto Issue(User user, Guid familyId)
    {
        var access = tokens.CreateAccessToken(user);
        var refresh = tokens.CreateRefreshToken();
        var entity = RefreshToken.Issue(user.Id, familyId, refresh.Hash, clock.UtcNow, tokens.RefreshTokenLifetime);
        refreshTokens.Add(entity);

        return new AuthTokensDto(access.Value, access.ExpiresAtUtc, refresh.Value, entity.ExpiresAtUtc);
    }
}
