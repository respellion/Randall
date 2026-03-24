using Microsoft.Extensions.DependencyInjection;
using Randall.Application.Admin.ApproveUser;
using Randall.Application.Admin.DeleteUser;
using Randall.Application.Admin.GetAllUsers;
using Randall.Application.Admin.GetPendingUsers;
using Randall.Application.Admin.MakeAdmin;
using Randall.Application.Auth.Login;
using Randall.Application.Auth.Register;
using Randall.Application.Reservations.CancelReservation;
using Randall.Application.Reservations.CreateReservation;
using Randall.Application.Reservations.GetMyReservations;
using Randall.Application.Reservations.GetReservationById;
using Randall.Application.Workplaces.GetAllWorkplaces;
using Randall.Application.Workplaces.GetAvailableWorkplaces;
using Randall.Application.Workplaces.GetWorkplaceSchedule;

namespace Randall.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<RegisterHandler>();
        services.AddScoped<LoginHandler>();
        services.AddScoped<GetAllUsersHandler>();
        services.AddScoped<GetPendingUsersHandler>();
        services.AddScoped<ApproveUserHandler>();
        services.AddScoped<DeleteUserHandler>();
        services.AddScoped<MakeAdminHandler>();

        services.AddScoped<GetAllWorkplacesHandler>();
        services.AddScoped<GetAvailableWorkplacesHandler>();
        services.AddScoped<GetWorkplaceScheduleHandler>();
        services.AddScoped<CreateReservationHandler>();
        services.AddScoped<CancelReservationHandler>();
        services.AddScoped<GetMyReservationsHandler>();
        services.AddScoped<GetReservationByIdHandler>();

        return services;
    }
}
