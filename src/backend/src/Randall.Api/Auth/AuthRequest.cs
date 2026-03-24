namespace Randall.Api.Auth;

public record AuthRequest(string Email, string Password, string? Name);
