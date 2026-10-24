using System.ComponentModel.DataAnnotations;

namespace ExchangeHub.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Auth:Jwt";

    [Required] public string Issuer { get; init; } = default!;
    [Required] public string Audience { get; init; } = default!;

    /// <summary>HMAC signing key. Never committed: supplied via user-secrets or environment (Auth__Jwt__SigningKey).</summary>
    [Required, MinLength(32)] public string SigningKey { get; init; } = default!;

    [Range(1, 1440)] public int AccessTokenMinutes { get; init; } = 15;
    [Range(1, 365)] public int RefreshTokenDays { get; init; } = 30;
}
