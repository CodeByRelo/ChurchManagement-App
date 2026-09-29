using ChurchManagement.API.Data;
using ChurchManagement.API.DTOs.Attendance;
using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Services;

public class AttendanceService
{
    private readonly ApplicationDbContext _context;

    public AttendanceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AttendanceResponse>> GetAllAsync()
    {
        return await _context.Attendance
            .AsNoTracking()
            .Include(a => a.Member)
            .Include(a => a.Event)
            .OrderByDescending(a => a.AttendanceDate)
            .Select(a => new AttendanceResponse
            {
                AttendanceId = a.AttendanceId,

                MemberId = a.MemberId,
                MemberName =
                    a.Member!.FirstName + " " + a.Member.LastName,

                EventId = a.EventId,
                EventTitle = a.Event!.Title,

                AttendanceDate = a.AttendanceDate,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<AttendanceResponse?> GetByIdAsync(int id)
    {
        return await _context.Attendance
            .AsNoTracking()
            .Include(a => a.Member)
            .Include(a => a.Event)
            .Where(a => a.AttendanceId == id)
            .Select(a => new AttendanceResponse
            {
                AttendanceId = a.AttendanceId,

                MemberId = a.MemberId,
                MemberName =
                    a.Member!.FirstName + " " + a.Member.LastName,

                EventId = a.EventId,
                EventTitle = a.Event!.Title,

                AttendanceDate = a.AttendanceDate,
                Status = a.Status
            })
            .FirstOrDefaultAsync();
    }

    public async Task<List<AttendanceResponse>?> GetByEventAsync(
        int eventId)
    {
        var eventExists = await _context.Events
            .AnyAsync(e => e.EventId == eventId);

        if (!eventExists)
            return null;

        return await _context.Attendance
            .AsNoTracking()
            .Include(a => a.Member)
            .Include(a => a.Event)
            .Where(a => a.EventId == eventId)
            .OrderBy(a => a.Member!.LastName)
            .ThenBy(a => a.Member!.FirstName)
            .Select(a => new AttendanceResponse
            {
                AttendanceId = a.AttendanceId,

                MemberId = a.MemberId,
                MemberName =
                    a.Member!.FirstName + " " + a.Member.LastName,

                EventId = a.EventId,
                EventTitle = a.Event!.Title,

                AttendanceDate = a.AttendanceDate,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<List<AttendanceResponse>?> GetByMemberAsync(
        int memberId)
    {
        var memberExists = await _context.Members
            .AnyAsync(m => m.MemberId == memberId);

        if (!memberExists)
            return null;

        return await _context.Attendance
            .AsNoTracking()
            .Include(a => a.Member)
            .Include(a => a.Event)
            .Where(a => a.MemberId == memberId)
            .OrderByDescending(a => a.AttendanceDate)
            .Select(a => new AttendanceResponse
            {
                AttendanceId = a.AttendanceId,

                MemberId = a.MemberId,
                MemberName =
                    a.Member!.FirstName + " " + a.Member.LastName,

                EventId = a.EventId,
                EventTitle = a.Event!.Title,

                AttendanceDate = a.AttendanceDate,
                Status = a.Status
            })
            .ToListAsync();
    }

    public async Task<(AttendanceResponse? Attendance, string? Error)>
        RecordAsync(RecordAttendanceRequest request)
    {
        var member = await _context.Members
            .FirstOrDefaultAsync(m =>
                m.MemberId == request.MemberId);

        if (member == null)
            return (null, "Member not found.");

        var eventItem = await _context.Events
            .FirstOrDefaultAsync(e =>
                e.EventId == request.EventId);

        if (eventItem == null)
            return (null, "Event not found.");

        var validStatuses = new[]
        {
            "Present",
            "Absent",
            "Excused"
        };

        if (!validStatuses.Contains(request.Status))
        {
            return (
                null,
                "Invalid attendance status. Use Present, Absent, or Excused."
            );
        }

        var existingAttendance =
            await _context.Attendance
                .FirstOrDefaultAsync(a =>
                    a.MemberId == request.MemberId &&
                    a.EventId == request.EventId);

        if (existingAttendance != null)
        {
            return (
                null,
                "Attendance has already been recorded for this member and event."
            );
        }

        var attendance = new Attendance
        {
            MemberId = request.MemberId,
            EventId = request.EventId,
            AttendanceDate = DateTime.UtcNow,
            Status = request.Status
        };

        _context.Attendance.Add(attendance);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(attendance.AttendanceId), null);
    }

    public async Task<(AttendanceResponse? Attendance, string? Error)>
        UpdateAsync(
            int id,
            string status)
    {
        var attendance = await _context.Attendance
            .FirstOrDefaultAsync(a =>
                a.AttendanceId == id);

        if (attendance == null)
            return (null, "Attendance record not found.");

        var validStatuses = new[]
        {
            "Present",
            "Absent",
            "Excused"
        };

        if (!validStatuses.Contains(status))
        {
            return (
                null,
                "Invalid attendance status. Use Present, Absent, or Excused."
            );
        }

        attendance.Status = status;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id), null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var attendance = await _context.Attendance
            .FirstOrDefaultAsync(a =>
                a.AttendanceId == id);

        if (attendance == null)
            return false;

        _context.Attendance.Remove(attendance);

        await _context.SaveChangesAsync();

        return true;
    }
}