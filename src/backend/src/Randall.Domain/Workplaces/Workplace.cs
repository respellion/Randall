using Randall.Domain.Common;

namespace Randall.Domain.Workplaces;

public class Workplace : Entity
{
    public string Name { get; private set; }
    public string Location { get; private set; }
    public bool IsActive { get; private set; }

    internal Workplace(Guid id, string name, string location, bool isActive) : base(id)
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
