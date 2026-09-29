using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Ministries;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class MinistryService
{
    private readonly ApplicationDbContext _context;

    public MinistryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MinistryResponse>> GetAllAsync()
    {
        var ministries = await _context.Ministries
            .AsNoTracking()
            .Include(m => m.Leader)
            .Include(m => m.Memberships)
            .OrderBy(m => m.Name)
            .ToListAsync();

        return ministries
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<MinistryResponse?> GetByIdAsync(int id)
    {
        var ministry = await _context.Ministries
            .AsNoTracking()
            .Include(m => m.Leader)
            .Include(m => m.Memberships)
            .FirstOrDefaultAsync(m => m.MinistryId == id);

        return ministry == null
            ? null
            : MapToResponse(ministry);
    }

    public async Task<(MinistryResponse? Ministry, string? Error)>
        CreateAsync(CreateMinistryRequest request)
    {
        var name = request.Name.Trim();

        if (await _context.Ministries.AnyAsync(
                m => m.Name.ToLower() == name.ToLower()))
        {
            return (
                null,
                "A ministry with this name already exists."
            );
        }

        if (request.LeaderId.HasValue)
        {
            var leaderExists = await _context.Members.AnyAsync(
                m => m.MemberId == request.LeaderId.Value &&
                     m.MembershipStatus == "Active");

            if (!leaderExists)
            {
                return (
                    null,
                    "The specified ministry leader does not exist or is inactive."
                );
            }
        }

        var ministry = new Ministry
        {
            Name = name,
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            LeaderId = request.LeaderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Ministries.Add(ministry);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(ministry.MinistryId), null);
    }

    public async Task<(MinistryResponse? Ministry, string? Error)>
        UpdateAsync(int id, UpdateMinistryRequest request)
    {
        var ministry = await _context.Ministries
            .FirstOrDefaultAsync(m => m.MinistryId == id);

        if (ministry == null)
            return (null, "Ministry not found.");

        var name = request.Name.Trim();

        if (await _context.Ministries.AnyAsync(
                m => m.MinistryId != id &&
                     m.Name.ToLower() == name.ToLower()))
        {
            return (
                null,
                "A ministry with this name already exists."
            );
        }

        if (request.LeaderId.HasValue)
        {
            var leaderExists = await _context.Members.AnyAsync(
                m => m.MemberId == request.LeaderId.Value &&
                     m.MembershipStatus == "Active");

            if (!leaderExists)
            {
                return (
                    null,
                    "The specified ministry leader does not exist or is inactive."
                );
            }
        }

        ministry.Name = name;

        ministry.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();

        ministry.LeaderId = request.LeaderId;
        ministry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id), null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ministry = await _context.Ministries
            .FirstOrDefaultAsync(m => m.MinistryId == id);

        if (ministry == null)
            return false;

        _context.Ministries.Remove(ministry);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<MinistryMemberResponse>?> GetMembersAsync(
        int ministryId)
    {
        var ministryExists = await _context.Ministries
            .AnyAsync(m => m.MinistryId == ministryId);

        if (!ministryExists)
            return null;

        return await _context.MinistryMemberships
            .AsNoTracking()
            .Where(mm => mm.MinistryId == ministryId)
            .Include(mm => mm.Member)
            .OrderBy(mm => mm.Member!.LastName)
            .ThenBy(mm => mm.Member!.FirstName)
            .Select(mm => new MinistryMemberResponse
            {
                MemberId = mm.MemberId,
                FirstName = mm.Member!.FirstName,
                LastName = mm.Member.LastName,
                Email = mm.Member.Email,
                JoinedDate = mm.JoinedDate
            })
            .ToListAsync();
    }

    public async Task<string?> AddMemberAsync(
        int ministryId,
        AddMinistryMemberRequest request)
    {
        if (!await _context.Ministries.AnyAsync(
                m => m.MinistryId == ministryId))
        {
            return "Ministry not found.";
        }

        var member = await _context.Members
            .FirstOrDefaultAsync(m =>
                m.MemberId == request.MemberId);

        if (member == null)
            return "Member not found.";

        if (member.MembershipStatus != "Active")
            return "Inactive members cannot be added to a ministry.";

        if (await _context.MinistryMemberships.AnyAsync(
                mm => mm.MinistryId == ministryId &&
                      mm.MemberId == request.MemberId))
        {
            return "This member is already part of the ministry.";
        }

        var membership = new MinistryMembership
        {
            MinistryId = ministryId,
            MemberId = request.MemberId,
            JoinedDate = DateTime.UtcNow
        };

        _context.MinistryMemberships.Add(membership);

        await _context.SaveChangesAsync();

        return null;
    }

    public async Task<string?> RemoveMemberAsync(
        int ministryId,
        int memberId)
    {
        var membership = await _context.MinistryMemberships
            .FirstOrDefaultAsync(mm =>
                mm.MinistryId == ministryId &&
                mm.MemberId == memberId);

        if (membership == null)
            return "Ministry membership not found.";

        _context.MinistryMemberships.Remove(membership);

        await _context.SaveChangesAsync();

        return null;
    }

    private static MinistryResponse MapToResponse(
        Ministry ministry)
    {
        return new MinistryResponse
        {
            MinistryId = ministry.MinistryId,
            Name = ministry.Name,
            Description = ministry.Description,
            LeaderId = ministry.LeaderId,
            LeaderName = ministry.Leader == null
                ? null
                : $"{ministry.Leader.FirstName} {ministry.Leader.LastName}",
            MemberCount = ministry.Memberships.Count,
            CreatedAt = ministry.CreatedAt,
            UpdatedAt = ministry.UpdatedAt
        };
    }
}