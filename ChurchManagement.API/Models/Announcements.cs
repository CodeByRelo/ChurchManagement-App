namespace ChurchManagement.API.Models;

public class Announcement
{
    public int AnnouncementId { get; set; }

    public int? CreatedBy { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime PublishDate { get; set; }

    public string? TargetAudience { get; set; }

    public string Status { get; set; } = "Published";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? Creator { get; set; }
}