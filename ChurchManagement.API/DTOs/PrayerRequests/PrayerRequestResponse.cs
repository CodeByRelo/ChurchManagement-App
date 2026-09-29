namespace ChurchManagement.API.DTOs.PrayerRequests;

public class PrayerRequestResponse
{
    public int PrayerRequestId { get; set; }

    public int MemberId { get; set; }

    public string MemberName { get; set; } = string.Empty;

    public string RequestText { get; set; } = string.Empty;

    public DateTime SubmittedDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public int? ReviewedBy { get; set; }

    public string? ReviewedByUsername { get; set; }

    public DateTime? ReviewedAt { get; set; }
}