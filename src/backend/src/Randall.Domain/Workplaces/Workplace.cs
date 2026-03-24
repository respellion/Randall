using Randall.Domain.Common;

namespace Randall.Domain.Workplaces;

public class Workplace : Entity
{
    public string Name { get; private set; }
    public string Location { get; private set; }
    public bool IsActive { get; private set; }

    private Workplace() : base()
    {
        Name = string.Empty;
        Location = string.Empty;
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
