using Microsoft.EntityFrameworkCore;
using Randall.Domain.Workplaces;
using Randall.Infrastructure.Persistence.Mappers;

namespace Randall.Infrastructure.Persistence.Workplaces;

public class WorkplaceRepository(AppDbContext context) : IWorkplaceRepository
{
    public async Task<Workplace?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var record = await context.Workplaces.FirstOrDefaultAsync(w => w.Id == id, ct);
        return record is null ? null : WorkplaceMapper.ToDomain(record);
    }

    public async Task<IReadOnlyList<Workplace>> GetAllActiveAsync(CancellationToken ct = default)
    {
        var records = await context.Workplaces.Where(w => w.IsActive).ToListAsync(ct);
        return records.Select(WorkplaceMapper.ToDomain).ToList();
    }
}
