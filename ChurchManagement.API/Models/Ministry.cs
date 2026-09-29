namespace ChurchManagement.API.Models;

public class Ministry
{
    public int MinistryId { get; set; }

    public int? LeaderId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Member? Leader { get; set; }

    public ICollection<MinistryMembership> Memberships { get; set; } = new List<MinistryMembership>();
}