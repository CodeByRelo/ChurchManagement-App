namespace ChurchManagement.API.Models;

public class MinistryMembership
{
    public int MembershipId { get; set; }

    public int MemberId { get; set; }

    public int MinistryId { get; set; }

    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;

    public Member? Member { get; set; }

    public Ministry? Ministry { get; set; }
}