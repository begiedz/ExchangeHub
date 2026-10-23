using ExchangeHub.Application.Auth.Login;
using ExchangeHub.Application.Auth.Logout;
using ExchangeHub.Application.Auth.LogoutAll;
using ExchangeHub.Application.Auth.Refresh;
using ExchangeHub.Application.Auth.Register;
using ExchangeHub.Application.Common;

namespace ExchangeHub.Application.Tests;

public class AuthHandlerTests
{
    private const string Email = "kuba@example.com";
    private const string Password = "Passw0rdOk";

    private static readonly CancellationToken Ct = CancellationToken.None;

    private readonly AuthFixture _f = new();

    private async Task Register() =>
        Assert.True((await new RegisterUserHandler(_f.Store, _f.Hasher, _f.Store, _f.Clock)
            .Handle(new RegisterUserCommand(Email, Password), Ct)).IsSuccess);

    private Task<Result<Auth.AuthTokensDto>> Login(string password = Password) =>
        new LoginHandler(_f.Store, _f.Hasher, _f.Issuer, _f.Store, _f.Clock, _f.Protection)
            .Handle(new LoginCommand(Email, password), Ct);

    private Task<Result<Auth.AuthTokensDto>> Refresh(string token) =>
        new RefreshTokensHandler(_f.Store, _f.Store, _f.Tokens, _f.Issuer, _f.Store, _f.Clock)
            .Handle(new RefreshTokensCommand(token), Ct);

    [Fact]
    public async Task Register_NormalizesEmailAndRejectsDuplicates()
    {
        await Register();

        var duplicate = await new RegisterUserHandler(_f.Store, _f.Hasher, _f.Store, _f.Clock)
            .Handle(new RegisterUserCommand("  KUBA@Example.com ", Password), Ct);

        Assert.Equal(AuthErrors.EmailTaken, duplicate.Error);
        Assert.Single(_f.Store.Users);
        Assert.NotEqual(Password, _f.Store.Users[0].PasswordHash);
    }

