namespace ChurchManagement.API.DTOs.Ministries;

public class MinistryResponse
{
    public int MinistryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int? LeaderId { get; set; }
    public string? LeaderName { get; set; }

    public int MemberCount { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}