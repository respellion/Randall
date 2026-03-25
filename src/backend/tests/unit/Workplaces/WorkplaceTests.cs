using Randall.Domain.Workplaces;

namespace Randall.Domain.UnitTests.Workplaces;

public class WorkplaceTests
{
    [Fact]
    public void Create_IsActiveByDefault()
    {
        var workplace = new Workplace("A1", "Pod A");

        Assert.True(workplace.IsActive);
    }

    [Fact]
    public void Create_SetsNameAndLocation()
    {
        var workplace = new Workplace("A1", "Pod A");

        Assert.Equal("A1", workplace.Name);
        Assert.Equal("Pod A", workplace.Location);
    }

    [Fact]
    public void Create_AssignsNonEmptyId()
    {
        var workplace = new Workplace("A1", "Pod A");

        Assert.NotEqual(Guid.Empty, workplace.Id);
    }

    [Fact]
    public void Deactivate_SetsIsActiveToFalse()
    {
        var workplace = new Workplace("A1", "Pod A");

        workplace.Deactivate();

        Assert.False(workplace.IsActive);
    }

    [Fact]
    public void Activate_AfterDeactivate_SetsIsActiveToTrue()
    {
        var workplace = new Workplace("A1", "Pod A");
        workplace.Deactivate();

        workplace.Activate();

        Assert.True(workplace.IsActive);
    }

    [Fact]
    public void Create_TwoWorkplaces_HaveDifferentIds()
    {
        var a = new Workplace("A1", "Pod A");
        var b = new Workplace("A2", "Pod A");

        Assert.NotEqual(a.Id, b.Id);
    }
}
