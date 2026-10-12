namespace ExchangeHub.Domain.Users;

public sealed class User
{
    private User() { }

    public Guid Id { get; private set; }
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public DateTime CreatedAtUtc { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEndUtc { get; private set; }

    public static User Create(string email, string passwordHash, DateTime nowUtc) => new()
    {
        Id = Guid.NewGuid(),
        Email = email,
        PasswordHash = passwordHash,
        CreatedAtUtc = nowUtc
    };

    public bool IsLockedOut(DateTime nowUtc) => LockoutEndUtc is { } end && end > nowUtc;

    public void RegisterFailedLogin(DateTime nowUtc, int maxAttempts, TimeSpan lockoutDuration)
    {
        // An expired lockout starts a fresh attempt window.
        if (LockoutEndUtc is { } end && end <= nowUtc)
        {
            FailedLoginAttempts = 0;
            LockoutEndUtc = null;
        }

        FailedLoginAttempts++;

        if (FailedLoginAttempts >= maxAttempts)
        {
            LockoutEndUtc = nowUtc + lockoutDuration;
        }
    }

    public void RegisterSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockoutEndUtc = null;
    }
}
