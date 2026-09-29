using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Media;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class MediaService
{
    private readonly ApplicationDbContext _context;

    public MediaService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MediaResponse>> GetAllAsync()
    {
        return await _context.Media
            .AsNoTracking()
            .OrderByDescending(m => m.PublishDate)
            .Select(m => new MediaResponse
            {
                MediaId = m.MediaId,
                ChurchId = m.ChurchId,
                Title = m.Title,
                MediaType = m.MediaType,
                Url = m.Url,
                PublishDate = m.PublishDate,
                Description = m.Description
            })
            .ToListAsync();
    }

    public async Task<MediaResponse?> GetByIdAsync(int id)
    {
        return await _context.Media
            .AsNoTracking()
            .Where(m => m.MediaId == id)
            .Select(m => new MediaResponse
            {
                MediaId = m.MediaId,
                ChurchId = m.ChurchId,
                Title = m.Title,
                MediaType = m.MediaType,
                Url = m.Url,
                PublishDate = m.PublishDate,
                Description = m.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MediaResponse?> CreateAsync(
        CreateMediaRequest request)
    {
        var church = await _context.ChurchInformation
            .FirstOrDefaultAsync();

        if (church == null)
            return null;

        var media = new Media
        {
            ChurchId = church.ChurchId,
            Title = request.Title.Trim(),
            MediaType = request.MediaType.Trim(),
            Url = request.Url.Trim(),
            PublishDate = request.PublishDate,
            Description = request.Description?.Trim()
        };

        _context.Media.Add(media);

        await _context.SaveChangesAsync();

        return MapToResponse(media);
    }

    public async Task<MediaResponse?> UpdateAsync(
        int id,
        UpdateMediaRequest request)
    {
        var media = await _context.Media
            .FirstOrDefaultAsync(m => m.MediaId == id);

        if (media == null)
            return null;

        media.Title = request.Title.Trim();
        media.MediaType = request.MediaType.Trim();
        media.Url = request.Url.Trim();
        media.PublishDate = request.PublishDate;
        media.Description = request.Description?.Trim();

        await _context.SaveChangesAsync();

        return MapToResponse(media);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var media = await _context.Media
            .FirstOrDefaultAsync(m => m.MediaId == id);

        if (media == null)
            return false;

        _context.Media.Remove(media);

        await _context.SaveChangesAsync();

        return true;
    }

    private static MediaResponse MapToResponse(
        Media media)
    {
        return new MediaResponse
        {
            MediaId = media.MediaId,
            ChurchId = media.ChurchId,
            Title = media.Title,
            MediaType = media.MediaType,
            Url = media.Url,
            PublishDate = media.PublishDate,
            Description = media.Description
        };
    }
}