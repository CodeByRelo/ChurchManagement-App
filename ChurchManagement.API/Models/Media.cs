namespace ChurchManagement.API.Models;

public class Media
{
    public int MediaId { get; set; }

    public int ChurchId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string MediaType { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public DateTime PublishDate { get; set; }

    public string? Description { get; set; }

    public ChurchInformation? Church { get; set; }
}