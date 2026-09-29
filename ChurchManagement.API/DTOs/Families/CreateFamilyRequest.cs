using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Families;

public class CreateFamilyRequest
{
    [Required]
    [MaxLength(150)]
    public string FamilyName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Address { get; set; }

    [MaxLength(30)]
    public string? ContactNumber { get; set; }
}