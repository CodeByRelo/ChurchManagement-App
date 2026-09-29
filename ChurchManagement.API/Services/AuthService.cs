using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Auth;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ChurchManagement.API.Services;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        ApplicationDbContext context,
        IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings.Value;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public async Task<(LoginResponse? Response, string? Error)> LoginAsync(
        LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == email);

        if (user == null)
            return (null, "Invalid email or password.");

        if (!user.IsActive)
            return (null, "This account is inactive.");

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash);

        if (!passwordValid)
            return (null, "Invalid email or password.");

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        var accessToken = GenerateAccessToken(user);

        var refreshToken = GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.UserId,

            // Store HASH, never the raw refresh token.
            Token = HashToken(refreshToken),

            ExpiresAt =
                DateTime.UtcNow.AddDays(
                    _jwtSettings.RefreshTokenDays),

            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);

        await _context.SaveChangesAsync();

        var expiresAt = DateTime.UtcNow.AddMinutes(
            _jwtSettings.AccessTokenMinutes);

        return (
            new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role?.RoleName ?? string.Empty
            },
            null
        );
    }

    // =========================================================
    // REFRESH
    // =========================================================

    public async Task<(LoginResponse? Response, string? Error)>
        RefreshAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return (null, "Refresh token is required.");

        var tokenHash = HashToken(refreshToken);

        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u!.Role)
            .FirstOrDefaultAsync(rt =>
                rt.Token == tokenHash);

        if (storedToken == null)
            return (null, "Invalid refresh token.");

        if (storedToken.RevokedAt.HasValue)
            return (null, "Refresh token has been revoked.");

        if (storedToken.ExpiresAt <= DateTime.UtcNow)
            return (null, "Refresh token has expired.");

        var user = storedToken.User;

        if (user == null)
            return (null, "User account could not be found.");

        if (!user.IsActive)
            return (null, "This account is inactive.");

        // =====================================================
        // ROTATE REFRESH TOKEN
        // =====================================================

        storedToken.RevokedAt = DateTime.UtcNow;

        var newRefreshToken = GenerateRefreshToken();

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.UserId,

            Token = HashToken(newRefreshToken),

            ExpiresAt =
                DateTime.UtcNow.AddDays(
                    _jwtSettings.RefreshTokenDays),

            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(newRefreshTokenEntity);

        // =====================================================
        // NEW ACCESS TOKEN
        // =====================================================

        var accessToken = GenerateAccessToken(user);

        var expiresAt = DateTime.UtcNow.AddMinutes(
            _jwtSettings.AccessTokenMinutes);

        await _context.SaveChangesAsync();

        return (
            new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = expiresAt,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role?.RoleName ?? string.Empty
            },
            null
        );
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return false;

        var tokenHash = HashToken(refreshToken);

        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt =>
                rt.Token == tokenHash);

        if (storedToken == null)
            return false;

        if (!storedToken.RevokedAt.HasValue)
        {
            storedToken.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return true;
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    public async Task<UserResponse?> GetCurrentUserAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => u.UserId == userId)
            .Select(u => new UserResponse
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role != null
                    ? u.Role.RoleName
                    : string.Empty,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt
            })
            .FirstOrDefaultAsync();
    }

    // =========================================================
    // ACCESS TOKEN
    // =========================================================

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.Key));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.UserId.ToString()),

            new(
                ClaimTypes.Name,
                user.Username),

            new(
                ClaimTypes.Email,
                user.Email),

            new(
                ClaimTypes.Role,
                user.Role?.RoleName ?? string.Empty),

            new(
                JwtRegisteredClaimNames.Sub,
                user.UserId.ToString()),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                _jwtSettings.AccessTokenMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    // =========================================================
    // REFRESH TOKEN
    // =========================================================

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);

        return Convert.ToBase64String(bytes);
    }

    // =========================================================
    // HASH REFRESH TOKEN
    // =========================================================

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(
            Encoding.UTF8.GetBytes(token));

        return Convert.ToHexString(bytes);
    }
}