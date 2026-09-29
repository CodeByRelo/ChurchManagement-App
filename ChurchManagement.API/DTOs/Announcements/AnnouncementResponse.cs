namespace ChurchManagement.API.DTOs.Announcements;

public class AnnouncementResponse
{
    public int AnnouncementId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime PublishDate { get; set; }

    public string? TargetAudience { get; set; }

    public string Status { get; set; } = string.Empty;

    public int? CreatedBy { get; set; }

    public string? CreatedByUsername { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}