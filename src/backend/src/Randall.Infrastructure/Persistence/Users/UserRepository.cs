using Microsoft.EntityFrameworkCore;
using Randall.Domain.Users;
using Randall.Infrastructure.Persistence.Mappers;
using Randall.Infrastructure.Persistence.Records;

namespace Randall.Infrastructure.Persistence.Users;

public class UserRepository(AppDbContext context) : IUserRepository
{
    private readonly Dictionary<Guid, (User Domain, UserRecord Record)> _tracked = [];

    private User Track(UserRecord record)
    {
        var domain = UserMapper.ToDomain(record);
        _tracked[domain.Id] = (domain, record);
        return domain;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        var record = await context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);
        return record is null ? null : Track(record);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var record = await context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        return record is null ? null : Track(record);
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) =>
        context.Users.AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<List<User>> GetPendingAsync(CancellationToken ct = default)
    {
        var records = await context.Users.Where(u => !u.IsApproved && !u.IsAdmin).ToListAsync(ct);
        return records.Select(UserMapper.ToDomain).ToList();
    }

    public async Task<List<User>> GetAllAsync(CancellationToken ct = default)
    {
        var records = await context.Users.OrderBy(u => u.Name).ToListAsync(ct);
        return records.Select(UserMapper.ToDomain).ToList();
    }

    public Task<int> CountAdminsAsync(CancellationToken ct = default) =>
        context.Users.CountAsync(u => u.IsAdmin);

    public async Task<List<User>> GetAllNonAdminAsync(CancellationToken ct = default)
    {
        var records = await context.Users.Where(u => !u.IsAdmin).OrderBy(u => u.Name).ToListAsync(ct);
        return records.Select(UserMapper.ToDomain).ToList();
    }

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        var record = UserMapper.ToRecord(user);
        await context.Users.AddAsync(record, ct);
    }

    public void Delete(User user)
    {
        if (_tracked.TryGetValue(user.Id, out var entry))
            context.Users.Remove(entry.Record);
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var (domain, record) in _tracked.Values)
            UserMapper.SyncToRecord(domain, record);
        return context.SaveChangesAsync(ct);
    }
}
