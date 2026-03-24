using Microsoft.EntityFrameworkCore;
using Randall.Domain.Reservations;

namespace Randall.Infrastructure.Persistence.Reservations;

public class ReservationRepository(AppDbContext context) : IReservationRepository
{
    public Task<Reservation?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Reservations.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IReadOnlyList<Reservation>> GetByEmployeeAsync(string employeeEmail, CancellationToken ct = default) =>
        await context.Reservations
            .Where(r => r.EmployeeEmail.ToLower() == employeeEmail.ToLower())
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Reservation>> GetByWorkplaceAndDateAsync(
        Guid workplaceId, DateOnly date, CancellationToken ct = default) =>
        await context.Reservations
            .Where(r => r.WorkplaceId == workplaceId && r.Date == date)
            .ToListAsync(ct);

    public Task<bool> ExistsActiveForEmployeeOnDateAsync(
        string employeeEmail, DateOnly date, CancellationToken ct = default) =>
        context.Reservations.AnyAsync(
            r => r.EmployeeEmail.ToLower() == employeeEmail.ToLower()
              && r.Date == date
              && r.Status == ReservationStatus.Active,
            ct);

    public Task<bool> ExistsActiveForWorkplaceOnDateAsync(
        Guid workplaceId, DateOnly date, CancellationToken ct = default) =>
        context.Reservations.AnyAsync(
            r => r.WorkplaceId == workplaceId
              && r.Date == date
              && r.Status == ReservationStatus.Active,
            ct);

    public async Task<IReadOnlyList<Reservation>> GetActiveReservationsForDateAsync(
        DateOnly date, CancellationToken ct = default) =>
        await context.Reservations
            .Where(r => r.Date == date && r.Status == ReservationStatus.Active)
            .ToListAsync(ct);

    public async Task AddAsync(Reservation reservation, CancellationToken ct = default) =>
        await context.Reservations.AddAsync(reservation, ct);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        context.SaveChangesAsync(ct);
}
