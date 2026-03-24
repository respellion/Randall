using Randall.Domain.Common;
using Randall.Domain.Reservations;
using Randall.Domain.Workplaces;

namespace Randall.Application.Reservations.CreateReservation;

public class CreateReservationHandler(
    IWorkplaceRepository workplaceRepository,
    IReservationRepository reservationRepository)
{
    public async Task<Result<CreatedReservationDto>> HandleAsync(
        CreateReservationCommand command,
        CancellationToken ct = default)
    {
        var workplace = await workplaceRepository.GetByIdAsync(command.WorkplaceId, ct);
        if (workplace is null || !workplace.IsActive)
            return Result.Failure<CreatedReservationDto>("Workplace not found or inactive.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var alreadyBookedByEmployee = await reservationRepository
            .ExistsActiveForEmployeeOnDateAsync(command.EmployeeEmail, command.Date, ct);
        if (alreadyBookedByEmployee)
            return Result.Failure<CreatedReservationDto>("You already have a reservation on this date.");

        var workplaceTaken = await reservationRepository
            .ExistsActiveForWorkplaceOnDateAsync(command.WorkplaceId, command.Date, ct);
        if (workplaceTaken)
            return Result.Failure<CreatedReservationDto>("This workplace is already reserved on the requested date.");

        var result = Reservation.Create(
            command.WorkplaceId,
            command.EmployeeEmail,
            command.EmployeeName,
            command.Date,
            today);

        if (!result.IsSuccess)
            return Result.Failure<CreatedReservationDto>(result.Error!);

        var reservation = result.Value!;
        await reservationRepository.AddAsync(reservation, ct);
        await reservationRepository.SaveChangesAsync(ct);

        return Result.Success(new CreatedReservationDto(
            reservation.Id,
            reservation.WorkplaceId,
            reservation.EmployeeName,
            reservation.Date));
    }
}
