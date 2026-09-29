using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Visitors;

public class UpdateVisitorFollowUpRequest
{
    [Required]
    [MaxLength(50)]
    public string FollowUpStatus { get; set; } = string.Empty;
}