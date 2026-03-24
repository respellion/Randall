using Randall.Domain.Common;

namespace Randall.Domain.Users;

public class User : Entity
{
    public string Email { get; private set; }
    public string Name { get; private set; }
    public string PasswordHash { get; private set; }
    public bool IsApproved { get; private set; }
    public bool IsAdmin { get; private set; }

    private User() : base()
    {
        Email = string.Empty;
        Name = string.Empty;
        PasswordHash = string.Empty;
    }

    private User(string email, string name, string passwordHash, bool isAdmin) : base()
    {
        Email = email;
        Name = name;
        PasswordHash = passwordHash;
        IsAdmin = isAdmin;
        IsApproved = isAdmin; // admins are auto-approved
    }

    public static Result<User> Create(string email, string name, string passwordHash, bool isAdmin = false)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<User>("Email is required.");

        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<User>("Name is required.");

        return Result.Success(new User(email.ToLowerInvariant(), name.Trim(), passwordHash, isAdmin));
    }

    public void Approve() => IsApproved = true;

    public void MakeAdmin()
    {
        IsAdmin = true;
        IsApproved = true;
    }
}
