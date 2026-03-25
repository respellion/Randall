using Randall.Domain.Users;

namespace Randall.Domain.UnitTests.Users;

public class UserStateTests
{
    private static User CreateRegularUser() =>
        User.Create("jane@company.com", "Jane Smith", "hash").Value!;

    [Fact]
    public void Approve_SetsIsApprovedToTrue()
    {
        var user = CreateRegularUser();

        user.Approve();

        Assert.True(user.IsApproved);
    }

    [Fact]
    public void MakeAdmin_SetsIsAdminAndIsApproved()
    {
        var user = CreateRegularUser();

        user.MakeAdmin();

        Assert.True(user.IsAdmin);
        Assert.True(user.IsApproved);
    }

    [Fact]
    public void MakeAdmin_OnAlreadyApprovedUser_RemainsApproved()
    {
        var user = CreateRegularUser();
        user.Approve();

        user.MakeAdmin();

        Assert.True(user.IsApproved);
        Assert.True(user.IsAdmin);
    }
}
