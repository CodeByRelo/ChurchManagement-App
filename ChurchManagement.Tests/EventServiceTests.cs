using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Events;
using ChurchManagement.API.Models;
using ChurchManagement.API.Services;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.Tests;

public class EventServiceTests
{
    [Fact]
    public async Task CreateEvent_ShouldCreateEvent()
    {
        await using var context = TestDbContextFactory.Create();

        var service = new EventService(context);

        var request = new CreateEventRequest
        {
            Title = "Youth Conference",
            Description = "Annual youth conference",
            EventDate = DateTime.UtcNow.AddDays(10),
            Location = "Church Hall",
            Capacity = 50
        };

        var result = await service.CreateAsync(request, 1);

        Assert.NotNull(result.Event);
        Assert.Null(result.Error);

        Assert.Equal(
            "Youth Conference",
            result.Event.Title);

        Assert.Equal(
            50,
            result.Event.Capacity);
    }

    [Fact]
    public async Task RegisterForEvent_ShouldRegisterMember()
    {
        await using var context = TestDbContextFactory.Create();

        var member = new Member
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            MembershipStatus = "Active"
        };

        var churchEvent = new Event
        {
            Title = "Youth Conference",
            EventDate = DateTime.UtcNow.AddDays(10),
            Capacity = 50,
            Status = "Active"
        };

        context.Members.Add(member);
        context.Events.Add(churchEvent);

        await context.SaveChangesAsync();

        var service = new EventService(context);

        var request = new RegisterForEventRequest
        {
            MemberId = member.MemberId
        };

        var result = await service.RegisterAsync(
            churchEvent.EventId,
            request);

        Assert.Null(result);

        Assert.Single(
            context.EventRegistrations);

        var registration =
            await context.EventRegistrations
                .FirstAsync();

        Assert.Equal(
            member.MemberId,
            registration.MemberId);

        Assert.Equal(
            churchEvent.EventId,
            registration.EventId);

        Assert.Equal(
            "Registered",
            registration.Status);
    }

    [Fact]
    public async Task RegisterForEvent_ShouldRejectDuplicateRegistration()
    {
        await using var context = TestDbContextFactory.Create();

        var member = new Member
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            MembershipStatus = "Active"
        };

        var churchEvent = new Event
        {
            Title = "Youth Conference",
            EventDate = DateTime.UtcNow.AddDays(10),
            Capacity = 50,
            Status = "Active"
        };

        context.Members.Add(member);
        context.Events.Add(churchEvent);

        await context.SaveChangesAsync();

        context.EventRegistrations.Add(
            new EventRegistration
            {
                EventId = churchEvent.EventId,
                MemberId = member.MemberId,
                RegistrationDate = DateTime.UtcNow,
                Status = "Registered"
            });

        await context.SaveChangesAsync();

        var service = new EventService(context);

        var request = new RegisterForEventRequest
        {
            MemberId = member.MemberId
        };

        var result = await service.RegisterAsync(
            churchEvent.EventId,
            request);

        Assert.Equal(
            "This member is already registered for the event.",
            result);

        Assert.Single(
            context.EventRegistrations);
    }
}