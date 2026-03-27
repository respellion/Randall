using Randall.Domain.Workplaces;
using Randall.Infrastructure.Persistence.Records;

namespace Randall.Infrastructure.Persistence.Mappers;

public static class WorkplaceMapper
{
    public static Workplace ToDomain(WorkplaceRecord record) =>
        WorkplaceFactory.Reconstitute(
            record.Id,
            record.Name,
            record.Location,
            record.IsActive);

    public static WorkplaceRecord ToRecord(Workplace domain) =>
        new()
        {
            Id = domain.Id,
            Name = domain.Name,
            Location = domain.Location,
            IsActive = domain.IsActive,
        };
}
