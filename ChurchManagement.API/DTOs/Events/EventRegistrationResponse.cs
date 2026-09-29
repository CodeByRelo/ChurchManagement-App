namespace ChurchManagement.API.DTOs.Events;

public class EventRegistrationResponse
{
    public int RegistrationId { get; set; }
    public int EventId { get; set; }
    public int MemberId { get; set; }

    public string MemberName { get; set; } = string.Empty;
    public string? MemberEmail { get; set; }

    public DateTime RegistrationDate { get; set; }
    public string Status { get; set; } = string.Empty;
}