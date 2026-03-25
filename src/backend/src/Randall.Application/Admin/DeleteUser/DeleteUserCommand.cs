namespace Randall.Application.Admin.DeleteUser;

public record DeleteUserCommand(Guid RequesterId, Guid UserId);
