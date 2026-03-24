using Randall.Domain.Common;
using Randall.Domain.Reservations;
using Randall.Domain.Workplaces;

namespace Randall.Application.Workplaces.GetAvailableWorkplaces;

public class GetAvailableWorkplacesHandler(
    IWorkplaceRepository workplaceRepository,
    IReservationRepository reservationRepository)
{
    public async Task<Result<IReadOnlyList<AvailableWorkplaceDto>>> HandleAsync(
        GetAvailableWorkplacesQuery query,
        CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (query.Date < today)
            return Result.Failure<IReadOnlyList<AvailableWorkplaceDto>>("Date cannot be in the past.");

        if (query.Date > today.AddDays(Reservation.MaxAdvanceDays))
            return Result.Failure<IReadOnlyList<AvailableWorkplaceDto>>(
                $"Date cannot be more than {Reservation.MaxAdvanceDays} days in advance.");

        var workplaces = await workplaceRepository.GetAllActiveAsync(ct);

        var available = new List<AvailableWorkplaceDto>();
        foreach (var workplace in workplaces)
        {
            var isTaken = await reservationRepository.ExistsActiveForWorkplaceOnDateAsync(workplace.Id, query.Date, ct);
            if (!isTaken)
                available.Add(new AvailableWorkplaceDto(workplace.Id, workplace.Name, workplace.Location));
        }

        return Result.Success<IReadOnlyList<AvailableWorkplaceDto>>(available);
    }
}
