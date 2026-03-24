using Randall.Application.Common;
using Randall.Domain.Common;
using Randall.Domain.Users;

namespace Randall.Application.Auth.Login;

public class LoginHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService)
{
    public async Task<Result<AuthResponse>> HandleAsync(LoginCommand command, CancellationToken ct = default)
    {
        var user = await userRepository.GetByEmailAsync(command.Email, ct);
        if (user is null || !passwordHasher.Verify(command.Password, user.PasswordHash))
            return Result.Failure<AuthResponse>("Invalid email or password.");

        if (!user.IsApproved)
            return Result.Failure<AuthResponse>("Your account is pending approval by an administrator.");

        var token = jwtTokenService.GenerateToken(user.Id, user.Email, user.Name, user.IsAdmin);
        return Result.Success(new AuthResponse(token, user.Name, user.Email, user.IsAdmin));
    }
}
