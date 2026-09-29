namespace ChurchManagement.API.Models;

public class Service
{
    public int ServiceId { get; set; }

    public int ChurchId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Day { get; set; } = string.Empty;

    public string Time { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Description { get; set; }

    public ChurchInformation? Church { get; set; }
}