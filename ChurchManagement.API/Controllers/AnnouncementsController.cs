using System.Security.Claims;
using ChurchManagement.API.DTOs.Announcements;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly AnnouncementService _announcementService;

    public AnnouncementsController(
        AnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    // Public website
    [HttpGet("published")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublished()
    {
        var announcements =
            await _announcementService.GetPublishedAsync();

        return Ok(announcements);
    }

    // Admin dashboard
    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var announcements =
            await _announcementService.GetAllAsync();

        return Ok(announcements);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var announcement =
            await _announcementService.GetByIdAsync(id);

        if (announcement == null)
        {
            return NotFound(new
            {
                message = "Announcement not found."
            });
        }

        // Prevent archived/draft announcements
        // from being exposed through the public endpoint.
        if (announcement.Status != "Published" ||
            announcement.PublishDate > DateTime.UtcNow)
        {
            var isAuthenticated =
                User.Identity?.IsAuthenticated == true;

            if (!isAuthenticated)
            {
                return NotFound(new
                {
                    message = "Announcement not found."
                });
            }
        }

        return Ok(announcement);
    }

    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateAnnouncementRequest request)
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(
                userIdClaim,
                out var userId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        var result =
            await _announcementService.CreateAsync(
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
            new
            {
                id = result.Announcement!
                    .AnnouncementId
            },
            result.Announcement);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateAnnouncementRequest request)
    {
        var result =
            await _announcementService.UpdateAsync(
                id,
                request);

        if (result.Error != null)
        {
            if (result.Error ==
                "Announcement not found.")
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

        return Ok(result.Announcement);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var result =
            await _announcementService.ArchiveAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message =
                    "Announcement not found."
            });
        }

        return NoContent();
    }
}