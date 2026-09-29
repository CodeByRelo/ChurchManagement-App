using ChurchManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChurchManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<Visitor> Visitors => Set<Visitor>();
    public DbSet<Ministry> Ministries => Set<Ministry>();
    public DbSet<MinistryMembership> MinistryMemberships => Set<MinistryMembership>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventRegistration> EventRegistrations => Set<EventRegistration>();
    public DbSet<Attendance> Attendance => Set<Attendance>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<PrayerRequest> PrayerRequests => Set<PrayerRequest>();
    public DbSet<ChurchInformation> ChurchInformation => Set<ChurchInformation>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Media> Media => Set<Media>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================================================
        // PRIMARY KEYS
        // =========================================================

        modelBuilder.Entity<Role>()
            .HasKey(r => r.RoleId);

        modelBuilder.Entity<User>()
            .HasKey(u => u.UserId);

        modelBuilder.Entity<Member>()
            .HasKey(m => m.MemberId);

        modelBuilder.Entity<Family>()
            .HasKey(f => f.FamilyId);

        modelBuilder.Entity<Visitor>()
            .HasKey(v => v.VisitorId);

        modelBuilder.Entity<Ministry>()
            .HasKey(m => m.MinistryId);

        modelBuilder.Entity<MinistryMembership>()
            .HasKey(mm => mm.MembershipId);

        modelBuilder.Entity<Event>()
            .HasKey(e => e.EventId);

        modelBuilder.Entity<EventRegistration>()
            .HasKey(er => er.RegistrationId);

        modelBuilder.Entity<Attendance>()
            .HasKey(a => a.AttendanceId);

        modelBuilder.Entity<Announcement>()
            .HasKey(a => a.AnnouncementId);

        modelBuilder.Entity<PrayerRequest>()
            .HasKey(p => p.PrayerRequestId);

        modelBuilder.Entity<ChurchInformation>()
            .HasKey(c => c.ChurchId);

        modelBuilder.Entity<Service>()
            .HasKey(s => s.ServiceId);

        modelBuilder.Entity<Media>()
            .HasKey(m => m.MediaId);

        modelBuilder.Entity<RefreshToken>()
            .HasKey(rt => rt.RefreshTokenId);

        modelBuilder.Entity<AuditLog>()
            .HasKey(al => al.AuditLogId);


        // =========================================================
        // ROLE → USERS
        // =========================================================

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);


        // =========================================================
        // USER → MEMBER
        // =========================================================

        modelBuilder.Entity<Member>()
            .HasOne(m => m.User)
            .WithOne(u => u.Member)
            .HasForeignKey<Member>(m => m.UserId)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // FAMILY → MEMBERS
        // =========================================================

        modelBuilder.Entity<Member>()
            .HasOne(m => m.Family)
            .WithMany(f => f.Members)
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // MINISTRY → LEADER
        // =========================================================

        modelBuilder.Entity<Ministry>()
            .HasOne(m => m.Leader)
            .WithMany(m => m.LedMinistries)
            .HasForeignKey(m => m.LeaderId)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // MEMBER ↔ MINISTRY
        // =========================================================

        modelBuilder.Entity<MinistryMembership>()
            .HasOne(mm => mm.Member)
            .WithMany(m => m.MinistryMemberships)
            .HasForeignKey(mm => mm.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MinistryMembership>()
            .HasOne(mm => mm.Ministry)
            .WithMany(m => m.Memberships)
            .HasForeignKey(mm => mm.MinistryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MinistryMembership>()
            .HasIndex(mm => new
            {
                mm.MemberId,
                mm.MinistryId
            })
            .IsUnique();


        // =========================================================
        // EVENT → CREATOR
        // =========================================================

        modelBuilder.Entity<Event>()
            .HasOne(e => e.Creator)
            .WithMany()
            .HasForeignKey(e => e.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // EVENT → REGISTRATIONS
        // =========================================================

        modelBuilder.Entity<EventRegistration>()
            .HasOne(er => er.Event)
            .WithMany(e => e.Registrations)
            .HasForeignKey(er => er.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventRegistration>()
            .HasOne(er => er.Member)
            .WithMany(m => m.EventRegistrations)
            .HasForeignKey(er => er.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EventRegistration>()
            .HasIndex(er => new
            {
                er.EventId,
                er.MemberId
            })
            .IsUnique();


        // =========================================================
        // ATTENDANCE
        // =========================================================

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Member)
            .WithMany(m => m.AttendanceRecords)
            .HasForeignKey(a => a.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Event)
            .WithMany(e => e.AttendanceRecords)
            .HasForeignKey(a => a.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Attendance>()
            .HasIndex(a => new { a.MemberId, a.EventId })
            .IsUnique();


        // =========================================================
        // ANNOUNCEMENTS
        // =========================================================

        modelBuilder.Entity<Announcement>()
            .HasOne(a => a.Creator)
            .WithMany(u => u.Announcements)
            .HasForeignKey(a => a.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // PRAYER REQUESTS
        // =========================================================

        modelBuilder.Entity<PrayerRequest>()
            .HasOne(p => p.Member)
            .WithMany(m => m.PrayerRequests)
            .HasForeignKey(p => p.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PrayerRequest>()
            .HasOne(p => p.Reviewer)
            .WithMany()
            .HasForeignKey(p => p.ReviewedBy)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // CHURCH INFORMATION → SERVICES
        // =========================================================

        modelBuilder.Entity<Service>()
            .HasOne(s => s.Church)
            .WithMany(c => c.Services)
            .HasForeignKey(s => s.ChurchId)
            .OnDelete(DeleteBehavior.Cascade);


        // =========================================================
        // CHURCH INFORMATION → MEDIA
        // =========================================================

        modelBuilder.Entity<Media>()
            .HasOne(m => m.Church)
            .WithMany(c => c.Media)
            .HasForeignKey(m => m.ChurchId)
            .OnDelete(DeleteBehavior.Cascade);


        // =========================================================
        // REFRESH TOKENS
        // =========================================================

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // =========================================================
        // AUDIT LOGS
        // =========================================================

        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.SetNull);


        // =========================================================
        // UNIQUE INDEXES
        // =========================================================

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();


        // =========================================================
        // PERFORMANCE INDEXES
        // =========================================================

        modelBuilder.Entity<Event>()
            .HasIndex(e => e.EventDate);

        modelBuilder.Entity<Announcement>()
            .HasIndex(a => a.PublishDate);

        modelBuilder.Entity<PrayerRequest>()
            .HasIndex(p => p.SubmittedDate);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();


        // =========================================================
        // STRING LENGTHS
        // =========================================================

        modelBuilder.Entity<Role>()
            .Property(r => r.RoleName)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<Member>()
            .Property(m => m.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Member>()
            .Property(m => m.LastName)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Member>()
            .Property(m => m.Email)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Member>()
            .Property(m => m.Phone)
            .HasMaxLength(30);

        modelBuilder.Entity<Family>()
            .Property(f => f.FamilyName)
            .HasMaxLength(150)
            .IsRequired();

        modelBuilder.Entity<Visitor>()
            .Property(v => v.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Visitor>()
            .Property(v => v.LastName)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Ministry>()
            .Property(m => m.Name)
            .HasMaxLength(150)
            .IsRequired();

        modelBuilder.Entity<Event>()
            .Property(e => e.Title)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<Event>()
            .Property(e => e.Location)
            .HasMaxLength(255);

        modelBuilder.Entity<Announcement>()
            .Property(a => a.Title)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<Announcement>()
            .Property(a => a.TargetAudience)
            .HasMaxLength(100);

        modelBuilder.Entity<PrayerRequest>()
            .Property(p => p.Status)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<RefreshToken>()
            .Property(rt => rt.Token)
            .HasMaxLength(500)
            .IsRequired();

        modelBuilder.Entity<AuditLog>()
            .Property(al => al.Action)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<AuditLog>()
            .Property(al => al.EntityName)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<AuditLog>()
            .Property(al => al.IpAddress)
            .HasMaxLength(45);
    }
}