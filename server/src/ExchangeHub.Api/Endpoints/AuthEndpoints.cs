using ExchangeHub.Api.Extensions;
using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Auth;
using ExchangeHub.Application.Auth.GetCurrentUser;
using ExchangeHub.Application.Auth.Login;
using ExchangeHub.Application.Auth.Logout;
using ExchangeHub.Application.Auth.LogoutAll;
using ExchangeHub.Application.Auth.Refresh;
using ExchangeHub.Application.Auth.Register;

namespace ExchangeHub.Api.Endpoints;

public sealed record CredentialsRequest(string Email, string Password);
public sealed record RefreshTokenRequest(string RefreshToken);

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/auth").WithTags("Auth");

        auth.MapPost("/register", async (
                CredentialsRequest request,
                ICommandHandler<RegisterUserCommand, UserDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new RegisterUserCommand(request.Email, request.Password), ct))
                .ToHttpResult(user => Results.Created($"/api/users/me", user)))
            .AllowAnonymous();

        auth.MapPost("/login", async (
                CredentialsRequest request,
                ICommandHandler<LoginCommand, AuthTokensDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new LoginCommand(request.Email, request.Password), ct)).ToHttpResult())
            .AllowAnonymous();

        auth.MapPost("/refresh", async (
                RefreshTokenRequest request,
                ICommandHandler<RefreshTokensCommand, AuthTokensDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new RefreshTokensCommand(request.RefreshToken), ct)).ToHttpResult())
            .AllowAnonymous();

        auth.MapPost("/logout", async (
                RefreshTokenRequest request,
                HttpContext http,
                ICommandHandler<LogoutCommand> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new LogoutCommand(userId, request.RefreshToken), ct)).ToHttpResult()
                : Results.Unauthorized())
            .RequireAuthorization();

        auth.MapPost("/logout-all", async (
                HttpContext http,
                ICommandHandler<LogoutAllCommand> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new LogoutAllCommand(userId), ct)).ToHttpResult()
                : Results.Unauthorized())
            .RequireAuthorization();

        app.MapGet("/api/users/me", async (
                HttpContext http,
                IQueryHandler<GetCurrentUserQuery, UserDto> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new GetCurrentUserQuery(userId), ct)).ToHttpResult()
                : Results.Unauthorized())
            .WithTags("Users")
            .RequireAuthorization();

        return app;
    }
}
