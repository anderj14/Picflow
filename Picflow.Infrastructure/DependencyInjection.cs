using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;
using Picflow.Core.Services;
using Picflow.Infrastructure.Configuration;
using Picflow.Infrastructure.Persistence;
using Picflow.Infrastructure.Repositories;
using Picflow.Infrastructure.Services;

namespace Picflow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // JWT settings (needed by both Infrastructure and API)
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        // MongoDB
        MongoDbConfiguration.Configure();
        services.Configure<MongoDbSettings>(configuration.GetSection("MongoDB"));
        services.AddSingleton<PicflowDbContext>(sp =>
        {
            var settings = configuration.GetSection("MongoDB").Get<MongoDbSettings>()!;
            return new PicflowDbContext(settings);
        });

        // Cloudinary
        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));
        services.AddScoped<IMediaService, CloudinaryMediaService>();

        // Token service
        services.AddScoped<ITokenService, JwtTokenService>();

        // Repositories
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<ICitaRepository, CitaRepository>();
        services.AddScoped<IFotografiaRepository, FotografiaRepository>();
        services.AddScoped<IFacturaRepository, FacturaRepository>();
        services.AddScoped<IPagoRepository, PagoRepository>();

        return services;
    }
}
