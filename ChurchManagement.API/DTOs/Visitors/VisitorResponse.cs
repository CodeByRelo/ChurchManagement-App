namespace ChurchManagement.API.DTOs.Visitors;

public class VisitorResponse
{
    public int VisitorId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public DateTime VisitDate { get; set; }
    public string? Notes { get; set; }
    public string FollowUpStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}