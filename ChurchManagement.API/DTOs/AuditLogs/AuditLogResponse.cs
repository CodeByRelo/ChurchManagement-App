namespace ChurchManagement.API.DTOs.AuditLogs;

public class AuditLogResponse
{
    public int AuditLogId { get; set; }
    public int? UserId { get; set; }
    public string? Username { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string? Description { get; set; }
    public DateTime Timestamp { get; set; }
    public string? IpAddress { get; set; }
}