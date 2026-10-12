using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeHub.Api.Extensions;

/// <summary>
/// Last line of defence: logs the real exception server-side and answers with a generic problem,
/// so stack traces and internal messages never reach the client.
/// </summary>
internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IProblemDetailsService problems)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception exception, CancellationToken ct)
    {
        // Malformed requests (bad JSON, missing body) are the client's fault, not a server error.
        if (exception is BadHttpRequestException bad)
        {
            http.Response.StatusCode = bad.StatusCode;
            return await problems.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = http,
                ProblemDetails = new ProblemDetails
                {
                    Status = bad.StatusCode,
                    Title = "Request.Malformed",
                    Detail = "The request could not be parsed."
                }
            });
        }

        if (exception is ExchangeHub.Application.Wallets.ConcurrencyConflictException)
        {
            http.Response.StatusCode = StatusCodes.Status409Conflict;
            return await problems.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = http,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Request.Conflict",
                    Detail = "The data was changed by another request. Please retry."
                }
            });
        }

        logger.LogError(exception, "Unhandled exception for {Method} {Path}", http.Request.Method, http.Request.Path);

        http.Response.StatusCode = StatusCodes.Status500InternalServerError;
        return await problems.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            ProblemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Server.Error",
                Detail = "An unexpected error occurred."
            }
        });
    }
}
