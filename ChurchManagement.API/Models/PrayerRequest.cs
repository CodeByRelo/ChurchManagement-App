namespace ChurchManagement.API.Models;

public class PrayerRequest
{
    public int PrayerRequestId { get; set; }

    public int MemberId { get; set; }

    public string RequestText { get; set; } = string.Empty;

    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";

    public int? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Member? Member { get; set; }

    public User? Reviewer { get; set; }
}