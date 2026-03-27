using Randall.Domain.Reservations;
using Randall.Infrastructure.Persistence.Records;

namespace Randall.Infrastructure.Persistence.Mappers;

public static class ReservationMapper
{
    public static Reservation ToDomain(ReservationRecord record) =>
        Reservation.Reconstitute(
            record.Id,
            record.WorkplaceId,
            record.EmployeeEmail,
            record.EmployeeName,
            record.Date,
            record.Status,
            record.CreatedAt);

    public static ReservationRecord ToRecord(Reservation domain) =>
        new()
        {
            Id = domain.Id,
            WorkplaceId = domain.WorkplaceId,
            EmployeeEmail = domain.EmployeeEmail,
            EmployeeName = domain.EmployeeName,
            Date = domain.Date,
            Status = domain.Status,
            CreatedAt = domain.CreatedAt,
        };

    public static void SyncToRecord(Reservation domain, ReservationRecord record)
    {
        record.Status = domain.Status;
    }
}
