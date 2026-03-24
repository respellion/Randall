using Randall.Domain.Common;
using Randall.Domain.Workplaces;

namespace Randall.Application.Workplaces.GetAllWorkplaces;

public record WorkplaceDto(Guid Id, string Name, string Location);

public class GetAllWorkplacesHandler(IWorkplaceRepository workplaceRepository)
{
    public async Task<Result<IReadOnlyList<WorkplaceDto>>> HandleAsync(CancellationToken ct = default)
    {
        var workplaces = await workplaceRepository.GetAllActiveAsync(ct);
        var dtos = workplaces
            .Select(w => new WorkplaceDto(w.Id, w.Name, w.Location))
            .ToList();

        return Result.Success<IReadOnlyList<WorkplaceDto>>(dtos);
    }
}
