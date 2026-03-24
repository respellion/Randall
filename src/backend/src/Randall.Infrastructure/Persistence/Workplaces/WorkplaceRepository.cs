using Microsoft.EntityFrameworkCore;
using Randall.Domain.Workplaces;

namespace Randall.Infrastructure.Persistence.Workplaces;

public class WorkplaceRepository(AppDbContext context) : IWorkplaceRepository
{
    public Task<Workplace?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Workplaces.FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task<IReadOnlyList<Workplace>> GetAllActiveAsync(CancellationToken ct = default) =>
        await context.Workplaces.Where(w => w.IsActive).ToListAsync(ct);
}
