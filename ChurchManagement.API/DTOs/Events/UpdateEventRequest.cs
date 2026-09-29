using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Events;

public class UpdateEventRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public DateTime EventDate { get; set; }

    public DateTime? EndDate { get; set; }

    [MaxLength(255)]
    public string? Location { get; set; }

    [Range(1, 100000)]
    public int? Capacity { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }
}