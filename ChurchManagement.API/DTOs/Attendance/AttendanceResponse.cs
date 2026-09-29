namespace ChurchManagement.API.DTOs.Attendance;

public class AttendanceResponse
{
    public int AttendanceId { get; set; }

    public int MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;

    public int EventId { get; set; }
    public string EventTitle { get; set; } = string.Empty;

    public DateTime AttendanceDate { get; set; }

    public string Status { get; set; } = string.Empty;
}