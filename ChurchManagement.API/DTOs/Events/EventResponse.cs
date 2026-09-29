namespace ChurchManagement.API.DTOs.Events;

public class EventResponse
{
    public int EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime EventDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Location { get; set; }
    public int? Capacity { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? CreatedBy { get; set; }
    public string? CreatedByUsername { get; set; }
    public int RegistrationCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}