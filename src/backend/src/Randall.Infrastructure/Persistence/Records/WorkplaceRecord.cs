namespace Randall.Infrastructure.Persistence.Records;

public class WorkplaceRecord
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
