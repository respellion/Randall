using Randall.Domain.Users;
using Randall.Infrastructure.Persistence.Records;

namespace Randall.Infrastructure.Persistence.Mappers;

public static class UserMapper
{
    public static User ToDomain(UserRecord record) =>
        UserFactory.Reconstitute(
            record.Id,
            record.Email,
            record.Name,
            record.PasswordHash,
            record.IsApproved,
            record.IsAdmin);

    public static UserRecord ToRecord(User domain) =>
        new()
        {
            Id = domain.Id,
            Email = domain.Email,
            Name = domain.Name,
            PasswordHash = domain.PasswordHash,
            IsApproved = domain.IsApproved,
            IsAdmin = domain.IsAdmin,
        };

    public static void SyncToRecord(User domain, UserRecord record)
    {
        record.IsApproved = domain.IsApproved;
        record.IsAdmin = domain.IsAdmin;
    }
}
