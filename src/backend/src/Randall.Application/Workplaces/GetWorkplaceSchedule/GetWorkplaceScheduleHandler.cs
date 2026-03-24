using Randall.Domain.Common;
using Randall.Domain.Reservations;
using Randall.Domain.Workplaces;

namespace Randall.Application.Workplaces.GetWorkplaceSchedule;

public class GetWorkplaceScheduleHandler(
    IWorkplaceRepository workplaceRepository,
    IReservationRepository reservationRepository)
{
    public async Task<Result<IReadOnlyList<WorkplaceScheduleDto>>> HandleAsync(
        DateOnly date,
        CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (date < today)
            return Result.Failure<IReadOnlyList<WorkplaceScheduleDto>>("Date cannot be in the past.");

        if (date > today.AddDays(Reservation.MaxAdvanceDays))
            return Result.Failure<IReadOnlyList<WorkplaceScheduleDto>>(
                $"Date cannot be more than {Reservation.MaxAdvanceDays} days in advance.");

        var workplaces = await workplaceRepository.GetAllActiveAsync(ct);
        var reservations = await reservationRepository.GetActiveReservationsForDateAsync(date, ct);

        var reservationByWorkplace = reservations.ToDictionary(r => r.WorkplaceId);

        var schedule = workplaces.Select(w =>
        {
            var hasReservation = reservationByWorkplace.TryGetValue(w.Id, out var reservation);
            return new WorkplaceScheduleDto(
                w.Id,
                w.Name,
                w.Location,
                IsAvailable: !hasReservation,
                ReservedBy: hasReservation ? reservation!.EmployeeName : null);
        }).ToList();

        return Result.Success<IReadOnlyList<WorkplaceScheduleDto>>(schedule);
    }
}
