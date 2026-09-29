using System.Security.Claims;
using ChurchManagement.API.DTOs.Auth;
using ChurchManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChurchManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var result = await _authService.LoginAsync(request);

        if (result.Error != null)
        {
            if (result.Error.Contains("inactive"))
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message = result.Error
                    });
            }

            return Unauthorized(new
            {
                message = result.Error
            });
        }

        return Ok(result.Response);
    }

    // =========================================================
    // REFRESH
    // =========================================================

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var result = await _authService
            .RefreshAsync(request.RefreshToken);

        if (result.Error != null)
        {
            return Unauthorized(new
            {
                message = result.Error
            });
        }

        return Ok(result.Response);
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        await _authService.LogoutAsync(
            request.RefreshToken);

        return NoContent();
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var user = await _authService
            .GetCurrentUserAsync(userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User account not found."
            });
        }

        if (!user.IsActive)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = "This account is inactive."
                });
        }

        return Ok(user);
    }
}