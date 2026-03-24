using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Admin.GetAllUsers;

public class GetAllUsersHandler(IUserRepository userRepository)
{
    public async Task<Result<List<AdminUserDto>>> HandleAsync(CancellationToken ct = default)
    {
        var users = await userRepository.GetAllAsync(ct);
        var dtos = users.Select(u => new AdminUserDto(u.Id, u.Name, u.Email, u.IsApproved, u.IsAdmin)).ToList();
        return Result.Success(dtos);
    }
}
