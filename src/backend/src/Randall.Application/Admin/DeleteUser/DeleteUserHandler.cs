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

        if (user.IsAdmin)
            return Result.Failure("Admin users cannot be deleted.");

        userRepository.Delete(user);
        await userRepository.SaveChangesAsync(ct);
        return Result.Success();
    }
}
