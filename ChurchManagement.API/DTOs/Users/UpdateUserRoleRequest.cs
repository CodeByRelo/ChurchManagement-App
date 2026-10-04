using System.ComponentModel.DataAnnotations;

namespace ChurchManagement.API.DTOs.Users;

public class UpdateUserRoleRequest
{
    [Required]
    public int RoleId { get; set; }
}