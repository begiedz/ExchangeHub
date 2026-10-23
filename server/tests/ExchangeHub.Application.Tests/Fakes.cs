using System.Security.Cryptography;
using System.Text;
using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Auth;
using ExchangeHub.Domain.Users;
using Microsoft.Extensions.Options;

namespace ExchangeHub.Application.Tests;

internal sealed class FakeClock : IClock
{
    public DateTime UtcNow { get; set; } = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
    public void Advance(TimeSpan by) => UtcNow += by;
}

internal sealed class FakePasswordHasher : IPasswordHasher
{
    public int HashCalls { get; private set; }
    public int VerifyCalls { get; private set; }

    public string Hash(string password)
    {
        HashCalls++;
        return "hash:" + password;
    }

    public bool Verify(string password, string hash)
    {
        VerifyCalls++;
        return hash == "hash:" + password;
    }
}

internal sealed class FakeTokenService : ITokenService
{
    public TimeSpan RefreshTokenLifetime => TimeSpan.FromDays(30);

    public AccessToken CreateAccessToken(User user) => new("access-" + user.Id, DateTime.UtcNow.AddMinutes(15));

    public GeneratedRefreshToken CreateRefreshToken()
    {
        var value = Guid.NewGuid().ToString("N");
        return new GeneratedRefreshToken(value, HashRefreshToken(value));
    }

    public string HashRefreshToken(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
}

/// <summary>One in-memory store standing in for the whole persistence layer.</summary>
internal sealed class FakeStore : IUserRepository, IRefreshTokenRepository, IUnitOfWork
{
    public List<User> Users { get; } = [];
    public List<RefreshToken> Tokens { get; } = [];
    public int SaveCount { get; private set; }

    public Task<User?> GetById(Guid id, CancellationToken ct) => Task.FromResult(Users.FirstOrDefault(u => u.Id == id));
    public Task<User?> GetByEmail(string email, CancellationToken ct) => Task.FromResult(Users.FirstOrDefault(u => u.Email == email));
    public Task<bool> EmailExists(string email, CancellationToken ct) => Task.FromResult(Users.Any(u => u.Email == email));
    public void Add(User user) => Users.Add(user);

    public Task<RefreshToken?> GetByHash(string hash, CancellationToken ct) => Task.FromResult(Tokens.FirstOrDefault(t => t.TokenHash == hash));
    public void Add(RefreshToken token) => Tokens.Add(token);

    public Task RevokeFamily(Guid familyId, DateTime now, CancellationToken ct)
    {
        Tokens.Where(t => t.FamilyId == familyId).ToList().ForEach(t => t.Revoke(now));
        return Task.CompletedTask;
    }

    public Task RevokeAllForUser(Guid userId, DateTime now, CancellationToken ct)
    {
        Tokens.Where(t => t.UserId == userId).ToList().ForEach(t => t.Revoke(now));
        return Task.CompletedTask;
    }

    public Task SaveChanges(CancellationToken ct)
    {
        SaveCount++;
        return Task.CompletedTask;
    }
}

internal sealed class AuthFixture
{
    public FakeStore Store { get; } = new();
    public FakeClock Clock { get; } = new();
    public FakePasswordHasher Hasher { get; } = new();
    public FakeTokenService Tokens { get; } = new();
    public IOptions<LoginProtectionOptions> Protection { get; } =
        Options.Create(new LoginProtectionOptions { MaxFailedAttempts = 3, LockoutDuration = TimeSpan.FromMinutes(10) });

    public TokenIssuer Issuer => new(Tokens, Store, Clock);
}
