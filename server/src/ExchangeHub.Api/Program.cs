using ExchangeHub.Api.Endpoints;
using ExchangeHub.Api.Extensions;
using ExchangeHub.Application;
using ExchangeHub.Infrastructure;
using ExchangeHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiDocumentation();
builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
{
    // Some binding failures only set the status (e.g. unsupported media type).
    // Give the status-code middleware the same contract as the exception handler.
    if (context.ProblemDetails.Status is StatusCodes.Status400BadRequest or StatusCodes.Status415UnsupportedMediaType
        && !context.ProblemDetails.Extensions.ContainsKey("code"))
    {
        context.ProblemDetails.Title = "Request.Malformed";
        context.ProblemDetails.Detail = "The request could not be parsed.";
        context.ProblemDetails.Extensions["code"] = "Request.Malformed";
    }
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
// Route binding failures use the same problem response in every environment.
builder.Services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);
builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>("database");

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddJwtAuthentication();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(o => o.SwaggerEndpoint("/openapi/v1.json", "ExchangeHub API v1"));

    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health").AllowAnonymous().WithTags("Health");
app.MapAuthEndpoints();
app.MapRatesEndpoints();
app.MapWalletEndpoints();
app.MapTransactionEndpoints();
app.MapExchangeEndpoints();

app.Run();

public partial class Program;
