using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Members;
using ChurchManagement.API.Models;
using ChurchManagement.API.Services;

namespace ChurchManagement.Tests;

public class MemberServiceTests
{
    [Fact]
    public async Task CreateMember_ShouldCreateMember()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new MemberService(context);

        var request = new CreateMemberRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Phone = "0123456789"
        };

        var result = await service.CreateAsync(request);

        Assert.NotNull(result.Member);
        Assert.Equal("John", result.Member.FirstName);
        Assert.Equal("Doe", result.Member.LastName);
        Assert.Equal("john@example.com", result.Member.Email);

        Assert.Single(context.Members);
    }

    [Fact]
    public async Task CreateMember_ShouldRejectDuplicateEmail()
    {
        await using var context = TestDbContextFactory.Create();

        context.Members.Add(new Member
        {
            FirstName = "Existing",
            LastName = "Member",
            Email = "john@example.com"
        });

        await context.SaveChangesAsync();

        var service = new MemberService(context);

        var request = new CreateMemberRequest
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com"
        };

        var result = await service.CreateAsync(request);

        Assert.Null(result.Member);
        Assert.NotNull(result.Error);
    }

    [Fact]
    public async Task DeactivateMember_ShouldSetInactive()
    {
        await using var context = TestDbContextFactory.Create();

        var member = new Member
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            MembershipStatus = "Active"
        };

        context.Members.Add(member);
        await context.SaveChangesAsync();

        var service = new MemberService(context);

        var result = await service.DeactivateAsync(member.MemberId);

        Assert.True(result);

        var updatedMember = await context.Members
            .FindAsync(member.MemberId);

        Assert.NotNull(updatedMember);
        Assert.Equal(
            "Inactive",
            updatedMember.MembershipStatus);
    }
}