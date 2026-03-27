using Randall.Domain.Reservations;

namespace Randall.Infrastructure.Persistence.Records;

public class ReservationRecord
{
    public Guid Id { get; set; }
    public Guid WorkplaceId { get; set; }
    public string EmployeeEmail { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
