using Randall.Domain.Reservations;

namespace Randall.Application.Reservations.GetMyReservations;

public record ReservationDto(
    Guid Id,
    Guid WorkplaceId,
    string WorkplaceName,
    string WorkplaceLocation,
    DateOnly Date,
    ReservationStatus Status,
    DateTime CreatedAt);
