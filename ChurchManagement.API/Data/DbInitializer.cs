using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        await SeedRolesAsync(context);
        await SeedAdminAsync(context);
    }

    private static async Task SeedRolesAsync(
        ApplicationDbContext context)
    {
        var roles = new[]
        {
            new Role
            {
                RoleName = "Super Administrator",
                Description = "Full system access."
            },
            new Role
            {
                RoleName = "Church Administrator",
                Description = "Manages church operations and administration."
            },
            new Role
            {
                RoleName = "Ministry Leader",
                Description = "Manages assigned ministry activities."
            },
            new Role
            {
                RoleName = "Member",
                Description = "Standard church member access."
            }
        };

        foreach (var role in roles)
        {
            if (!await context.Roles
                .AnyAsync(r => r.RoleName == role.RoleName))
            {
                context.Roles.Add(role);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedAdminAsync(
        ApplicationDbContext context)
    {
        const string adminEmail = "admin@church.local";
        const string adminUsername = "superadmin";
        const string developmentPassword = "Admin@12345";

        var existingUser = await context.Users
            .FirstOrDefaultAsync(u => u.Email == adminEmail);

        if (existingUser != null)
            return;

        var adminRole = await context.Roles
            .FirstAsync(r =>
                r.RoleName == "Super Administrator");

        var admin = new User
        {
            RoleId = adminRole.RoleId,
            Username = adminUsername,
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                developmentPassword),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);

        await context.SaveChangesAsync();
    }
}