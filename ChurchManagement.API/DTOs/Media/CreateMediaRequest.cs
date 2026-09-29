using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Media;

public class CreateMediaRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string MediaType { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    [Url]
    public string Url { get; set; } = string.Empty;

    public DateTime PublishDate { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }
}