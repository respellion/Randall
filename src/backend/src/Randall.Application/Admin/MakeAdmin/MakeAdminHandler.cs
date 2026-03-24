using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Admin.MakeAdmin;

public class MakeAdminHandler(IUserRepository userRepository)
{
    public async Task<Result> HandleAsync(MakeAdminCommand command, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdAsync(command.UserId, ct);
        if (user is null)
            return Result.Failure("User not found.");

        user.MakeAdmin();
        await userRepository.SaveChangesAsync(ct);
        return Result.Success();
    }
}
