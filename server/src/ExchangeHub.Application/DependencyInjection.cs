using ExchangeHub.Application.Abstractions.Messaging;
using ExchangeHub.Application.Auth;
using ExchangeHub.Application.Exchange;
using Microsoft.Extensions.DependencyInjection;

namespace ExchangeHub.Application;

public static class DependencyInjection
{
    private static readonly Type[] HandlerInterfaces =
        [typeof(ICommandHandler<>), typeof(ICommandHandler<,>), typeof(IQueryHandler<,>)];

    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<TokenIssuer>();
        services.AddScoped<CurrencyExchange>();

        // Hand-rolled CQRS: each handler is registered against its closed handler interface.
        var registrations = typeof(DependencyInjection).Assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false })
            .SelectMany(t => t.GetInterfaces()
                .Where(i => i.IsGenericType && HandlerInterfaces.Contains(i.GetGenericTypeDefinition()))
                .Select(i => (Service: i, Implementation: t)));

        foreach (var (service, implementation) in registrations)
            services.AddScoped(service, implementation);

        return services;
    }
}
