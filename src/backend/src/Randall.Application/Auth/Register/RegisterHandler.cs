using Randall.Application.Common;
using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Auth.Register;

public class RegisterHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
{
    public async Task<Result<RegisterResponse>> HandleAsync(RegisterCommand command, CancellationToken ct = default)
    {
        var exists = await userRepository.ExistsByEmailAsync(command.Email, ct);
        if (exists)
            return Result.Failure<RegisterResponse>("An account with this email already exists.");

        var hash = passwordHasher.Hash(command.Password);

        var result = User.Create(command.Email, command.Name, hash);
        if (!result.IsSuccess)
            return Result.Failure<RegisterResponse>(result.Error!);

        await userRepository.AddAsync(result.Value!, ct);
        await userRepository.SaveChangesAsync(ct);

        return Result.Success(new RegisterResponse("Your account is pending approval by an administrator."));
    }
}
