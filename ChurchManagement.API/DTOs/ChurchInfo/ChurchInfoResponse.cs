namespace ChurchManagement.API.DTOs.ChurchInfo;

public class ChurchInfoResponse
{
    public int ChurchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? History { get; set; }
    public string? Vision { get; set; }
    public string? Mission { get; set; }
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
}