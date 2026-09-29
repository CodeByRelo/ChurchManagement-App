namespace ChurchManagement.API.Models;

public class Visitor
{
    public int VisitorId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public DateTime VisitDate { get; set; }

    public string? Notes { get; set; }

    public string FollowUpStatus { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}