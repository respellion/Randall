using Randall.Domain.Reservations;

namespace Randall.Domain.UnitTests.Reservations;

public class ReservationCancelTests
{
    private static Reservation CreateActiveReservation()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return Reservation.Create(Guid.NewGuid(), "jane@company.com", "Jane", today, today).Value!;
    }

    [Fact]
    public void Cancel_ActiveReservation_Succeeds()
    {
        var reservation = CreateActiveReservation();

        var result = reservation.Cancel();

        Assert.True(result.IsSuccess);
        Assert.Equal(ReservationStatus.Cancelled, reservation.Status);
    }

    [Fact]
    public void Cancel_AlreadyCancelledReservation_Fails()
    {
        var reservation = CreateActiveReservation();
        reservation.Cancel();

        var result = reservation.Cancel();

        Assert.False(result.IsSuccess);
        Assert.Contains("already cancelled", result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Cancel_DoesNotChangeOtherFields()
    {
        var reservation = CreateActiveReservation();
        var originalDate = reservation.Date;
        var originalEmail = reservation.EmployeeEmail;

        reservation.Cancel();

        Assert.Equal(originalDate, reservation.Date);
        Assert.Equal(originalEmail, reservation.EmployeeEmail);
    }
}
