using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Visitors;

public class UpdateVisitorRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    public DateTime VisitDate { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }
}