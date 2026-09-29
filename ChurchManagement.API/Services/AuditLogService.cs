using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.AuditLogs;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class AuditLogService
{
    private readonly ApplicationDbContext _context;

    public AuditLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(
        int? userId,
        string action,
        string entityName,
        int? entityId = null,
        string? description = null,
        string? ipAddress = null)
    {
        var auditLog = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Description = description,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();
    }

    public async Task<List<AuditLogResponse>> GetAllAsync()
    {
        return await _context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .OrderByDescending(a => a.Timestamp)
            .Select(a => new AuditLogResponse
            {
                AuditLogId = a.AuditLogId,
                UserId = a.UserId,
                Username = a.User != null
                    ? a.User.Username
                    : null,
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Description = a.Description,
                Timestamp = a.Timestamp,
                IpAddress = a.IpAddress
            })
            .ToListAsync();
    }

    public async Task<AuditLogResponse?> GetByIdAsync(int id)
    {
        return await _context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => a.AuditLogId == id)
            .Select(a => new AuditLogResponse
            {
                AuditLogId = a.AuditLogId,
                UserId = a.UserId,
                Username = a.User != null
                    ? a.User.Username
                    : null,
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Description = a.Description,
                Timestamp = a.Timestamp,
                IpAddress = a.IpAddress
            })
            .FirstOrDefaultAsync();
    }
}