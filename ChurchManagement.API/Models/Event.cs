namespace ChurchManagement.API.Models;

public class Event
{
    public int EventId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime EventDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? Location { get; set; }

    public int? Capacity { get; set; }

    public string Status { get; set; } = "Active";

    public int? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? Creator { get; set; }

    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();

    public ICollection<Attendance> AttendanceRecords { get; set; } = new List<Attendance>();
}