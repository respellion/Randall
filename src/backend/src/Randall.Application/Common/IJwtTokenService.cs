namespace Randall.Application.Common;

public interface IJwtTokenService
{
    string GenerateToken(Guid userId, string email, string name, bool isAdmin);
}
