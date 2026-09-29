using System.Security.Claims;
using ChurchManagement.API.DTOs.PrayerRequests;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrayerRequestsController : ControllerBase
{
    private readonly PrayerRequestService _prayerRequestService;

    public PrayerRequestsController(
        PrayerRequestService prayerRequestService)
    {
        _prayerRequestService = prayerRequestService;
    }

    // Admin / ministry view
    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var requests =
            await _prayerRequestService.GetAllAsync();

        return Ok(requests);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var request =
            await _prayerRequestService.GetByIdAsync(id);

        if (request == null)
        {
            return NotFound(new
            {
                message = "Prayer request not found."
            });
        }

        var currentUserId =
            GetCurrentUserId();

        var isAdmin =
            User.IsInRole("Super Administrator") ||
            User.IsInRole("Church Administrator") ||
            User.IsInRole("Ministry Leader");

        if (!isAdmin)
        {
            var member = await GetCurrentMemberIdAsync();

            if (member != request.MemberId)
            {
                return Forbid();
            }
        }

        return Ok(request);
    }

    // Member submits a request for themselves.
    [HttpPost]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> Create(
        [FromBody] CreatePrayerRequest request)
    {
        var memberId =
            await GetCurrentMemberIdAsync();

        if (!memberId.HasValue)
        {
            return BadRequest(new
            {
                message =
                    "Your account is not linked to a member profile."
            });
        }

        var result =
            await _prayerRequestService.CreateAsync(
                memberId.Value,
                request);

        if (result.Error != null)
        {
            return BadRequest(new
            {
                message = result.Error
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = result.Request!
                    .PrayerRequestId
            },
            result.Request);
    }

    // Member can see their own history.
    [HttpGet("my")]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> GetMine()
    {
        var memberId =
            await GetCurrentMemberIdAsync();

        if (!memberId.HasValue)
        {
            return BadRequest(new
            {
                message =
                    "Your account is not linked to a member profile."
            });
        }

        var requests =
            await _prayerRequestService
                .GetByMemberAsync(memberId.Value);

        return Ok(requests);
    }

    // Admin / ministry leader reviews request.
    [HttpPut("{id:int}/status")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdatePrayerRequest request)
    {
        var reviewerId =
            GetCurrentUserId();

        if (!reviewerId.HasValue)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        var result =
            await _prayerRequestService.UpdateStatusAsync(
                id,
                request.Status,
                reviewerId.Value);

        if (result.Error != null)
        {
            if (result.Error ==
                "Prayer request not found.")
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

        return Ok(result.Request);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var result =
            await _prayerRequestService.DeleteAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message =
                    "Prayer request not found."
            });
        }

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        return int.TryParse(
            claim,
            out var userId)
                ? userId
                : null;
    }

    private async Task<int?> GetCurrentMemberIdAsync()
    {
        var userId = GetCurrentUserId();

        if (!userId.HasValue)
            return null;

        // Resolve the Member linked to the authenticated User.
        // This keeps the client from submitting another member's ID.
        return await GetMemberIdForUserAsync(
            userId.Value);
    }

    private async Task<int?> GetMemberIdForUserAsync(
        int userId)
    {
        // We use the EF context indirectly through the service
        // layer in the final implementation below.
        return await _prayerRequestService
            .GetMemberIdForUserAsync(userId);
    }
}