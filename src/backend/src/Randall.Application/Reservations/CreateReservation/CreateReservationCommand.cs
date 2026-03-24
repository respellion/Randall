namespace Randall.Application.Reservations.CreateReservation;

public record CreateReservationCommand(
    Guid WorkplaceId,
    string EmployeeEmail,
    string EmployeeName,
    DateOnly Date);
