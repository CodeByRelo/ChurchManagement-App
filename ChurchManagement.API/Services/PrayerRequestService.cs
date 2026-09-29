using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.PrayerRequests;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class PrayerRequestService
{
    private readonly ApplicationDbContext _context;

    public PrayerRequestService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PrayerRequestResponse>> GetAllAsync()
    {
        return await _context.PrayerRequests
            .AsNoTracking()
            .Include(p => p.Member)
            .Include(p => p.Reviewer)
            .OrderByDescending(p => p.SubmittedDate)
            .Select(MapToResponseExpression())
            .ToListAsync();
    }

    public async Task<PrayerRequestResponse?> GetByIdAsync(int id)
    {
        return await _context.PrayerRequests
            .AsNoTracking()
            .Include(p => p.Member)
            .Include(p => p.Reviewer)
            .Where(p => p.PrayerRequestId == id)
            .Select(MapToResponseExpression())
            .FirstOrDefaultAsync();
    }

    public async Task<List<PrayerRequestResponse>>
        GetByMemberAsync(int memberId)
    {
        return await _context.PrayerRequests
            .AsNoTracking()
            .Include(p => p.Member)
            .Include(p => p.Reviewer)
            .Where(p => p.MemberId == memberId)
            .OrderByDescending(p => p.SubmittedDate)
            .Select(MapToResponseExpression())
            .ToListAsync();
    }

    public async Task<int?> GetMemberIdForUserAsync(int userId)
    {
        return await _context.Members
            .Where(m => m.UserId == userId)
            .Select(m => (int?)m.MemberId)
            .FirstOrDefaultAsync();
    }

    public async Task<(
        PrayerRequestResponse? Request,
        string? Error)> CreateAsync(
            int memberId,
            CreatePrayerRequest request)
    {
        var member = await _context.Members
            .FirstOrDefaultAsync(m =>
                m.MemberId == memberId);

        if (member == null)
            return (null, "Member not found.");

        if (member.MembershipStatus != "Active")
        {
            return (
                null,
                "Inactive members cannot submit prayer requests."
            );
        }

        var prayerRequest = new PrayerRequest
        {
            MemberId = memberId,
            RequestText = request.RequestText.Trim(),
            SubmittedDate = DateTime.UtcNow,
            Status = "Pending"
        };

        _context.PrayerRequests.Add(prayerRequest);

        await _context.SaveChangesAsync();

        return (
            await GetByIdAsync(
                prayerRequest.PrayerRequestId),
            null
        );
    }

    public async Task<(
        PrayerRequestResponse? Request,
        string? Error)> UpdateStatusAsync(
            int id,
            string status,
            int reviewerId)
    {
        var request = await _context.PrayerRequests
            .FirstOrDefaultAsync(p =>
                p.PrayerRequestId == id);

        if (request == null)
            return (null, "Prayer request not found.");

        var validStatuses = new[]
        {
            "Pending",
            "In Progress",
            "Answered",
            "Closed"
        };

        if (!validStatuses.Contains(status))
        {
            return (
                null,
                "Invalid status. Use Pending, In Progress, Answered, or Closed."
            );
        }

        var reviewerExists = await _context.Users
            .AnyAsync(u =>
                u.UserId == reviewerId &&
                u.IsActive);

        if (!reviewerExists)
            return (null, "Reviewer account not found.");

        request.Status = status.Trim();
        request.ReviewedBy = reviewerId;
        request.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (
            await GetByIdAsync(id),
            null
        );
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var request = await _context.PrayerRequests
            .FirstOrDefaultAsync(p =>
                p.PrayerRequestId == id);

        if (request == null)
            return false;

        _context.PrayerRequests.Remove(request);

        await _context.SaveChangesAsync();

        return true;
    }

    private static System.Linq.Expressions.Expression<
        Func<PrayerRequest, PrayerRequestResponse>>
        MapToResponseExpression()
    {
        return p => new PrayerRequestResponse
        {
            PrayerRequestId = p.PrayerRequestId,

            MemberId = p.MemberId,

            MemberName =
                p.Member!.FirstName +
                " " +
                p.Member.LastName,

            RequestText = p.RequestText,

            SubmittedDate = p.SubmittedDate,

            Status = p.Status,

            ReviewedBy = p.ReviewedBy,

            ReviewedByUsername =
                p.Reviewer != null
                    ? p.Reviewer.Username
                    : null,

            ReviewedAt = p.ReviewedAt
        };
    }
}