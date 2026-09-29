using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Services;

public class CreateServiceRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Day { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Time { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Location { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }
}