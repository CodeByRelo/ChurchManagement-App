using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Visitors;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class VisitorService
{
    private readonly ApplicationDbContext _context;

    private static readonly string[] ValidFollowUpStatuses =
    {
        "Pending",
        "Contacted",
        "Followed Up",
        "Joined",
        "Closed"
    };

    public VisitorService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<VisitorResponse>> GetAllAsync()
    {
        return await _context.Visitors
            .AsNoTracking()
            .OrderByDescending(v => v.VisitDate)
            .ThenBy(v => v.LastName)
            .Select(v => new VisitorResponse
            {
                VisitorId = v.VisitorId,
                FirstName = v.FirstName,
                LastName = v.LastName,
                Phone = v.Phone,
                Email = v.Email,
                VisitDate = v.VisitDate,
                Notes = v.Notes,
                FollowUpStatus = v.FollowUpStatus,
                CreatedAt = v.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<VisitorResponse?> GetByIdAsync(int id)
    {
        return await _context.Visitors
            .AsNoTracking()
            .Where(v => v.VisitorId == id)
            .Select(v => new VisitorResponse
            {
                VisitorId = v.VisitorId,
                FirstName = v.FirstName,
                LastName = v.LastName,
                Phone = v.Phone,
                Email = v.Email,
                VisitDate = v.VisitDate,
                Notes = v.Notes,
                FollowUpStatus = v.FollowUpStatus,
                CreatedAt = v.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<VisitorResponse> CreateAsync(
        CreateVisitorRequest request)
    {
        var visitor = new Visitor
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim().ToLowerInvariant(),
            VisitDate = request.VisitDate,
            Notes = request.Notes?.Trim(),
            FollowUpStatus = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Visitors.Add(visitor);
        await _context.SaveChangesAsync();

        return MapToResponse(visitor);
    }

    public async Task<VisitorResponse?> UpdateAsync(
        int id,
        UpdateVisitorRequest request)
    {
        var visitor = await _context.Visitors
            .FirstOrDefaultAsync(v => v.VisitorId == id);

        if (visitor == null)
            return null;

        visitor.FirstName = request.FirstName.Trim();
        visitor.LastName = request.LastName.Trim();
        visitor.Phone = request.Phone?.Trim();
        visitor.Email = request.Email?.Trim().ToLowerInvariant();
        visitor.VisitDate = request.VisitDate;
        visitor.Notes = request.Notes?.Trim();

        await _context.SaveChangesAsync();

        return MapToResponse(visitor);
    }

    public async Task<VisitorResponse?> UpdateFollowUpAsync(
        int id,
        UpdateVisitorFollowUpRequest request)
    {
        var visitor = await _context.Visitors
            .FirstOrDefaultAsync(v => v.VisitorId == id);

        if (visitor == null)
            return null;

        var status = request.FollowUpStatus.Trim();

        if (!ValidFollowUpStatuses.Contains(
                status,
                StringComparer.OrdinalIgnoreCase))
        {
            throw new ArgumentException(
                "Invalid follow-up status.");
        }

        visitor.FollowUpStatus =
            ValidFollowUpStatuses.First(
                s => s.Equals(
                    status,
                    StringComparison.OrdinalIgnoreCase));

        await _context.SaveChangesAsync();

        return MapToResponse(visitor);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var visitor = await _context.Visitors
            .FirstOrDefaultAsync(v => v.VisitorId == id);

        if (visitor == null)
            return false;

        _context.Visitors.Remove(visitor);

        await _context.SaveChangesAsync();

        return true;
    }

    private static VisitorResponse MapToResponse(
        Visitor visitor)
    {
        return new VisitorResponse
        {
            VisitorId = visitor.VisitorId,
            FirstName = visitor.FirstName,
            LastName = visitor.LastName,
            Phone = visitor.Phone,
            Email = visitor.Email,
            VisitDate = visitor.VisitDate,
            Notes = visitor.Notes,
            FollowUpStatus = visitor.FollowUpStatus,
            CreatedAt = visitor.CreatedAt
        };
    }
}