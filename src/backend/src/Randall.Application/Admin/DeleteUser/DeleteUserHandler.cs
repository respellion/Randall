using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Admin.DeleteUser;

public class DeleteUserHandler(IUserRepository userRepository)
{
    public async Task<Result> HandleAsync(DeleteUserCommand command, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdAsync(command.UserId, ct);
        if (user is null)
            return Result.Failure("User not found.");

        if (user.Id == command.RequesterId)
            return Result.Failure("You cannot delete your own account.");

        if (user.IsAdmin)
        {
            var adminCount = await userRepository.CountAdminsAsync(ct);
            if (adminCount <= 1)
                return Result.Failure("Cannot delete the last admin account.");
        }

        userRepository.Delete(user);
        await userRepository.SaveChangesAsync(ct);
        return Result.Success();
    }
}
