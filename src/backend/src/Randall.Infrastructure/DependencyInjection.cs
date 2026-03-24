using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Randall.Application.Common;
using Randall.Domain.Reservations;
using Randall.Domain.Users;
using Randall.Domain.Workplaces;
using Randall.Infrastructure.Persistence;
using Randall.Infrastructure.Persistence.Reservations;
using Randall.Infrastructure.Persistence.Users;
using Randall.Infrastructure.Persistence.Workplaces;
using Randall.Infrastructure.Security;

namespace Randall.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IWorkplaceRepository, WorkplaceRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        return services;
    }
}