    [Theory]
    [InlineData("not-an-email", Password)]
    [InlineData(Email, "short1")]
    [InlineData(Email, "onlyletters")]
    [InlineData(Email, "12345678")]
    public async Task Register_RejectsInvalidInput(string email, string password)
    {
        var result = await new RegisterUserHandler(_f.Store, _f.Hasher, _f.Store, _f.Clock)
            .Handle(new RegisterUserCommand(email, password), Ct);

        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_f.Store.Users);
    }

    [Fact]
    public async Task Login_WithWrongPasswordOrUnknownEmail_GivesSameError()
    {
        await Register();

        var wrong = await Login("WrongPass1");
        var unknown = await new LoginHandler(_f.Store, _f.Hasher, _f.Issuer, _f.Store, _f.Clock, _f.Protection)
            .Handle(new LoginCommand("nobody@example.com", Password), Ct);

        Assert.Equal(AuthErrors.InvalidCredentials, wrong.Error);
        Assert.Equal(AuthErrors.InvalidCredentials, unknown.Error);
    }

    [Theory]
    [InlineData("long-password", false)]
    [InlineData("long-password", true)]
    [InlineData("long-email", false)]
    [InlineData("long-email", true)]
    [InlineData("invalid-email", false)]
    [InlineData("missing-email", false)]
    [InlineData("missing-password", true)]
    public async Task Login_RejectsInvalidOrOversizedInput_WithoutHashingOrChangingAccount(string input, bool knownUser)
    {
        if (knownUser) await Register();
        var hashes = _f.Hasher.HashCalls;
        var saves = _f.Store.SaveCount;
        var email = input switch
        {
            "long-email" => new string('a', 254) + "@example.com",
            "invalid-email" => "not-an-email",
            "missing-email" => null,
            _ => Email
        };
        var password = input switch
        {
            "long-password" => new string('a', 129),
            "missing-password" => null,
            _ => Password
        };

        var result = await new LoginHandler(_f.Store, _f.Hasher, _f.Issuer, _f.Store, _f.Clock, _f.Protection)
            .Handle(new(email!, password!), Ct);

        Assert.Equal(AuthErrors.InvalidCredentials, result.Error);
        Assert.Equal(hashes, _f.Hasher.HashCalls);
        Assert.Equal(0, _f.Hasher.VerifyCalls);
        Assert.Equal(saves, _f.Store.SaveCount);
        Assert.All(_f.Store.Users, user => Assert.Equal(0, user.FailedLoginAttempts));
    }

    [Fact]
    public async Task PasswordAtMaximumLength_CanBeRegisteredAndUsedToLogIn()
    {
        var password = "A1" + new string('a', 126);
        var registered = await new RegisterUserHandler(_f.Store, _f.Hasher, _f.Store, _f.Clock)
            .Handle(new(Email, password), Ct);
        Assert.True(registered.IsSuccess);
        Assert.True((await Login(password)).IsSuccess);
    }

    [Fact]
    public async Task Login_LocksAccountAfterMaxFailures_EvenForCorrectPassword()
    {
        await Register();

        await Login("bad1aaaa");
        await Login("bad2aaaa");
        var third = await Login("bad3aaaa");

        Assert.Equal(AuthErrors.LockedOut, third.Error);
        Assert.Equal(AuthErrors.LockedOut, (await Login()).Error);

        _f.Clock.Advance(TimeSpan.FromMinutes(11));
        Assert.True((await Login()).IsSuccess);
    }

    [Fact]
    public async Task Login_SuccessResetsFailureCounter()
    {
        await Register();

        await Login("bad1aaaa");
        await Login("bad2aaaa");
        Assert.True((await Login()).IsSuccess);

        Assert.Equal(AuthErrors.InvalidCredentials, (await Login("bad3aaaa")).Error);
    }

    [Fact]
    public async Task Refresh_RotatesToken_AndOldOneIsRejected()
    {
        await Register();
        var first = (await Login()).Value!;

        var second = (await Refresh(first.RefreshToken)).Value!;

        Assert.NotEqual(first.RefreshToken, second.RefreshToken);
        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh(first.RefreshToken)).Error);
    }

    [Fact]
    public async Task Refresh_ReplayOfRotatedToken_RevokesWholeFamily()
    {
        await Register();
        var first = (await Login()).Value!;
        var second = (await Refresh(first.RefreshToken)).Value!;

        await Refresh(first.RefreshToken); // attacker replays the stolen, already-rotated token

        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh(second.RefreshToken)).Error);
        Assert.All(_f.Store.Tokens, t => Assert.True(t.IsRevoked));
    }

    [Fact]
    public async Task Refresh_RejectsExpiredAndUnknownTokens()
    {
        await Register();
        var tokens = (await Login()).Value!;

        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh("unknown")).Error);

        _f.Clock.Advance(TimeSpan.FromDays(31));
        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh(tokens.RefreshToken)).Error);
    }

    [Fact]
    public async Task Logout_RevokesOnlyThatSession_AndOnlyForItsOwner()
    {
        await Register();
        var deviceA = (await Login()).Value!;
        var deviceB = (await Login()).Value!;
        var owner = _f.Store.Users[0].Id;
        var handler = new LogoutHandler(_f.Store, _f.Tokens, _f.Store, _f.Clock);

        await handler.Handle(new LogoutCommand(Guid.NewGuid(), deviceA.RefreshToken), Ct); // not the owner
        Assert.True((await Refresh(deviceA.RefreshToken)).IsSuccess);

        var rotatedA = (await Login()).Value!;
        await handler.Handle(new LogoutCommand(owner, rotatedA.RefreshToken), Ct);

        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh(rotatedA.RefreshToken)).Error);
        Assert.True((await Refresh(deviceB.RefreshToken)).IsSuccess);
    }

    [Fact]
    public async Task LogoutAll_RevokesEverySession()
    {
        await Register();
        var deviceA = (await Login()).Value!;
        var deviceB = (await Login()).Value!;

        await new LogoutAllHandler(_f.Store, _f.Store, _f.Clock)
            .Handle(new LogoutAllCommand(_f.Store.Users[0].Id), Ct);

        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh(deviceA.RefreshToken)).Error);
        Assert.Equal(AuthErrors.InvalidRefreshToken, (await Refresh(deviceB.RefreshToken)).Error);
    }
}
