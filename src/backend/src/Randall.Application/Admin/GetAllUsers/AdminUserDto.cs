namespace Randall.Application.Admin.GetAllUsers;

public record AdminUserDto(Guid Id, string Name, string Email, bool IsApproved, bool IsAdmin);
