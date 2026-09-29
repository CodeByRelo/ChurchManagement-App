namespace ChurchManagement.API.DTOs.Dashboard;

public class DashboardResponse
{
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public int InactiveMembers { get; set; }

    public int TotalFamilies { get; set; }
    public int TotalVisitors { get; set; }
    public int PendingFollowUps { get; set; }

    public int TotalMinistries { get; set; }
    public int TotalEvents { get; set; }
    public int UpcomingEvents { get; set; }

    public int TotalAnnouncements { get; set; }
    public int PublishedAnnouncements { get; set; }

    public int TotalPrayerRequests { get; set; }
    public int PendingPrayerRequests { get; set; }

    public int TotalMedia { get; set; }

    public List<UpcomingEventResponse> UpcomingEventList { get; set; }
        = new();

    public List<RecentVisitorResponse> RecentVisitors { get; set; }
        = new();
}

public class UpcomingEventResponse
{
    public int EventId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string? Location { get; set; }
    public int RegistrationCount { get; set; }
}

public class RecentVisitorResponse
{
    public int VisitorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime VisitDate { get; set; }
    public string FollowUpStatus { get; set; } = string.Empty;
}