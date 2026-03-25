using Randall.Domain.Users;

namespace Randall.Domain.UnitTests.Users;

public class UserCreateTests
{
    [Fact]
    public void Create_WithValidData_Succeeds()
    {
        var result = User.Create("jane@company.com", "Jane Smith", "hash");

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
    }

    [Fact]
    public void Create_NormalisesEmailToLowercase()
    {
        var result = User.Create("JANE@COMPANY.COM", "Jane Smith", "hash");

        Assert.Equal("jane@company.com", result.Value!.Email);
    }

    [Fact]
    public void Create_TrimsNameWhitespace()
    {
        var result = User.Create("jane@company.com", "  Jane Smith  ", "hash");

        Assert.Equal("Jane Smith", result.Value!.Name);
    }

    [Fact]
    public void Create_WithEmptyEmail_Fails()
    {
        var result = User.Create("", "Jane Smith", "hash");

        Assert.False(result.IsSuccess);
        Assert.Contains("email", result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Create_WithWhitespaceEmail_Fails()
    {
        var result = User.Create("   ", "Jane Smith", "hash");

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public void Create_WithEmptyName_Fails()
    {
        var result = User.Create("jane@company.com", "", "hash");

        Assert.False(result.IsSuccess);
        Assert.Contains("name", result.Error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Create_RegularUser_IsNotApprovedByDefault()
    {
        var result = User.Create("jane@company.com", "Jane Smith", "hash");

        Assert.False(result.Value!.IsApproved);
        Assert.False(result.Value!.IsAdmin);
    }

    [Fact]
    public void Create_AdminUser_IsAutoApproved()
    {
        var result = User.Create("admin@company.com", "Admin", "hash", isAdmin: true);

        Assert.True(result.Value!.IsAdmin);
        Assert.True(result.Value!.IsApproved);
    }

    [Fact]
    public void Create_AssignsUniqueId()
    {
        var a = User.Create("a@company.com", "A", "hash").Value!;
        var b = User.Create("b@company.com", "B", "hash").Value!;

        Assert.NotEqual(a.Id, b.Id);
    }
}
