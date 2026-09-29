using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Members;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class MemberService
{
    private readonly ApplicationDbContext _context;

    public MemberService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MemberResponse>> GetAllAsync()
    {
        return await _context.Members
            .AsNoTracking()
            .Include(m => m.Family)
            .OrderBy(m => m.LastName)
            .ThenBy(m => m.FirstName)
            .Select(m => MapToResponse(m))
            .ToListAsync();
    }

    public async Task<MemberResponse?> GetByIdAsync(int id)
    {
        return await _context.Members
            .AsNoTracking()
            .Include(m => m.Family)
            .Where(m => m.MemberId == id)
            .Select(m => MapToResponse(m))
            .FirstOrDefaultAsync();
    }

    public async Task<(MemberResponse? Member, string? Error)> CreateAsync(
        CreateMemberRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _context.Members.AnyAsync(
                m => m.Email.ToLower() == email))
        {
            return (null, "A member with this email already exists.");
        }

        if (request.FamilyId.HasValue &&
            !await _context.Families.AnyAsync(
                f => f.FamilyId == request.FamilyId.Value))
        {
            return (null, "The specified family does not exist.");
        }

        if (request.UserId.HasValue)
        {
            if (!await _context.Users.AnyAsync(
                    u => u.UserId == request.UserId.Value))
            {
                return (null, "The specified user does not exist.");
            }

            if (await _context.Members.AnyAsync(
                    m => m.UserId == request.UserId.Value))
            {
                return (null,
                    "The specified user is already linked to a member.");
            }
        }

        var member = new Member
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            Phone = string.IsNullOrWhiteSpace(request.Phone)
                ? null
                : request.Phone.Trim(),
            DateOfBirth = request.DateOfBirth,
            FamilyId = request.FamilyId,
            UserId = request.UserId,
            MembershipStatus = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Members.Add(member);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(member.MemberId), null);
    }

    public async Task<(MemberResponse? Member, string? Error)> UpdateAsync(
        int id,
        UpdateMemberRequest request)
    {
        var member = await _context.Members
            .FirstOrDefaultAsync(m => m.MemberId == id);

        if (member == null)
            return (null, "Member not found.");

        var email = request.Email.Trim().ToLowerInvariant();

        if (await _context.Members.AnyAsync(
                m => m.MemberId != id &&
                     m.Email.ToLower() == email))
        {
            return (null, "A member with this email already exists.");
        }

        if (request.FamilyId.HasValue &&
            !await _context.Families.AnyAsync(
                f => f.FamilyId == request.FamilyId.Value))
        {
            return (null, "The specified family does not exist.");
        }

        if (request.UserId.HasValue)
        {
            if (!await _context.Users.AnyAsync(
                    u => u.UserId == request.UserId.Value))
            {
                return (null, "The specified user does not exist.");
            }

            if (await _context.Members.AnyAsync(
                    m => m.MemberId != id &&
                         m.UserId == request.UserId.Value))
            {
                return (null,
                    "The specified user is already linked to another member.");
            }
        }

        member.FirstName = request.FirstName.Trim();
        member.LastName = request.LastName.Trim();
        member.Email = email;
        member.Phone = string.IsNullOrWhiteSpace(request.Phone)
            ? null
            : request.Phone.Trim();
        member.DateOfBirth = request.DateOfBirth;
        member.FamilyId = request.FamilyId;
        member.UserId = request.UserId;

        if (!string.IsNullOrWhiteSpace(request.MembershipStatus))
            member.MembershipStatus =
                request.MembershipStatus.Trim();

        member.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id), null);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var member = await _context.Members
            .FirstOrDefaultAsync(m => m.MemberId == id);

        if (member == null)
            return false;

        member.MembershipStatus = "Inactive";
        member.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    private static MemberResponse MapToResponse(Member member)
    {
        return new MemberResponse
        {
            MemberId = member.MemberId,
            UserId = member.UserId,
            FamilyId = member.FamilyId,
            FamilyName = member.Family?.FamilyName,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Email = member.Email,
            Phone = member.Phone,
            DateOfBirth = member.DateOfBirth,
            MembershipStatus = member.MembershipStatus,
            CreatedAt = member.CreatedAt,
            UpdatedAt = member.UpdatedAt
        };
    }
}