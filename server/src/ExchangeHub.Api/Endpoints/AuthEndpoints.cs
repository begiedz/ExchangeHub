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
                .ToHttpResult(user => Results.Created("/api/users/me", user)))
            .AllowAnonymous()
            .WithSummary("Create an account")
            .Produces<UserDto>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        auth.MapPost("/login", async (
                CredentialsRequest request,
                ICommandHandler<LoginCommand, AuthTokensDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new LoginCommand(request.Email, request.Password), ct)).ToHttpResult())
            .AllowAnonymous()
            .WithSummary("Exchange credentials for an access/refresh token pair")
            .Produces<AuthTokensDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        auth.MapPost("/refresh", async (
                RefreshTokenRequest request,
                ICommandHandler<RefreshTokensCommand, AuthTokensDto> handler,
                CancellationToken ct) =>
            (await handler.Handle(new RefreshTokensCommand(request.RefreshToken), ct)).ToHttpResult())
            .AllowAnonymous()
            .WithSummary("Rotate a refresh token; the submitted token becomes unusable")
            .Produces<AuthTokensDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        auth.MapPost("/logout", async (
                RefreshTokenRequest request,
                HttpContext http,
                ICommandHandler<LogoutCommand> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new LogoutCommand(userId, request.RefreshToken), ct)).ToHttpResult()
                : Results.Unauthorized())
            .RequireAuthorization()
            .WithSummary("End the session that owns the given refresh token")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        auth.MapPost("/logout-all", async (
                HttpContext http,
                ICommandHandler<LogoutAllCommand> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new LogoutAllCommand(userId), ct)).ToHttpResult()
                : Results.Unauthorized())
            .RequireAuthorization()
            .WithSummary("End every session of the current user")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        app.MapGet("/api/users/me", async (
                HttpContext http,
                IQueryHandler<GetCurrentUserQuery, UserDto> handler,
                CancellationToken ct) =>
            http.User.GetUserId() is { } userId
                ? (await handler.Handle(new GetCurrentUserQuery(userId), ct)).ToHttpResult()
                : Results.Unauthorized())
            .WithTags("Users")
            .RequireAuthorization()
            .WithSummary("Identify the caller from the access token")
            .Produces<UserDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }
}
