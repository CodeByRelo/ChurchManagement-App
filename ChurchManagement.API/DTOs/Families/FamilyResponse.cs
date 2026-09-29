namespace ChurchManagement.API.DTOs.Families;

public class FamilyResponse
{
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? ContactNumber { get; set; }
    public int MemberCount { get; set; }
}