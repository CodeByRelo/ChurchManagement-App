namespace ChurchManagement.API.Models;

public class EventRegistration
{
    public int RegistrationId { get; set; }

    public int EventId { get; set; }

    public int MemberId { get; set; }

    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Registered";

    public Event? Event { get; set; }

    public Member? Member { get; set; }
}