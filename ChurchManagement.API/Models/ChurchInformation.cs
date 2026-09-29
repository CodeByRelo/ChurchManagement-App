namespace ChurchManagement.API.Models;

public class ChurchInformation
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

    public ICollection<Service> Services { get; set; } = new List<Service>();

    public ICollection<Media> Media { get; set; } = new List<Media>();
}