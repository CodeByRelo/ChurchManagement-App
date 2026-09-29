using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Attendance;

public class RecordAttendanceRequest
{
    [Required]
    public int MemberId { get; set; }

    [Required]
    public int EventId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Present";
}