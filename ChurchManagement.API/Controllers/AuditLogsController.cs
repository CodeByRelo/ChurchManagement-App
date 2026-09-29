using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Super Administrator")]
public class AuditLogsController : ControllerBase
{
    private readonly AuditLogService _auditLogService;

    public AuditLogsController(
        AuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    // GET: api/AuditLogs
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _auditLogService.GetAllAsync();

        return Ok(logs);
    }

    // GET: api/AuditLogs/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log =
            await _auditLogService.GetByIdAsync(id);

        if (log == null)
        {
            return NotFound(new
            {
                message = "Audit log not found."
            });
        }

        return Ok(log);
    }
}