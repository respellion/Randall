using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Randall.Application.Workplaces.GetAllWorkplaces;
using Randall.Application.Workplaces.GetAvailableWorkplaces;
using Randall.Application.Workplaces.GetWorkplaceSchedule;

namespace Randall.Api.Workplaces;

[ApiController]
[Route("api/workplaces")]
[Authorize]
public class WorkplacesController(
    GetAllWorkplacesHandler getAllHandler,
    GetAvailableWorkplacesHandler getAvailableHandler,
    GetWorkplaceScheduleHandler getScheduleHandler) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<WorkplaceDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await getAllHandler.HandleAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet("available")]
    [ProducesResponseType<IReadOnlyList<AvailableWorkplaceDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAvailable([FromQuery] DateOnly date, CancellationToken ct)
    {
        var result = await getAvailableHandler.HandleAsync(new GetAvailableWorkplacesQuery(date), ct);

        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });

        return Ok(result.Value);
    }

    [HttpGet("schedule")]
    [ProducesResponseType<IReadOnlyList<WorkplaceScheduleDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetSchedule([FromQuery] DateOnly date, CancellationToken ct)
    {
        var result = await getScheduleHandler.HandleAsync(date, ct);

        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });

        return Ok(result.Value);
    }
}
