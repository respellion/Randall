using Microsoft.EntityFrameworkCore;
using Randall.Domain.Reservations;
using Randall.Infrastructure.Persistence.Mappers;
using Randall.Infrastructure.Persistence.Records;

namespace Randall.Infrastructure.Persistence.Reservations;

public class ReservationRepository(AppDbContext context) : IReservationRepository
{
    private readonly Dictionary<Guid, (Reservation Domain, ReservationRecord Record)> _tracked = [];

    public async Task<Reservation?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var record = await context.Reservations.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (record is null) return null;
        var domain = ReservationMapper.ToDomain(record);
        _tracked[domain.Id] = (domain, record);
        return domain;
    }

    public async Task<IReadOnlyList<Reservation>> GetByEmployeeAsync(string employeeEmail, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var records = await context.Reservations
            .Where(r => r.EmployeeEmail.ToLower() == employeeEmail.ToLower() && r.Date >= today)
            .ToListAsync(ct);
        return records.Select(ReservationMapper.ToDomain).ToList();
    }

    public async Task<IReadOnlyList<Reservation>> GetByWorkplaceAndDateAsync(
        Guid workplaceId, DateOnly date, CancellationToken ct = default)
    {
        var records = await context.Reservations
            .Where(r => r.WorkplaceId == workplaceId && r.Date == date)
            .ToListAsync(ct);
        return records.Select(ReservationMapper.ToDomain).ToList();
    }

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
        DateOnly date, CancellationToken ct = default)
    {
        var records = await context.Reservations
            .Where(r => r.Date == date && r.Status == ReservationStatus.Active)
            .ToListAsync(ct);
        return records.Select(ReservationMapper.ToDomain).ToList();
    }

    public async Task AddAsync(Reservation reservation, CancellationToken ct = default)
    {
        var record = ReservationMapper.ToRecord(reservation);
        await context.Reservations.AddAsync(record, ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var (domain, record) in _tracked.Values)
            ReservationMapper.SyncToRecord(domain, record);
        return context.SaveChangesAsync(ct);
    }
}
