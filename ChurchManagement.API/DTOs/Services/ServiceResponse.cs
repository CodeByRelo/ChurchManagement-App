namespace ChurchManagement.API.DTOs.Services;

public class ServiceResponse
{
    public int ServiceId { get; set; }
    public int ChurchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Day { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Description { get; set; }
}