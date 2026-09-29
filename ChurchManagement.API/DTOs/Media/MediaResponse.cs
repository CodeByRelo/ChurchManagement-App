namespace ChurchManagement.API.DTOs.Media;

public class MediaResponse
{
    public int MediaId { get; set; }
    public int ChurchId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime PublishDate { get; set; }
    public string? Description { get; set; }
}