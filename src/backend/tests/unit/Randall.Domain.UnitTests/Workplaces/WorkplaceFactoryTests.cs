using Randall.Domain.Workplaces;

namespace Randall.Domain.UnitTests.Workplaces;

public class WorkplaceFactoryTests
{
    private static readonly Guid Id = Guid.NewGuid();
    private const string Name = "D13";
    private const string Location = "Pod A";

    [Fact]
    public void Reconstitute_MapsAllFieldsExactly()
    {
        var workplace = WorkplaceFactory.Reconstitute(Id, Name, Location, isActive: true);

        Assert.Equal(Id, workplace.Id);
        Assert.Equal(Name, workplace.Name);
        Assert.Equal(Location, workplace.Location);
        Assert.True(workplace.IsActive);
    }

    [Fact]
    public void Reconstitute_PreservesProvidedId()
    {
        var workplace = WorkplaceFactory.Reconstitute(Id, Name, Location, isActive: true);

        Assert.Equal(Id, workplace.Id);
    }

    [Fact]
    public void Reconstitute_CanRestoreActiveWorkplace()
    {
        var workplace = WorkplaceFactory.Reconstitute(Id, Name, Location, isActive: true);

        Assert.True(workplace.IsActive);
    }

    [Fact]
    public void Reconstitute_CanRestoreInactiveWorkplace()
    {
        var workplace = WorkplaceFactory.Reconstitute(Id, Name, Location, isActive: false);

        Assert.False(workplace.IsActive);
    }
}
