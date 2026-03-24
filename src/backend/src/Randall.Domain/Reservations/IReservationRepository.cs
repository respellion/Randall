namespace Randall.Domain.Reservations;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> GetByEmployeeAsync(string employeeEmail, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> GetByWorkplaceAndDateAsync(Guid workplaceId, DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> GetActiveReservationsForDateAsync(DateOnly date, CancellationToken ct = default);
    Task<bool> ExistsActiveForEmployeeOnDateAsync(string employeeEmail, DateOnly date, CancellationToken ct = default);
    Task<bool> ExistsActiveForWorkplaceOnDateAsync(Guid workplaceId, DateOnly date, CancellationToken ct = default);
    Task AddAsync(Reservation reservation, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
