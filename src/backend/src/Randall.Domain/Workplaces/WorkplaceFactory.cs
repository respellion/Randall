namespace Randall.Domain.Workplaces;

public static class WorkplaceFactory
{
    public static Workplace Reconstitute(Guid id, string name, string location, bool isActive) =>
        new(id, name, location, isActive);
}
