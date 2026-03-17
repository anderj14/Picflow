using Microsoft.Extensions.DependencyInjection;
using Picflow.Core.Interfaces.Services;
using Picflow.Core.Services;

namespace Picflow.Core;

public static class DependencyInjection
{
    public static IServiceCollection AddCore(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClienteService, ClienteService>();
        services.AddScoped<ICitaService, CitaService>();
        services.AddScoped<IFotografiaService, FotografiaService>();
        services.AddScoped<IFacturaService, FacturaService>();
        return services;
    }
}
