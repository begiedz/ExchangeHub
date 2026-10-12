using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Auth.Logout;

public sealed record LogoutCommand(Guid UserId, string RefreshToken) : ICommand;

internal sealed class LogoutHandler(
    IRefreshTokenRepository refreshTokens,
    ITokenService tokenService,
    IUnitOfWork uow,
    IClock clock) : ICommandHandler<LogoutCommand>
{
    public async Task<Result> Handle(LogoutCommand command, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken)) return Result.Success();

        var stored = await refreshTokens.GetByHash(tokenService.HashRefreshToken(command.RefreshToken), ct);

        // Only the owner can end a session; anything else is ignored (idempotent, no oracle).
        if (stored is not null && stored.UserId == command.UserId)
        {
            await refreshTokens.RevokeFamily(stored.FamilyId, clock.UtcNow, ct);
            await uow.SaveChanges(ct);
        }

        return Result.Success();
    }
}
