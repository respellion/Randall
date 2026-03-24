using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Randall.Application.Admin.ApproveUser;
using Randall.Application.Admin.DeleteUser;
using Randall.Application.Admin.GetAllUsers;
using Randall.Application.Admin.GetPendingUsers;
using Randall.Application.Admin.MakeAdmin;

namespace Randall.Api.Admin;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController(
    GetAllUsersHandler getAllUsersHandler,
    GetPendingUsersHandler getPendingUsersHandler,
    ApproveUserHandler approveUserHandler,
    DeleteUserHandler deleteUserHandler,
    MakeAdminHandler makeAdminHandler) : ControllerBase
{
    private bool IsAdmin =>
        User.FindFirstValue("isAdmin") == "true";

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(CancellationToken ct)
    {
        if (!IsAdmin) return Forbid();
        var result = await getAllUsersHandler.HandleAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet("users/pending")]
    public async Task<IActionResult> GetPendingUsers(CancellationToken ct)
    {
        if (!IsAdmin) return Forbid();
        var result = await getPendingUsersHandler.HandleAsync(ct);
        return Ok(result.Value);
    }

    [HttpPost("users/{id}/approve")]
    public async Task<IActionResult> ApproveUser(Guid id, CancellationToken ct)
    {
        if (!IsAdmin) return Forbid();
        var result = await approveUserHandler.HandleAsync(new ApproveUserCommand(id), ct);
        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });
        return NoContent();
    }

    [HttpPost("users/{id}/make-admin")]
    public async Task<IActionResult> MakeAdmin(Guid id, CancellationToken ct)
    {
        if (!IsAdmin) return Forbid();
        var result = await makeAdminHandler.HandleAsync(new MakeAdminCommand(id), ct);
        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });
        return NoContent();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        if (!IsAdmin) return Forbid();
        var result = await deleteUserHandler.HandleAsync(new DeleteUserCommand(id), ct);
        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });
        return NoContent();
    }
}
