using ChurchManagement.API.DTOs.Attendance;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AttendanceService _attendanceService;

    public AttendanceController(
        AttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetAll()
    {
        var attendance =
            await _attendanceService.GetAllAsync();

        return Ok(attendance);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetById(int id)
    {
        var attendance =
            await _attendanceService.GetByIdAsync(id);

        if (attendance == null)
        {
            return NotFound(new
            {
                message = "Attendance record not found."
            });
        }

        return Ok(attendance);
    }

    [HttpGet("event/{eventId:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> GetByEvent(int eventId)
    {
        var attendance =
            await _attendanceService.GetByEventAsync(
                eventId);

        if (attendance == null)
        {
            return NotFound(new
            {
                message = "Event not found."
            });
        }

        return Ok(attendance);
    }

    [HttpGet("member/{memberId:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader,Member")]
    public async Task<IActionResult> GetByMember(int memberId)
    {
        var attendance =
            await _attendanceService.GetByMemberAsync(
                memberId);

        if (attendance == null)
        {
            return NotFound(new
            {
                message = "Member not found."
            });
        }

        return Ok(attendance);
    }

    [HttpPost]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> Record(
        [FromBody] RecordAttendanceRequest request)
    {
        var result =
            await _attendanceService.RecordAsync(request);

        if (result.Error != null)
        {
            if (result.Error == "Member not found." ||
                result.Error == "Event not found.")
            {
                return NotFound(new
                {
                    message = result.Error
                });
            }

            if (result.Error.Contains("already"))
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

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Attendance!.AttendanceId },
            result.Attendance);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator,Ministry Leader")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] RecordAttendanceRequest request)
    {
        var result =
            await _attendanceService.UpdateAsync(
                id,
                request.Status);

        if (result.Error != null)
        {
            if (result.Error ==
                "Attendance record not found.")
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

        return Ok(result.Attendance);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles =
        "Super Administrator,Church Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var result =
            await _attendanceService.DeleteAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Attendance record not found."
            });
        }

        return NoContent();
    }
}