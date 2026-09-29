using System.Security.Claims;
using ChurchManagement.API.DTOs.Events;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly EventService _eventService;

    public EventsController(EventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var events = await _eventService.GetAllAsync();

        return Ok(events);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var eventItem =
            await _eventService.GetByIdAsync(id);

        if (eventItem == null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return Ok(eventItem);
    }

    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateEventRequest request)
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var result =
            await _eventService.CreateAsync(
                request,
                userId);

        if (result.Error != null)
        {
            return BadRequest(new
            {
                message = result.Error
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Event!.EventId },
            result.Event);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateEventRequest request)
    {
        var result =
            await _eventService.UpdateAsync(
                id,
                request);

        if (result.Error != null)
        {
            if (result.Error == "Event not found.")
            {
                return NotFound(new
                {
                    message = result.Error
                });
            }

            return BadRequest(new
            {
                message = result.Error
            });
        }

        return Ok(result.Event);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var result =
            await _eventService.CancelAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return NoContent();
    }

    [HttpGet("{id:int}/registrations")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetRegistrations(int id)
    {
        var registrations =
            await _eventService.GetRegistrationsAsync(id);

        if (registrations == null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return Ok(registrations);
    }

    [HttpPost("{id:int}/registrations")]
    [Authorize]
    public async Task<IActionResult> Register(
        int id,
        [FromBody] RegisterForEventRequest request)
    {
        var error =
            await _eventService.RegisterAsync(
                id,
                request);

        if (error != null)
        {
            if (error == "Event not found." ||
                error == "Member not found.")
            {
                return NotFound(new
                {
                    message = error
                });
            }

            if (error.Contains("already"))
            {
                return Conflict(new
                {
                    message = error
                });
            }

            return BadRequest(new
            {
                message = error
            });
        }

        return StatusCode(
            StatusCodes.Status201Created);
    }

    [HttpDelete("{id:int}/registrations/{memberId:int}")]
    [Authorize]
    public async Task<IActionResult> CancelRegistration(
        int id,
        int memberId)
    {
        var error =
            await _eventService.CancelRegistrationAsync(
                id,
                memberId);

        if (error != null)
        {
            return NotFound(new
            {
                message = error
            });
        }

        return NoContent();
    }
}