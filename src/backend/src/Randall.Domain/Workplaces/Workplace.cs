using Randall.Domain.Common;

namespace Randall.Domain.Workplaces;

public class Workplace : Entity
{
    public string Name { get; private set; }
    public string Location { get; private set; }
    public bool IsActive { get; private set; }

    public static Workplace Reconstitute(Guid id, string name, string location, bool isActive) =>
        new(id, name, location, isActive);

    private Workplace(Guid id, string name, string location, bool isActive) : base(id)
    {
        Name = name;
        Location = location;
        IsActive = isActive;
    }

    public Workplace(string name, string location) : base()
    {
        Name = name;
        Location = location;
        IsActive = true;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
