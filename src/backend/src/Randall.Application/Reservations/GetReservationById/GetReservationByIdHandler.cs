using Randall.Domain.Common;
using Randall.Domain.Reservations;
using Randall.Domain.Workplaces;

namespace Randall.Application.Reservations.GetReservationById;

public class GetReservationByIdHandler(
    IReservationRepository reservationRepository,
    IWorkplaceRepository workplaceRepository)
{
    public async Task<Result<ReservationDetailDto>> HandleAsync(
        GetReservationByIdQuery query,
        CancellationToken ct = default)
    {
        var reservation = await reservationRepository.GetByIdAsync(query.ReservationId, ct);
        if (reservation is null)
            return Result.Failure<ReservationDetailDto>("Reservation not found.");

        var workplace = await workplaceRepository.GetByIdAsync(reservation.WorkplaceId, ct);

        return Result.Success(new ReservationDetailDto(
            reservation.Id,
            reservation.WorkplaceId,
            workplace?.Name ?? "Unknown",
            workplace?.Location ?? "Unknown",
            reservation.EmployeeName,
            reservation.EmployeeEmail,
            reservation.Date,
            reservation.Status,
            reservation.CreatedAt));
    }
}
