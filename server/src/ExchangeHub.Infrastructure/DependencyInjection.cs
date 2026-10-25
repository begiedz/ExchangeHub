using ExchangeHub.Application.Abstractions;
using ExchangeHub.Application.Abstractions.Auth;
using ExchangeHub.Application.Abstractions.Persistence;
using ExchangeHub.Application.Rates;
using ExchangeHub.Infrastructure.Auth;
using ExchangeHub.Infrastructure.Nbp;
using Microsoft.Extensions.Options;
using ExchangeHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ExchangeHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(
            configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("Connection string 'Database' is not configured.")));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ExchangeHub.Application.Wallets.IBalanceRepository, BalanceRepository>();
        services.AddScoped<ExchangeHub.Application.Transactions.ITransactionRepository, TransactionRepository>();

        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<ITokenService, JwtTokenService>();

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .ValidateDataAnnotations()
            // Copying .env.example without editing it must not produce a working (and publicly known) key.
            .Validate(o => string.IsNullOrEmpty(o.SigningKey)
                           || !o.SigningKey.Contains("change-me", StringComparison.OrdinalIgnoreCase),
                "Auth:Jwt:SigningKey is still a placeholder. Generate a real key (see server/.env.example).")
            .ValidateOnStart();

        services.AddOptions<LoginProtectionOptions>()
            .Bind(configuration.GetSection(LoginProtectionOptions.SectionName));

        services.AddOptions<NbpOptions>().Bind(configuration.GetSection(NbpOptions.SectionName));
        services.AddHttpClient(NbpOptions.HttpClientName, (sp, client) =>
            {
                client.BaseAddress = new Uri(sp.GetRequiredService<IOptions<NbpOptions>>().Value.BaseUrl);
                client.DefaultRequestHeaders.Accept.Add(new("application/json"));
            })
            .AddStandardResilienceHandler(); // timeouts, retries and circuit breaker for NBP outages
        services.AddSingleton<IExchangeRateProvider, NbpExchangeRateProvider>();
        services.AddSingleton<IHistoricalExchangeRateProvider, NbpHistoricalExchangeRateProvider>();

        return services;
    }
}

internal sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
