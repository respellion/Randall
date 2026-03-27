namespace Randall.Domain.Users;

public static class UserFactory
{
    public static User Reconstitute(Guid id, string email, string name, string passwordHash, bool isApproved, bool isAdmin) =>
        new(id, email, name, passwordHash, isApproved, isAdmin);
}
