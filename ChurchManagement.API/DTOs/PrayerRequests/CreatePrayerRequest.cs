using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.PrayerRequests;

public class CreatePrayerRequest
{
    [Required]
    [MaxLength(5000)]
    public string RequestText { get; set; } = string.Empty;
}