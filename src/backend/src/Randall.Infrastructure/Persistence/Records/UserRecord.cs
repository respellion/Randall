namespace Randall.Infrastructure.Persistence.Records;

public class UserRecord
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public bool IsAdmin { get; set; }
}
