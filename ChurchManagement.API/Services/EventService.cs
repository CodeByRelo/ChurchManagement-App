using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Events;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class EventService
{
    private readonly ApplicationDbContext _context;

    public EventService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EventResponse>> GetAllAsync()
    {
        var events = await _context.Events
            .AsNoTracking()
            .Include(e => e.Creator)
            .Include(e => e.Registrations)
            .OrderBy(e => e.EventDate)
            .ToListAsync();

        return events
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<EventResponse?> GetByIdAsync(int id)
    {
        var eventItem = await _context.Events
            .AsNoTracking()
            .Include(e => e.Creator)
            .Include(e => e.Registrations)
            .FirstOrDefaultAsync(e => e.EventId == id);

        return eventItem == null
            ? null
            : MapToResponse(eventItem);
    }

    public async Task<(EventResponse? Event, string? Error)>
        CreateAsync(
            CreateEventRequest request,
            int createdBy)
    {
        if (request.EndDate.HasValue &&
            request.EndDate.Value < request.EventDate)
        {
            return (
                null,
                "The event end date cannot be before the event date."
            );
        }

        var eventItem = new Event
        {
            Title = request.Title.Trim(),

            Description =
                string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim(),

            EventDate = request.EventDate,
            EndDate = request.EndDate,

            Location =
                string.IsNullOrWhiteSpace(request.Location)
                    ? null
                    : request.Location.Trim(),

            Capacity = request.Capacity,
            Status = "Active",
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Events.Add(eventItem);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(eventItem.EventId), null);
    }

    public async Task<(EventResponse? Event, string? Error)>
        UpdateAsync(
            int id,
            UpdateEventRequest request)
    {
        var eventItem = await _context.Events
            .FirstOrDefaultAsync(e => e.EventId == id);

        if (eventItem == null)
            return (null, "Event not found.");

        if (request.EndDate.HasValue &&
            request.EndDate.Value < request.EventDate)
        {
            return (
                null,
                "The event end date cannot be before the event date."
            );
        }

        if (request.Capacity.HasValue)
        {
            var registrationCount =
                await _context.EventRegistrations
                    .CountAsync(r =>
                        r.EventId == id &&
                        r.Status == "Registered");

            if (request.Capacity.Value < registrationCount)
            {
                return (
                    null,
                    "Capacity cannot be lower than the current registration count."
                );
            }
        }

        eventItem.Title = request.Title.Trim();

        eventItem.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();

        eventItem.EventDate = request.EventDate;
        eventItem.EndDate = request.EndDate;

        eventItem.Location =
            string.IsNullOrWhiteSpace(request.Location)
                ? null
                : request.Location.Trim();

        eventItem.Capacity = request.Capacity;

        if (!string.IsNullOrWhiteSpace(request.Status))
            eventItem.Status = request.Status.Trim();

        eventItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id), null);
    }

    public async Task<bool> CancelAsync(int id)
    {
        var eventItem = await _context.Events
            .FirstOrDefaultAsync(e => e.EventId == id);

        if (eventItem == null)
            return false;

        eventItem.Status = "Cancelled";
        eventItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<EventRegistrationResponse>?> GetRegistrationsAsync(
        int eventId)
    {
        var eventExists = await _context.Events
            .AnyAsync(e => e.EventId == eventId);

        if (!eventExists)
            return null;

        return await _context.EventRegistrations
            .AsNoTracking()
            .Where(r => r.EventId == eventId)
            .Include(r => r.Member)
            .OrderBy(r => r.RegistrationDate)
            .Select(r => new EventRegistrationResponse
            {
                RegistrationId = r.RegistrationId,
                EventId = r.EventId,
                MemberId = r.MemberId,
                MemberName =
                    r.Member!.FirstName + " " + r.Member.LastName,
                MemberEmail = r.Member.Email,
                RegistrationDate = r.RegistrationDate,
                Status = r.Status
            })
            .ToListAsync();
    }

    public async Task<string?> RegisterAsync(
        int eventId,
        RegisterForEventRequest request)
    {
        var eventItem = await _context.Events
            .FirstOrDefaultAsync(e => e.EventId == eventId);

        if (eventItem == null)
            return "Event not found.";

        if (eventItem.Status != "Active")
            return "This event is not open for registration.";

        var member = await _context.Members
            .FirstOrDefaultAsync(m =>
                m.MemberId == request.MemberId);

        if (member == null)
            return "Member not found.";

        if (member.MembershipStatus != "Active")
            return "Inactive members cannot register for events.";

        var alreadyRegistered =
            await _context.EventRegistrations.AnyAsync(r =>
                r.EventId == eventId &&
                r.MemberId == request.MemberId &&
                r.Status == "Registered");

        if (alreadyRegistered)
            return "This member is already registered for the event.";

        if (eventItem.Capacity.HasValue)
        {
            var registrationCount =
                await _context.EventRegistrations.CountAsync(r =>
                    r.EventId == eventId &&
                    r.Status == "Registered");

            if (registrationCount >= eventItem.Capacity.Value)
                return "This event has reached its registration capacity.";
        }

        var registration = new EventRegistration
        {
            EventId = eventId,
            MemberId = request.MemberId,
            RegistrationDate = DateTime.UtcNow,
            Status = "Registered"
        };

        _context.EventRegistrations.Add(registration);

        await _context.SaveChangesAsync();

        return null;
    }

    public async Task<string?> CancelRegistrationAsync(
        int eventId,
        int memberId)
    {
        var registration =
            await _context.EventRegistrations
                .FirstOrDefaultAsync(r =>
                    r.EventId == eventId &&
                    r.MemberId == memberId &&
                    r.Status == "Registered");

        if (registration == null)
            return "Registration not found.";

        registration.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return null;
    }

    private static EventResponse MapToResponse(Event eventItem)
    {
        return new EventResponse
        {
            EventId = eventItem.EventId,
            Title = eventItem.Title,
            Description = eventItem.Description,
            EventDate = eventItem.EventDate,
            EndDate = eventItem.EndDate,
            Location = eventItem.Location,
            Capacity = eventItem.Capacity,
            Status = eventItem.Status,
            CreatedBy = eventItem.CreatedBy,
            CreatedByUsername = eventItem.Creator?.Username,
            RegistrationCount = eventItem.Registrations
                .Count(r => r.Status == "Registered"),
            CreatedAt = eventItem.CreatedAt,
            UpdatedAt = eventItem.UpdatedAt
        };
    }
}