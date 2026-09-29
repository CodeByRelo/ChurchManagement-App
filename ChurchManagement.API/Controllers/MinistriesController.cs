using ChurchManagement.API.DTOs.Ministries;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MinistriesController : ControllerBase
{
    private readonly MinistryService _ministryService;

    public MinistriesController(MinistryService ministryService)
    {
        _ministryService = ministryService;
    }

    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var ministries = await _ministryService.GetAllAsync();

        return Ok(ministries);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetById(int id)
    {
        var ministry =
            await _ministryService.GetByIdAsync(id);

        if (ministry == null)
        {
            return NotFound(new
            {
                message = "Ministry not found."
            });
        }

        return Ok(ministry);
    }

    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateMinistryRequest request)
    {
        var result =
            await _ministryService.CreateAsync(request);

        if (result.Error != null)
        {
            return Conflict(new
            {
                message = result.Error
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Ministry!.MinistryId },
            result.Ministry);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateMinistryRequest request)
    {
        var result =
            await _ministryService.UpdateAsync(id, request);

        if (result.Error != null)
        {
            if (result.Error == "Ministry not found.")
            {
                return NotFound(new
                {
                    message = result.Error
                });
            }

            return Conflict(new
            {
                message = result.Error
            });
        }

        return Ok(result.Ministry);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var result =
            await _ministryService.DeleteAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Ministry not found."
            });
        }

        return NoContent();
    }

    [HttpGet("{id:int}/members")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetMembers(int id)
    {
        var members =
            await _ministryService.GetMembersAsync(id);

        if (members == null)
        {
            return NotFound(new
            {
                message = "Ministry not found."
            });
        }

        return Ok(members);
    }

    [HttpPost("{id:int}/members")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> AddMember(
        int id,
        [FromBody] AddMinistryMemberRequest request)
    {
        var error =
            await _ministryService.AddMemberAsync(id, request);

        if (error != null)
        {
            if (error == "Ministry not found." ||
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

    [HttpDelete("{id:int}/members/{memberId:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> RemoveMember(
        int id,
        int memberId)
    {
        var error =
            await _ministryService.RemoveMemberAsync(
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