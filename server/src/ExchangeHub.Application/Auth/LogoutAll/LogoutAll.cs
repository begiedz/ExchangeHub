using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Auth.LogoutAll;

public sealed record LogoutAllCommand(Guid UserId) : ICommand;

internal sealed class LogoutAllHandler(
    IRefreshTokenRepository refreshTokens,
    IUnitOfWork uow,
    IClock clock) : ICommandHandler<LogoutAllCommand>
{
    public async Task<Result> Handle(LogoutAllCommand command, CancellationToken ct)
    {
        await refreshTokens.RevokeAllForUser(command.UserId, clock.UtcNow, ct);
        await uow.SaveChanges(ct);
        return Result.Success();
    }
}
