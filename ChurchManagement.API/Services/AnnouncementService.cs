using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Announcements;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class AnnouncementService
{
    private readonly ApplicationDbContext _context;

    public AnnouncementService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnnouncementResponse>> GetPublishedAsync()
    {
        var announcements = await _context.Announcements
            .AsNoTracking()
            .Include(a => a.Creator)
            .Where(a =>
                a.Status == "Published" &&
                a.PublishDate <= DateTime.UtcNow)
            .OrderByDescending(a => a.PublishDate)
            .ToListAsync();

        return announcements
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<List<AnnouncementResponse>> GetAllAsync()
    {
        var announcements = await _context.Announcements
            .AsNoTracking()
            .Include(a => a.Creator)
            .OrderByDescending(a => a.PublishDate)
            .ToListAsync();

        return announcements
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<AnnouncementResponse?> GetByIdAsync(int id)
    {
        var announcement = await _context.Announcements
            .AsNoTracking()
            .Include(a => a.Creator)
            .FirstOrDefaultAsync(a =>
                a.AnnouncementId == id);

        return announcement == null
            ? null
            : MapToResponse(announcement);
    }

    public async Task<(
        AnnouncementResponse? Announcement,
        string? Error)> CreateAsync(
            CreateAnnouncementRequest request,
            int createdBy)
    {
        var announcement = new Announcement
        {
            Title = request.Title.Trim(),

            Content = request.Content.Trim(),

            PublishDate = request.PublishDate,

            TargetAudience =
                string.IsNullOrWhiteSpace(request.TargetAudience)
                    ? null
                    : request.TargetAudience.Trim(),

            Status = "Published",

            CreatedBy = createdBy,

            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Announcements.Add(announcement);

        await _context.SaveChangesAsync();

        return (
            await GetByIdAsync(
                announcement.AnnouncementId),
            null
        );
    }

    public async Task<(
        AnnouncementResponse? Announcement,
        string? Error)> UpdateAsync(
            int id,
            UpdateAnnouncementRequest request)
    {
        var announcement = await _context.Announcements
            .FirstOrDefaultAsync(a =>
                a.AnnouncementId == id);

        if (announcement == null)
            return (null, "Announcement not found.");

        announcement.Title =
            request.Title.Trim();

        announcement.Content =
            request.Content.Trim();

        announcement.PublishDate =
            request.PublishDate;

        announcement.TargetAudience =
            string.IsNullOrWhiteSpace(
                request.TargetAudience)
                    ? null
                    : request.TargetAudience.Trim();

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var validStatuses = new[]
            {
                "Draft",
                "Published",
                "Archived"
            };

            if (!validStatuses.Contains(request.Status))
            {
                return (
                    null,
                    "Invalid status. Use Draft, Published, or Archived."
                );
            }

            announcement.Status =
                request.Status.Trim();
        }

        announcement.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (
            await GetByIdAsync(id),
            null
        );
    }

    public async Task<bool> ArchiveAsync(int id)
    {
        var announcement = await _context.Announcements
            .FirstOrDefaultAsync(a =>
                a.AnnouncementId == id);

        if (announcement == null)
            return false;

        announcement.Status = "Archived";
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    private static AnnouncementResponse MapToResponse(
        Announcement announcement)
    {
        return new AnnouncementResponse
        {
            AnnouncementId =
                announcement.AnnouncementId,

            Title =
                announcement.Title,

            Content =
                announcement.Content,

            PublishDate =
                announcement.PublishDate,

            TargetAudience =
                announcement.TargetAudience,

            Status =
                announcement.Status,

            CreatedBy =
                announcement.CreatedBy,

            CreatedByUsername =
                announcement.Creator?.Username,

            CreatedAt =
                announcement.CreatedAt,

            UpdatedAt =
                announcement.UpdatedAt
        };
    }
}