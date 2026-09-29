using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Ministries;

public class UpdateMinistryRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int? LeaderId { get; set; }
}