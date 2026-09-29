namespace ChurchManagement.API.Models;

public class Member
{
    public int MemberId { get; set; }

    public int? UserId { get; set; }

    public int? FamilyId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string MembershipStatus { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }

    public Family? Family { get; set; }

    public ICollection<MinistryMembership> MinistryMemberships { get; set; } = new List<MinistryMembership>();

    public ICollection<EventRegistration> EventRegistrations { get; set; } = new List<EventRegistration>();

    public ICollection<Attendance> AttendanceRecords { get; set; } = new List<Attendance>();

    public ICollection<PrayerRequest> PrayerRequests { get; set; } = new List<PrayerRequest>();

    public ICollection<Ministry> LedMinistries { get; set; } = new List<Ministry>();
}