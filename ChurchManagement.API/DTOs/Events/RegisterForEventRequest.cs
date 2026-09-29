using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Events;

public class RegisterForEventRequest
{
    [Required]
    public int MemberId { get; set; }
}