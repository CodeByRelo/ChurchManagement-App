using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Services;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class ChurchServiceService
{
    private readonly ApplicationDbContext _context;

    public ChurchServiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceResponse>> GetAllAsync()
    {
        return await _context.Services
            .AsNoTracking()
            .OrderBy(s => s.Day)
            .ThenBy(s => s.Time)
            .Select(s => new ServiceResponse
            {
                ServiceId = s.ServiceId,
                ChurchId = s.ChurchId,
                Name = s.Name,
                Day = s.Day,
                Time = s.Time,
                Location = s.Location,
                Description = s.Description
            })
            .ToListAsync();
    }

    public async Task<ServiceResponse?> GetByIdAsync(int id)
    {
        return await _context.Services
            .AsNoTracking()
            .Where(s => s.ServiceId == id)
            .Select(s => new ServiceResponse
            {
                ServiceId = s.ServiceId,
                ChurchId = s.ChurchId,
                Name = s.Name,
                Day = s.Day,
                Time = s.Time,
                Location = s.Location,
                Description = s.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceResponse?> CreateAsync(
        CreateServiceRequest request)
    {
        var church = await _context.ChurchInformation
            .FirstOrDefaultAsync();

        if (church == null)
            return null;

        var service = new Service
        {
            ChurchId = church.ChurchId,
            Name = request.Name.Trim(),
            Day = request.Day.Trim(),
            Time = request.Time.Trim(),
            Location = request.Location?.Trim(),
            Description = request.Description?.Trim()
        };

        _context.Services.Add(service);

        await _context.SaveChangesAsync();

        return MapToResponse(service);
    }

    public async Task<ServiceResponse?> UpdateAsync(
        int id,
        UpdateServiceRequest request)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.ServiceId == id);

        if (service == null)
            return null;

        service.Name = request.Name.Trim();
        service.Day = request.Day.Trim();
        service.Time = request.Time.Trim();
        service.Location = request.Location?.Trim();
        service.Description = request.Description?.Trim();

        await _context.SaveChangesAsync();

        return MapToResponse(service);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.ServiceId == id);

        if (service == null)
            return false;

        _context.Services.Remove(service);

        await _context.SaveChangesAsync();

        return true;
    }

    private static ServiceResponse MapToResponse(
        Service service)
    {
        return new ServiceResponse
        {
            ServiceId = service.ServiceId,
            ChurchId = service.ChurchId,
            Name = service.Name,
            Day = service.Day,
            Time = service.Time,
            Location = service.Location,
            Description = service.Description
        };
    }
}