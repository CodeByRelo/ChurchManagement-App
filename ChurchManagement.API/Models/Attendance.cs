namespace ChurchManagement.API.Models;

public class Attendance
{
    public int AttendanceId { get; set; }

    public int MemberId { get; set; }

    public int EventId { get; set; }

    public DateTime AttendanceDate { get; set; }

    public string Status { get; set; } = "Present";

    public Member? Member { get; set; }

    public Event? Event { get; set; }
}