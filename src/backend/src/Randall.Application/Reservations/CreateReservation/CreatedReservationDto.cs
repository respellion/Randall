namespace Randall.Application.Reservations.CreateReservation;

public record CreatedReservationDto(Guid Id, Guid WorkplaceId, string EmployeeName, DateOnly Date);
