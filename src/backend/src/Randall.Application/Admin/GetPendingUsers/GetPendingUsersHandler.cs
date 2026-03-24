using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Admin.GetPendingUsers;

public class GetPendingUsersHandler(IUserRepository userRepository)
{
    public async Task<Result<List<PendingUserDto>>> HandleAsync(CancellationToken ct = default)
    {
        var users = await userRepository.GetPendingAsync(ct);
        var dtos = users.Select(u => new PendingUserDto(u.Id, u.Name, u.Email)).ToList();
        return Result.Success(dtos);
    }
}
