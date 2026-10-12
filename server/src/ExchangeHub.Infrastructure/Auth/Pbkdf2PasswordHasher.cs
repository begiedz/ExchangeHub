using System.Security.Cryptography;
using ExchangeHub.Application.Abstractions.Auth;

namespace ExchangeHub.Infrastructure.Auth;

/// <summary>PBKDF2-HMAC-SHA512 with a per-password salt. Stored as "v1.iterations.salt.hash" (base64).</summary>
internal sealed class Pbkdf2PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 210_000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA512;

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, Algorithm, HashSize);
        return $"v1.{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool Verify(string password, string stored)
    {
        var parts = stored.Split('.');
        if (parts is not ["v1", var iterationsPart, var saltPart, var hashPart]
            || !int.TryParse(iterationsPart, out var iterations))
        {
            return false;
        }

        try
        {
            var expected = Convert.FromBase64String(hashPart);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(saltPart), iterations, Algorithm, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
