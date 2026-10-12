using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Auth.GetCurrentUser;

public sealed record GetCurrentUserQuery(Guid UserId) : IQuery<UserDto>;

internal sealed class GetCurrentUserHandler(IUserRepository users) : IQueryHandler<GetCurrentUserQuery, UserDto>
{
    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery query, CancellationToken ct)
    {
        var user = await users.GetById(query.UserId, ct);
        if (user is null) return AuthErrors.UserNotFound;

        return new UserDto(user.Id, user.Email);
    }
}
