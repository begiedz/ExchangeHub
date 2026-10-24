using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using ExchangeHub.Domain.Users;

namespace ExchangeHub.Application.Auth.Register;

public sealed record RegisterUserCommand(string Email, string Password) : ICommand<UserDto>;

internal sealed class RegisterUserHandler(
    IUserRepository users,
    IPasswordHasher hasher,
    IUnitOfWork uow,
    IClock clock) : ICommandHandler<RegisterUserCommand, UserDto>
{
    public async Task<Result<UserDto>> Handle(RegisterUserCommand command, CancellationToken ct)
    {
        var email = AuthInputRules.NormalizeEmail(command.Email);

        if (AuthInputRules.ValidateEmail(email) is { } emailError) return emailError;
        if (AuthInputRules.ValidateNewPassword(command.Password) is { } passwordError) return passwordError;

        if (await users.EmailExists(email, ct)) return AuthErrors.EmailTaken;

        var user = User.Create(email, hasher.Hash(command.Password), clock.UtcNow);
        users.Add(user);
        await uow.SaveChanges(ct);

        return new UserDto(user.Id, user.Email);
    }
}
