namespace Randall.Domain.Workplaces;

public interface IWorkplaceRepository
{
    Task<Workplace?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Workplace>> GetAllActiveAsync(CancellationToken ct = default);
}
