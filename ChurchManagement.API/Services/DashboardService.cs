using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class DashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardResponse> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;

        var upcomingEvents = await _context.Events
            .AsNoTracking()
            .Where(e =>
                e.EventDate >= now &&
                e.Status == "Active")
            .OrderBy(e => e.EventDate)
            .Take(5)
            .Select(e => new UpcomingEventResponse
            {
                EventId = e.EventId,
                Title = e.Title,
                EventDate = e.EventDate,
                Location = e.Location,
                RegistrationCount = e.Registrations.Count(r =>
                    r.Status == "Registered")
            })
            .ToListAsync();

        var recentVisitors = await _context.Visitors
            .AsNoTracking()
            .OrderByDescending(v => v.VisitDate)
            .Take(5)
            .Select(v => new RecentVisitorResponse
            {
                VisitorId = v.VisitorId,
                Name = v.FirstName + " " + v.LastName,
                VisitDate = v.VisitDate,
                FollowUpStatus = v.FollowUpStatus
            })
            .ToListAsync();

        return new DashboardResponse
        {
            TotalMembers = await _context.Members.CountAsync(),

            ActiveMembers = await _context.Members
                .CountAsync(m => m.MembershipStatus == "Active"),

            InactiveMembers = await _context.Members
                .CountAsync(m => m.MembershipStatus == "Inactive"),

            TotalFamilies = await _context.Families.CountAsync(),

            TotalVisitors = await _context.Visitors.CountAsync(),

            PendingFollowUps = await _context.Visitors
                .CountAsync(v => v.FollowUpStatus == "Pending"),

            TotalMinistries = await _context.Ministries.CountAsync(),

            TotalEvents = await _context.Events.CountAsync(),

            UpcomingEvents = await _context.Events
                .CountAsync(e =>
                    e.EventDate >= now &&
                    e.Status == "Active"),

            TotalAnnouncements =
                await _context.Announcements.CountAsync(),

            PublishedAnnouncements =
                await _context.Announcements.CountAsync(
                    a => a.Status == "Published"),

            TotalPrayerRequests =
                await _context.PrayerRequests.CountAsync(),

            PendingPrayerRequests =
                await _context.PrayerRequests.CountAsync(
                    p => p.Status == "Pending"),

            TotalMedia = await _context.Media.CountAsync(),

            UpcomingEventList = upcomingEvents,

            RecentVisitors = recentVisitors
        };
    }
}