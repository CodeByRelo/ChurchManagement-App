namespace ChurchManagement.API.Models;

public class AuditLog
{
    public int AuditLogId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityName { get; set; } = string.Empty;

    public int? EntityId { get; set; }

    public string? Description { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? IpAddress { get; set; }

    public User? User { get; set; }
}