using ChurchManagement.API.DTOs.Media;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly MediaService _mediaService;

    public MediaController(MediaService mediaService)
    {
        _mediaService = mediaService;
    }

    // GET: api/Media
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var media = await _mediaService.GetAllAsync();

        return Ok(media);
    }

    // GET: api/Media/5
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var media = await _mediaService.GetByIdAsync(id);

        if (media == null)
        {
            return NotFound(new
            {
                message = "Media item not found."
            });
        }

        return Ok(media);
    }

    // POST: api/Media
    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateMediaRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var media =
            await _mediaService.CreateAsync(request);

        if (media == null)
        {
            return BadRequest(new
            {
                message =
                    "Church information must be configured before adding media."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = media.MediaId },
            media);
    }

    // PUT: api/Media/5
    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateMediaRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var media =
            await _mediaService.UpdateAsync(id, request);

        if (media == null)
        {
            return NotFound(new
            {
                message = "Media item not found."
            });
        }

        return Ok(media);
    }

    // DELETE: api/Media/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _mediaService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Media item not found."
            });
        }

        return NoContent();
    }
}