namespace ChurchManagement.API.Models;

public class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    public Role? Role { get; set; }

    public Member? Member { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();

    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}