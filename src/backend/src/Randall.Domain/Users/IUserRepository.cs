namespace Randall.Domain.Users;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
    Task<List<User>> GetPendingAsync(CancellationToken ct = default);
    Task<List<User>> GetAllAsync(CancellationToken ct = default);
    Task<int> CountAdminsAsync(CancellationToken ct = default);
    Task<List<User>> GetAllNonAdminAsync(CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    void Delete(User user);
    Task SaveChangesAsync(CancellationToken ct = default);
}
