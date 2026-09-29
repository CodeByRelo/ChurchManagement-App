using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.PrayerRequests;
using ChurchManagement.API.Models;
using ChurchManagement.API.Services;

namespace ChurchManagement.Tests;

public class PrayerRequestServiceTests
{
    [Fact]
    public async Task CreatePrayerRequest_ShouldCreatePendingRequest()
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

        var service = new PrayerRequestService(context);

        var request = new CreatePrayerRequest
        {
            RequestText = "Please pray for my family."
        };

        var result = await service.CreateAsync(
            member.MemberId,
            request);

        Assert.NotNull(result.Request);

        Assert.Equal(
            "Pending",
            result.Request.Status);

        Assert.Equal(
            "Please pray for my family.",
            result.Request.RequestText);
    }

    [Fact]
    public async Task UpdatePrayerRequest_ShouldRejectInvalidStatus()
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

        var prayerRequest = new PrayerRequest
        {
            MemberId = member.MemberId,
            RequestText = "Please pray for me.",
            Status = "Pending"
        };

        context.PrayerRequests.Add(prayerRequest);
        await context.SaveChangesAsync();

        var service = new PrayerRequestService(context);

        var result = await service.UpdateStatusAsync(
            prayerRequest.PrayerRequestId,
            "Invalid Status",
            member.MemberId);

        Assert.Null(result.Request);
        Assert.NotNull(result.Error);
    }
}