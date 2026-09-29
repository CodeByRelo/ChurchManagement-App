using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Ministries;

public class AddMinistryMemberRequest
{
    [Required]
    public int MemberId { get; set; }
}