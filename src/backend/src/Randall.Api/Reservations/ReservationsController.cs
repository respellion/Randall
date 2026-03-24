using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Randall.Application.Reservations.CancelReservation;
using Randall.Application.Reservations.CreateReservation;
using Randall.Application.Reservations.GetMyReservations;
using Randall.Application.Reservations.GetReservationById;

namespace Randall.Api.Reservations;

[ApiController]
[Route("api/reservations")]
[Authorize]
public class ReservationsController(
    CreateReservationHandler createHandler,
    CancelReservationHandler cancelHandler,
    GetMyReservationsHandler getMyHandler,
    GetReservationByIdHandler getByIdHandler) : ControllerBase
{
    private string UserEmail => User.FindFirstValue(JwtRegisteredClaimNames.Email)!;
    private string UserName => User.FindFirstValue(JwtRegisteredClaimNames.Name)!;

    [HttpPost]
    [ProducesResponseType<CreatedReservationDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request, CancellationToken ct)
    {
        var command = new CreateReservationCommand(request.WorkplaceId, UserEmail, UserName, request.Date);
        var result = await createHandler.HandleAsync(command, ct);

        if (!result.IsSuccess)
            return BadRequest(new ProblemDetails { Detail = result.Error });

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<ReservationDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await getByIdHandler.HandleAsync(new GetReservationByIdQuery(id), ct);

        if (!result.IsSuccess)
            return NotFound(new ProblemDetails { Detail = result.Error });

        return Ok(result.Value);
    }

    [HttpGet("my")]
    [ProducesResponseType<IReadOnlyList<ReservationDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var result = await getMyHandler.HandleAsync(new GetMyReservationsQuery(UserEmail), ct);
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var command = new CancelReservationCommand(id, UserEmail);
        var result = await cancelHandler.HandleAsync(command, ct);

        if (!result.IsSuccess)
        {
            if (result.Error!.Contains("not found"))
                return NotFound(new ProblemDetails { Detail = result.Error });

            return BadRequest(new ProblemDetails { Detail = result.Error });
        }

        return NoContent();
    }
}
