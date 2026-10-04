using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Users;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class UserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Create user
    public async Task<UserResponse?> CreateAsync(
        CreateUserRequest request)
    {
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleId == request.RoleId);

        if (role == null)
            return null;

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            IsActive = request.IsActive
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new UserResponse
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = role.RoleName,
            IsActive = user.IsActive
        };
    }

    // Get all users
    public async Task<List<UserResponse>> GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .OrderBy(u => u.Username)
            .Select(u => new UserResponse
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                IsActive = u.IsActive
            })
            .ToListAsync();
    }

    // Get user by ID
    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => u.UserId == id)
            .Select(u => new UserResponse
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                RoleId = u.RoleId,
                RoleName = u.Role != null ? u.Role.RoleName : null,
                IsActive = u.IsActive
            })
            .FirstOrDefaultAsync();
    }

    // Update user role
    public async Task<bool> UpdateRoleAsync(
        int id,
        int roleId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
            return false;

        var roleExists = await _context.Roles
            .AnyAsync(r => r.RoleId == roleId);

        if (!roleExists)
            return false;

        user.RoleId = roleId;

        await _context.SaveChangesAsync();

        return true;
    }

    // Update user active status
    public async Task<bool> UpdateStatusAsync(
        int id,
        bool isActive)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
            return false;

        user.IsActive = isActive;

        await _context.SaveChangesAsync();

        return true;
    }

    // Check whether a username already exists
    public async Task<bool> UsernameExistsAsync(
        string username)
    {
        var normalizedUsername = username.Trim();

        return await _context.Users
            .AnyAsync(u => u.Username == normalizedUsername);
    }

    // Check whether an email already exists
    public async Task<bool> EmailExistsAsync(
        string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        return await _context.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail);
    }

    // Check whether a role exists
    public async Task<bool> RoleExistsAsync(int roleId)
    {
        return await _context.Roles
            .AnyAsync(r => r.RoleId == roleId);
    }
}