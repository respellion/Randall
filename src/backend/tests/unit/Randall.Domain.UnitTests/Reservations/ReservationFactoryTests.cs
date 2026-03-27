using Randall.Domain.Reservations;

namespace Randall.Domain.UnitTests.Reservations;

public class ReservationFactoryTests
{
    private static readonly Guid Id = Guid.NewGuid();
    private static readonly Guid WorkplaceId = Guid.NewGuid();
    private const string Email = "jane@company.com";
    private const string Name = "Jane Smith";
    private static readonly DateOnly Date = new(2026, 6, 1);
    private static readonly DateTime CreatedAt = new(2026, 5, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Reconstitute_MapsAllFieldsExactly()
    {
        var reservation = ReservationFactory.Reconstitute(Id, WorkplaceId, Email, Name, Date, ReservationStatus.Active, CreatedAt);

        Assert.Equal(Id, reservation.Id);
        Assert.Equal(WorkplaceId, reservation.WorkplaceId);
        Assert.Equal(Email, reservation.EmployeeEmail);
        Assert.Equal(Name, reservation.EmployeeName);
        Assert.Equal(Date, reservation.Date);
        Assert.Equal(ReservationStatus.Active, reservation.Status);
        Assert.Equal(CreatedAt, reservation.CreatedAt);
    }

    [Fact]
    public void Reconstitute_PreservesProvidedId()
    {
        var reservation = ReservationFactory.Reconstitute(Id, WorkplaceId, Email, Name, Date, ReservationStatus.Active, CreatedAt);

        Assert.Equal(Id, reservation.Id);
    }

    [Fact]
    public void Reconstitute_CanRestoreActiveReservation()
    {
        var reservation = ReservationFactory.Reconstitute(Id, WorkplaceId, Email, Name, Date, ReservationStatus.Active, CreatedAt);

        Assert.Equal(ReservationStatus.Active, reservation.Status);
    }

    [Fact]
    public void Reconstitute_CanRestoreCancelledReservation()
    {
        var reservation = ReservationFactory.Reconstitute(Id, WorkplaceId, Email, Name, Date, ReservationStatus.Cancelled, CreatedAt);

        Assert.Equal(ReservationStatus.Cancelled, reservation.Status);
    }

    [Fact]
    public void Reconstitute_CanRestorePastReservation()
    {
        var pastDate = new DateOnly(2020, 1, 1);

        var reservation = ReservationFactory.Reconstitute(Id, WorkplaceId, Email, Name, pastDate, ReservationStatus.Active, CreatedAt);

        Assert.Equal(pastDate, reservation.Date);
    }
}
