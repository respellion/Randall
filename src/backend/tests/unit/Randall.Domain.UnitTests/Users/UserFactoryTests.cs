using Randall.Domain.Users;

namespace Randall.Domain.UnitTests.Users;

public class UserFactoryTests
{
    private static readonly Guid Id = Guid.NewGuid();
    private const string Email = "jane@company.com";
    private const string Name = "Jane Smith";
    private const string PasswordHash = "hashed-password";

    [Fact]
    public void Reconstitute_MapsAllFieldsExactly()
    {
        var user = UserFactory.Reconstitute(Id, Email, Name, PasswordHash, isApproved: true, isAdmin: false);

        Assert.Equal(Id, user.Id);
        Assert.Equal(Email, user.Email);
        Assert.Equal(Name, user.Name);
        Assert.Equal(PasswordHash, user.PasswordHash);
        Assert.True(user.IsApproved);
        Assert.False(user.IsAdmin);
    }

    [Fact]
    public void Reconstitute_PreservesProvidedId()
    {
        var user = UserFactory.Reconstitute(Id, Email, Name, PasswordHash, isApproved: false, isAdmin: false);

        Assert.Equal(Id, user.Id);
    }

    [Fact]
    public void Reconstitute_CanRestoreApprovedNonAdminUser()
    {
        var user = UserFactory.Reconstitute(Id, Email, Name, PasswordHash, isApproved: true, isAdmin: false);

        Assert.True(user.IsApproved);
        Assert.False(user.IsAdmin);
    }

    [Fact]
    public void Reconstitute_CanRestoreUnapprovedUser()
    {
        var user = UserFactory.Reconstitute(Id, Email, Name, PasswordHash, isApproved: false, isAdmin: false);

        Assert.False(user.IsApproved);
    }

    [Fact]
    public void Reconstitute_CanRestoreAdminUser()
    {
        var user = UserFactory.Reconstitute(Id, Email, Name, PasswordHash, isApproved: true, isAdmin: true);

        Assert.True(user.IsAdmin);
        Assert.True(user.IsApproved);
    }
}
