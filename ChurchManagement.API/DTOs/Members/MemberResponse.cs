namespace ChurchManagement.API.DTOs.Members;

public class MemberResponse
{
    public int MemberId { get; set; }

    public int? UserId { get; set; }

    public int? FamilyId { get; set; }

    public string? FamilyName { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string MembershipStatus { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}