using ChurchManagement.API.DTOs.Users;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Super Administrator,Church Administrator")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    // POST: api/Users
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var usernameExists =
            await _userService.UsernameExistsAsync(request.Username);

        if (usernameExists)
        {
            return BadRequest(new
            {
                message = "A user with this username already exists."
            });
        }

        var emailExists =
            await _userService.EmailExistsAsync(request.Email);

        if (emailExists)
        {
            return BadRequest(new
            {
                message = "A user with this email already exists."
            });
        }

        var roleExists =
            await _userService.RoleExistsAsync(request.RoleId);

        if (!roleExists)
        {
            return BadRequest(new
            {
                message = "Selected role does not exist."
            });
        }

        var user = await _userService.CreateAsync(request);

        if (user == null)
        {
            return BadRequest(new
            {
                message = "Unable to create user."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.UserId },
            user);
    }

    // GET: api/Users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();

        return Ok(users);
    }

    // GET: api/Users/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    // PUT: api/Users/{id}/role
    [HttpPut("{id:int}/role")]
    [Authorize(Roles = "Super Administrator")]
    public async Task<IActionResult> UpdateRole(
        int id,
        [FromBody] UpdateUserRoleRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        var roleExists =
            await _userService.RoleExistsAsync(request.RoleId);

        if (!roleExists)
        {
            return BadRequest(new
            {
                message = "Selected role does not exist."
            });
        }

        await _userService.UpdateRoleAsync(
            id,
            request.RoleId);

        return Ok(new
        {
            message = "User role updated successfully."
        });
    }

    // PUT: api/Users/{id}/status
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateUserStatusRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        await _userService.UpdateStatusAsync(
            id,
            request.IsActive);

        return Ok(new
        {
            message = request.IsActive
                ? "User account activated successfully."
                : "User account deactivated successfully."
        });
    }
}