namespace Randall.Application.Reservations.CancelReservation;

public record CancelReservationCommand(Guid ReservationId, string EmployeeEmail);
