using System.Security.Claims;
using ChurchManagement.API.DTOs.Members;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MembersController : ControllerBase
{
    private readonly MemberService _memberService;
    private readonly AuditLogService _auditLogService;

    public MembersController(
        MemberService memberService,
        AuditLogService auditLogService)
    {
        _memberService = memberService;
        _auditLogService = auditLogService;
    }

    // GET: api/members
    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var members = await _memberService.GetAllAsync();

        return Ok(members);
    }

    // GET: api/members/1
    [HttpGet("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetById(int id)
    {
        var member = await _memberService.GetByIdAsync(id);

        if (member == null)
        {
            return NotFound(new
            {
                message = "Member not found."
            });
        }

        return Ok(member);
    }

    // POST: api/members
    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Create(
        [FromBody] CreateMemberRequest request)
    {
        var result = await _memberService.CreateAsync(request);

        if (result.Error != null)
        {
            if (result.Error.Contains("already exists") ||
                result.Error.Contains("already linked"))
            {
                return Conflict(new
                {
                    message = result.Error
                });
            }

            return BadRequest(new
            {
                message = result.Error
            });
        }

        var userId = GetCurrentUserId();

        await _auditLogService.LogAsync(
            userId,
            "CREATE",
            "Member",
            result.Member!.MemberId,
            $"Created member '{result.Member.FirstName} {result.Member.LastName}'.",
            GetIpAddress()
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Member.MemberId },
            result.Member);
    }

    // PUT: api/members/1
    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateMemberRequest request)
    {
        var result =
            await _memberService.UpdateAsync(id, request);

        if (result.Error != null)
        {
            if (result.Error == "Member not found.")
            {
                return NotFound(new
                {
                    message = result.Error
                });
            }

            if (result.Error.Contains("already exists") ||
                result.Error.Contains("already linked"))
            {
                return Conflict(new
                {
                    message = result.Error
                });
            }

            return BadRequest(new
            {
                message = result.Error
            });
        }

        await _auditLogService.LogAsync(
            GetCurrentUserId(),
            "UPDATE",
            "Member",
            id,
            $"Updated member '{result.Member!.FirstName} {result.Member.LastName}'.",
            GetIpAddress()
        );

        return Ok(result.Member);
    }

    // DELETE: api/members/1
    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var member = await _memberService.GetByIdAsync(id);

        if (member == null)
        {
            return NotFound(new
            {
                message = "Member not found."
            });
        }

        var result =
            await _memberService.DeactivateAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Member not found."
            });
        }

        await _auditLogService.LogAsync(
            GetCurrentUserId(),
            "DEACTIVATE",
            "Member",
            id,
            $"Deactivated member '{member.FirstName} {member.LastName}'.",
            GetIpAddress()
        );

        return NoContent();
    }

    // Gets the authenticated user's ID from the JWT.
    private int? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }

    // Gets the IP address of the authenticated request.
    private string? GetIpAddress()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}