using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.ChurchInfo;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class ChurchInfoService
{
    private readonly ApplicationDbContext _context;

    public ChurchInfoService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ChurchInfoResponse?> GetAsync()
    {
        var church = await _context.ChurchInformation
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return church == null
            ? null
            : MapToResponse(church);
    }

    public async Task<ChurchInfoResponse> UpdateAsync(
        UpdateChurchInfoRequest request)
    {
        var church = await _context.ChurchInformation
            .FirstOrDefaultAsync();

        if (church == null)
        {
            church = new ChurchInformation
            {
                Name = request.Name.Trim(),
                History = request.History?.Trim(),
                Vision = request.Vision?.Trim(),
                Mission = request.Mission?.Trim(),
                ContactNumber = request.ContactNumber?.Trim(),
                Email = request.Email?.Trim().ToLowerInvariant(),
                Address = request.Address?.Trim(),
                Website = request.Website?.Trim()
            };

            _context.ChurchInformation.Add(church);
        }
        else
        {
            church.Name = request.Name.Trim();
            church.History = request.History?.Trim();
            church.Vision = request.Vision?.Trim();
            church.Mission = request.Mission?.Trim();
            church.ContactNumber = request.ContactNumber?.Trim();
            church.Email = request.Email?.Trim().ToLowerInvariant();
            church.Address = request.Address?.Trim();
            church.Website = request.Website?.Trim();
        }

        await _context.SaveChangesAsync();

        return MapToResponse(church);
    }

    private static ChurchInfoResponse MapToResponse(
        ChurchInformation church)
    {
        return new ChurchInfoResponse
        {
            ChurchId = church.ChurchId,
            Name = church.Name,
            History = church.History,
            Vision = church.Vision,
            Mission = church.Mission,
            ContactNumber = church.ContactNumber,
            Email = church.Email,
            Address = church.Address,
            Website = church.Website
        };
    }
}