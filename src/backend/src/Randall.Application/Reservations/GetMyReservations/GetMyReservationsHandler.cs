using Randall.Domain.Common;
using Randall.Domain.Reservations;
using Randall.Domain.Workplaces;

namespace Randall.Application.Reservations.GetMyReservations;

public class GetMyReservationsHandler(
    IReservationRepository reservationRepository,
    IWorkplaceRepository workplaceRepository)
{
    public async Task<Result<IReadOnlyList<ReservationDto>>> HandleAsync(
        GetMyReservationsQuery query,
        CancellationToken ct = default)
    {
        var reservations = await reservationRepository.GetByEmployeeAsync(query.EmployeeEmail, ct);

        var dtos = new List<ReservationDto>();
        foreach (var r in reservations.OrderByDescending(r => r.Date))
        {
            var workplace = await workplaceRepository.GetByIdAsync(r.WorkplaceId, ct);
            dtos.Add(new ReservationDto(
                r.Id,
                r.WorkplaceId,
                workplace?.Name ?? "Unknown",
                workplace?.Location ?? "Unknown",
                r.Date,
                r.Status,
                r.CreatedAt));
        }

        return Result.Success<IReadOnlyList<ReservationDto>>(dtos);
    }
}
