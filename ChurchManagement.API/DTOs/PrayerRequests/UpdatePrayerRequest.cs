using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.PrayerRequests;

public class UpdatePrayerRequest
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
}