using Randall.Domain.Reservations;

namespace Randall.Domain.UnitTests.Reservations;

public class ReservationCreateTests
{
    private static readonly Guid WorkplaceId = Guid.NewGuid();
    private const string Email = "jane@company.com";
    private const string Name = "Jane Smith";

    [Fact]
    public void Create_WithValidFutureDate_Succeeds()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = Reservation.Create(WorkplaceId, Email, Name, today, today);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
    }

    [Fact]
    public void Create_WithTodayAsDate_Succeeds()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = Reservation.Create(WorkplaceId, Email, Name, today, today);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public void Create_WithMaxAdvanceDate_Succeeds()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var maxDate = today.AddDays(Reservation.MaxAdvanceDays);

        var result = Reservation.Create(WorkplaceId, Email, Name, maxDate, today);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public void Create_WithPastDate_Fails()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var yesterday = today.AddDays(-1);

        var result = Reservation.Create(WorkplaceId, Email, Name, yesterday, today);

        Assert.False(result.IsSuccess);
        Assert.Contains("past", result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Create_BeyondMaxAdvanceDays_Fails()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var tooFar = today.AddDays(Reservation.MaxAdvanceDays + 1);

        var result = Reservation.Create(WorkplaceId, Email, Name, tooFar, today);

        Assert.False(result.IsSuccess);
        Assert.Contains(Reservation.MaxAdvanceDays.ToString(), result.Error);
    }

    [Fact]
    public void Create_SetsStatusToActive()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = Reservation.Create(WorkplaceId, Email, Name, today, today);

        Assert.Equal(ReservationStatus.Active, result.Value!.Status);
    }

    [Fact]
    public void Create_PopulatesAllFields()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = Reservation.Create(WorkplaceId, Email, Name, today, today);

        var reservation = result.Value!;
        Assert.Equal(WorkplaceId, reservation.WorkplaceId);
        Assert.Equal(Email, reservation.EmployeeEmail);
        Assert.Equal(Name, reservation.EmployeeName);
        Assert.Equal(today, reservation.Date);
        Assert.NotEqual(Guid.Empty, reservation.Id);
    }

    [Fact]
    public void Create_SetsCreatedAtToApproximatelyNow()
    {
        var before = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var result = Reservation.Create(WorkplaceId, Email, Name, today, today);
        var after = DateTime.UtcNow;

        Assert.InRange(result.Value!.CreatedAt, before, after);
    }
}
