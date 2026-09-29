using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Families;
using ChurchManagement.API.Models;
using ChurchManagement.API.Services;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.Tests;

public class FamilyServiceTests
{
    [Fact]
    public async Task CreateFamily_ShouldCreateFamily()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new FamilyService(context);

        var request = new CreateFamilyRequest
        {
            FamilyName = "Doe Family",
            Address = "123 Main Street",
            ContactNumber = "0123456789"
        };

        var result = await service.CreateAsync(request);

        Assert.NotNull(result.Family);
        Assert.Equal(
            "Doe Family",
            result.Family.FamilyName);

        Assert.Equal(
            1,
            await context.Families.CountAsync());
    }

    [Fact]
    public async Task DeleteFamily_ShouldUnlinkMembers()
    {
        await using var context = TestDbContextFactory.Create();

        var family = new Family
        {
            FamilyName = "Doe Family"
        };

        context.Families.Add(family);
        await context.SaveChangesAsync();

        var member = new Member
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            FamilyId = family.FamilyId
        };

        context.Members.Add(member);
        await context.SaveChangesAsync();

        var service = new FamilyService(context);

        await service.DeleteAsync(family.FamilyId);

        var updatedMember = await context.Members
            .FirstAsync();

        Assert.Null(updatedMember.FamilyId);
        Assert.Empty(context.Families);
    }
}