using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Admin.ApproveUser;

public class ApproveUserHandler(IUserRepository userRepository)
{
    public async Task<Result> HandleAsync(ApproveUserCommand command, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdAsync(command.UserId, ct);
        if (user is null)
            return Result.Failure("User not found.");

        user.Approve();
        await userRepository.SaveChangesAsync(ct);
        return Result.Success();
    }
}
