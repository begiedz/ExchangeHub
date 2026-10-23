using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Common;
using Microsoft.Extensions.Options;

namespace ExchangeHub.Application.Auth.Login;

public sealed record LoginCommand(string Email, string Password) : ICommand<AuthTokensDto>;

internal sealed class LoginHandler(
    IUserRepository users,
    IPasswordHasher hasher,
    TokenIssuer issuer,
    IUnitOfWork uow,
    IClock clock,
    IOptions<LoginProtectionOptions> options) : ICommandHandler<LoginCommand, AuthTokensDto>
{
    public async Task<Result<AuthTokensDto>> Handle(LoginCommand command, CancellationToken ct)
    {
        var email = AuthInputRules.NormalizeEmail(command.Email);
        if (AuthInputRules.ValidateEmail(email) is not null || string.IsNullOrEmpty(command.Password)
            || command.Password.Length > AuthInputRules.MaxPasswordLength)
            return AuthErrors.InvalidCredentials;

        var user = await users.GetByEmail(email, ct);
        var now = clock.UtcNow;

        if (user is null)
        {
            // Spend the same hashing time as a real check so latency doesn't reveal which emails exist.
            hasher.Hash(command.Password);
            return AuthErrors.InvalidCredentials;
        }

        // Checked before the password so a locked account can't be brute-forced during lockout.
        if (user.IsLockedOut(now)) return AuthErrors.LockedOut;

        if (!hasher.Verify(command.Password, user.PasswordHash))
        {
            var protection = options.Value;
            user.RegisterFailedLogin(now, protection.MaxFailedAttempts, protection.LockoutDuration);
            await uow.SaveChanges(ct);

            return user.IsLockedOut(now) ? AuthErrors.LockedOut : AuthErrors.InvalidCredentials;
        }

        user.RegisterSuccessfulLogin();
        var tokens = issuer.Issue(user, Guid.NewGuid());
        await uow.SaveChanges(ct);

        return tokens;
    }
}
