using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Auth.Refresh;

public sealed record RefreshTokensCommand(string RefreshToken) : ICommand<AuthTokensDto>;

internal sealed class RefreshTokensHandler(
    IRefreshTokenRepository refreshTokens,
    IUserRepository users,
    ITokenService tokenService,
    TokenIssuer issuer,
    IUnitOfWork uow,
    IClock clock) : ICommandHandler<RefreshTokensCommand, AuthTokensDto>
{
    public async Task<Result<AuthTokensDto>> Handle(RefreshTokensCommand command, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken)) return AuthErrors.InvalidRefreshToken;

        var now = clock.UtcNow;
        var stored = await refreshTokens.GetByHash(tokenService.HashRefreshToken(command.RefreshToken), ct);
        if (stored is null) return AuthErrors.InvalidRefreshToken;

        if (stored.IsRevoked)
        {
            // A rotated token came back: assume it leaked and kill the whole chain.
            await refreshTokens.RevokeFamily(stored.FamilyId, now, ct);
            await uow.SaveChanges(ct);
            return AuthErrors.InvalidRefreshToken;
        }

        if (stored.IsExpired(now)) return AuthErrors.InvalidRefreshToken;

        var user = await users.GetById(stored.UserId, ct);
        if (user is null) return AuthErrors.InvalidRefreshToken;

        stored.Revoke(now);
        var tokens = issuer.Issue(user, stored.FamilyId);
        await uow.SaveChanges(ct);

        return tokens;
    }
}
