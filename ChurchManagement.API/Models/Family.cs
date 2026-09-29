namespace ChurchManagement.API.Models;

public class Family
{
    public int FamilyId { get; set; }

    public string FamilyName { get; set; } = string.Empty;

    public string? Address { get; set; }

    public string? ContactNumber { get; set; }

    public ICollection<Member> Members { get; set; } = new List<Member>();
}