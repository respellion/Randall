namespace Randall.Api.Reservations;

public record CreateReservationRequest(Guid WorkplaceId, DateOnly Date);
