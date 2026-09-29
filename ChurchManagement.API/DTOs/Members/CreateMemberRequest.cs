using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Members;

public class CreateMemberRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public int? FamilyId { get; set; }

    public int? UserId { get; set; }
}