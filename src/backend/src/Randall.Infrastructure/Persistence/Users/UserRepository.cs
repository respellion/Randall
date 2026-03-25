using Microsoft.EntityFrameworkCore;
using Randall.Domain.Users;

namespace Randall.Infrastructure.Persistence.Users;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        context.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) =>
        context.Users.AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public Task<List<User>> GetPendingAsync(CancellationToken ct = default) =>
        context.Users.Where(u => !u.IsApproved && !u.IsAdmin).ToListAsync(ct);

    public Task<List<User>> GetAllAsync(CancellationToken ct = default) =>
        context.Users.OrderBy(u => u.Name).ToListAsync(ct);

    public Task<int> CountAdminsAsync(CancellationToken ct = default) =>
        context.Users.CountAsync(u => u.IsAdmin);

    public Task<List<User>> GetAllNonAdminAsync(CancellationToken ct = default) =>
        context.Users.Where(u => !u.IsAdmin).OrderBy(u => u.Name).ToListAsync(ct);

    public async Task AddAsync(User user, CancellationToken ct = default) =>
        await context.Users.AddAsync(user, ct);

    public void Delete(User user) =>
        context.Users.Remove(user);

    public Task SaveChangesAsync(CancellationToken ct = default) =>
        context.SaveChangesAsync(ct);
}
