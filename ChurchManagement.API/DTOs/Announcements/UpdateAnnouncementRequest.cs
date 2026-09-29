using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Announcements;

public class UpdateAnnouncementRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Content { get; set; } = string.Empty;

    [Required]
    public DateTime PublishDate { get; set; }

    [MaxLength(100)]
    public string? TargetAudience { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }
}