using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.ChurchInfo;

public class UpdateChurchInfoRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? History { get; set; }

    [MaxLength(2000)]
    public string? Vision { get; set; }

    [MaxLength(2000)]
    public string? Mission { get; set; }

    [MaxLength(30)]
    public string? ContactNumber { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(500)]
    public string? Website { get; set; }
}