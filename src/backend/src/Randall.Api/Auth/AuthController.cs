using Microsoft.AspNetCore.Mvc;
using Randall.Application.Auth;
using Randall.Application.Auth.Login;
using Randall.Application.Auth.Register;

namespace Randall.Api.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(RegisterHandler registerHandler, LoginHandler loginHandler) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType<RegisterResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] AuthRequest request, CancellationToken ct)
    {
        var result = await registerHandler.HandleAsync(
            new RegisterCommand(request.Email, request.Name ?? string.Empty, request.Password), ct);

        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });

        return Ok(result.Value);
    }

    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] AuthRequest request, CancellationToken ct)
    {
        var result = await loginHandler.HandleAsync(
            new LoginCommand(request.Email, request.Password), ct);

        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });

        return Ok(result.Value);
    }
}
