using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Families;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class FamilyService
{
    private readonly ApplicationDbContext _context;

    public FamilyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FamilyResponse>> GetAllAsync()
    {
        var families = await _context.Families
            .AsNoTracking()
            .Include(f => f.Members)
            .OrderBy(f => f.FamilyName)
            .ToListAsync();

        return families
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<FamilyResponse?> GetByIdAsync(int id)
    {
        var family = await _context.Families
            .AsNoTracking()
            .Include(f => f.Members)
            .FirstOrDefaultAsync(f => f.FamilyId == id);

        return family == null
            ? null
            : MapToResponse(family);
    }

    public async Task<(FamilyResponse? Family, string? Error)> CreateAsync(
        CreateFamilyRequest request)
    {
        var familyName = request.FamilyName.Trim();

        if (await _context.Families.AnyAsync(
                f => f.FamilyName.ToLower() == familyName.ToLower()))
        {
            return (
                null,
                "A family with this name already exists."
            );
        }

        var family = new Family
        {
            FamilyName = familyName,
            Address = string.IsNullOrWhiteSpace(request.Address)
                ? null
                : request.Address.Trim(),
            ContactNumber = string.IsNullOrWhiteSpace(request.ContactNumber)
                ? null
                : request.ContactNumber.Trim()
        };

        _context.Families.Add(family);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(family.FamilyId), null);
    }

    public async Task<(FamilyResponse? Family, string? Error)> UpdateAsync(
        int id,
        UpdateFamilyRequest request)
    {
        var family = await _context.Families
            .FirstOrDefaultAsync(f => f.FamilyId == id);

        if (family == null)
            return (null, "Family not found.");

        var familyName = request.FamilyName.Trim();

        if (await _context.Families.AnyAsync(
                f => f.FamilyId != id &&
                     f.FamilyName.ToLower() == familyName.ToLower()))
        {
            return (
                null,
                "A family with this name already exists."
            );
        }

        family.FamilyName = familyName;

        family.Address = string.IsNullOrWhiteSpace(request.Address)
            ? null
            : request.Address.Trim();

        family.ContactNumber =
            string.IsNullOrWhiteSpace(request.ContactNumber)
                ? null
                : request.ContactNumber.Trim();

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id), null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var family = await _context.Families
            .Include(f => f.Members)
            .FirstOrDefaultAsync(f => f.FamilyId == id);

        if (family == null)
            return false;

        // Keep members; simply remove their family association.
        foreach (var member in family.Members)
        {
            member.FamilyId = null;
        }

        _context.Families.Remove(family);

        await _context.SaveChangesAsync();

        return true;
    }

    private static FamilyResponse MapToResponse(Family family)
    {
        return new FamilyResponse
        {
            FamilyId = family.FamilyId,
            FamilyName = family.FamilyName,
            Address = family.Address,
            ContactNumber = family.ContactNumber,
            MemberCount = family.Members.Count
        };
    }
}