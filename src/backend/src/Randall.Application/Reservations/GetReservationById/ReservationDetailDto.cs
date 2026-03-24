using Randall.Domain.Reservations;

namespace Randall.Application.Reservations.GetReservationById;

public record ReservationDetailDto(
    Guid Id,
    Guid WorkplaceId,
    string WorkplaceName,
    string WorkplaceLocation,
    string EmployeeName,
    string EmployeeEmail,
    DateOnly Date,
    ReservationStatus Status,
    DateTime CreatedAt);
