namespace ExchangeHub.Application.Common;

public static class AuthErrors
{
    public static Error Validation(string description) => new("Auth.Validation", description, ErrorType.Validation);

    public static readonly Error EmailTaken =
        new("Auth.EmailTaken", "An account with this email already exists.", ErrorType.Conflict);

    public static readonly Error InvalidCredentials =
        new("Auth.InvalidCredentials", "Invalid email or password.", ErrorType.Unauthorized);

    public static readonly Error LockedOut =
        new("Auth.LockedOut", "Too many failed login attempts. Try again later.", ErrorType.TooManyRequests);

    public static readonly Error InvalidRefreshToken =
        new("Auth.InvalidRefreshToken", "Refresh token is invalid, expired or already used.", ErrorType.Unauthorized);

    public static readonly Error UserNotFound =
        new("Auth.UserNotFound", "User does not exist.", ErrorType.NotFound);
}
