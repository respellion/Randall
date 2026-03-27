namespace Randall.Domain.Reservations;

public static class ReservationFactory
{
    public static Reservation Reconstitute(
        Guid id, Guid workplaceId, string employeeEmail, string employeeName,
        DateOnly date, ReservationStatus status, DateTime createdAt) =>
        new(id, workplaceId, employeeEmail, employeeName, date, status, createdAt);
}
