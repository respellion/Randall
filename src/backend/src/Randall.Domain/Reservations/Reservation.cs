using Randall.Domain.Common;

namespace Randall.Domain.Reservations;

public class Reservation : Entity
{
    public static readonly int MaxAdvanceDays = 14;

    public Guid WorkplaceId { get; private set; }
    public string EmployeeEmail { get; private set; }
    public string EmployeeName { get; private set; }
    public DateOnly Date { get; private set; }
    public ReservationStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    internal Reservation(
        Guid id, Guid workplaceId, string employeeEmail, string employeeName,
        DateOnly date, ReservationStatus status, DateTime createdAt) : base(id)
    {
        WorkplaceId = workplaceId;
        EmployeeEmail = employeeEmail;
        EmployeeName = employeeName;
        Date = date;
        Status = status;
        CreatedAt = createdAt;
    }

    private Reservation(Guid workplaceId, string employeeEmail, string employeeName, DateOnly date)
        : base()
    {
        WorkplaceId = workplaceId;
        EmployeeEmail = employeeEmail;
        EmployeeName = employeeName;
        Date = date;
        Status = ReservationStatus.Active;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<Reservation> Create(
        Guid workplaceId,
        string employeeEmail,
        string employeeName,
        DateOnly date,
        DateOnly today)
    {
        if (date < today)
            return Result.Failure<Reservation>("Cannot reserve a workplace in the past.");

        if (date > today.AddDays(MaxAdvanceDays))
            return Result.Failure<Reservation>($"Cannot reserve more than {MaxAdvanceDays} days in advance.");

        return Result.Success(new Reservation(workplaceId, employeeEmail, employeeName, date));
    }

    public Result Cancel()
    {
        if (Status == ReservationStatus.Cancelled)
            return Result.Failure("Reservation is already cancelled.");

        Status = ReservationStatus.Cancelled;
        return Result.Success();
    }
}
