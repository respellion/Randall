using Randall.Domain.Common;
using Randall.Domain.Reservations;

namespace Randall.Application.Reservations.CancelReservation;

public class CancelReservationHandler(IReservationRepository reservationRepository)
{
    public async Task<Result> HandleAsync(
        CancelReservationCommand command,
        CancellationToken ct = default)
    {
        var reservation = await reservationRepository.GetByIdAsync(command.ReservationId, ct);
        if (reservation is null)
            return Result.Failure("Reservation not found.");

        if (!string.Equals(reservation.EmployeeEmail, command.EmployeeEmail, StringComparison.OrdinalIgnoreCase))
            return Result.Failure("You are not allowed to cancel this reservation.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (reservation.Date < today)
            return Result.Failure("Cannot cancel a reservation for a past date.");

        var result = reservation.Cancel();
        if (!result.IsSuccess)
            return result;

        await reservationRepository.SaveChangesAsync(ct);
        return Result.Success();
    }
}
