import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUsers,
  faUserGroup,
  faUserPlus,
  faCalendarDays,
  faHandsPraying,
  faChurch,
  faBullhorn,
  faArrowRight,
  faPlus,
  faClock,
  faLocationDot,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function Dashboard() {
  const { user, accessToken } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getDashboard(accessToken);

      setDashboard(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const stats = dashboard
    ? [
        {
          label: "TOTAL MEMBERS",
          value: dashboard.totalMembers,
          detail: `${dashboard.activeMembers} active`,
          icon: faUsers,
          link: "/admin/members",
        },
        {
          label: "VISITORS",
          value: dashboard.totalVisitors,
          detail: `${dashboard.pendingFollowUps} follow-ups pending`,
          icon: faUserPlus,
          link: "/admin/visitors",
        },
        {
          label: "UPCOMING EVENTS",
          value: dashboard.upcomingEvents,
          detail: `${dashboard.totalEvents} total events`,
          icon: faCalendarDays,
          link: "/admin/events",
        },
        {
          label: "PRAYER REQUESTS",
          value: dashboard.pendingPrayerRequests,
          detail: `${dashboard.totalPrayerRequests} total requests`,
          icon: faHandsPraying,
          link: "/admin/prayer-requests",
        },
      ]
    : [];

  return (
    <section className="admin-dashboard">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">OVERVIEW</p>

          <h1>Welcome, {user?.username || "Administrator"}.</h1>

          <p>Here's what's happening across your church.</p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faClock} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="dashboard-error">
          <strong>Unable to load dashboard</strong>
          <span>{error}</span>

          <button type="button" onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      )}

      {/* LOADING */}

      {loading && !dashboard ? (
        <div className="dashboard-loading">
          <FontAwesomeIcon icon={faClock} spin />
          <span>Loading dashboard...</span>
        </div>
      ) : dashboard ? (
        <>
          {/* STAT CARDS */}

          <div className="dashboard-stats">
            {stats.map((stat) => (
              <Link to={stat.link} className="dashboard-stat" key={stat.label}>
                <div className="stat-top">
                  <span>{stat.label}</span>

                  <div className="stat-icon">
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                </div>

                <strong>{stat.value}</strong>

                <div className="stat-bottom">
                  <span>{stat.detail}</span>

                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </Link>
            ))}
          </div>

          {/* MAIN GRID */}

          <div className="dashboard-main-grid">
            {/* UPCOMING EVENTS */}

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <p>CALENDAR</p>
                  <h2>Upcoming events</h2>
                </div>

                <Link to="/admin/events">
                  View all
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              <div className="event-list">
                {dashboard.upcomingEventList?.length > 0 ? (
                  dashboard.upcomingEventList.map((event) => (
                    <div className="dashboard-event" key={event.eventId}>
                      <div className="event-date-box">
                        <strong>
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-ZA",
                            {
                              day: "2-digit",
                            },
                          )}
                        </strong>

                        <span>
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-ZA",
                            {
                              month: "short",
                            },
                          )}
                        </span>
                      </div>

                      <div className="dashboard-event-info">
                        <h3>{event.title}</h3>

                        <div className="event-meta">
                          <span>
                            <FontAwesomeIcon icon={faClock} />

                            {new Date(event.eventDate).toLocaleTimeString(
                              "en-ZA",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>

                          {event.location && (
                            <span>
                              <FontAwesomeIcon icon={faLocationDot} />

                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="event-registrations">
                        <strong>{event.registrationCount}</strong>

                        <span>registered</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-empty">
                    <FontAwesomeIcon icon={faCalendarDays} />

                    <span>No upcoming events.</span>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT VISITORS */}

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <p>PEOPLE</p>
                  <h2>Recent visitors</h2>
                </div>

                <Link to="/admin/visitors">
                  View all
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              <div className="visitor-list">
                {dashboard.recentVisitors?.length > 0 ? (
                  dashboard.recentVisitors.map((visitor) => (
                    <div className="dashboard-visitor" key={visitor.visitorId}>
                      <div className="visitor-avatar">
                        {visitor.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="visitor-info">
                        <strong>{visitor.name}</strong>

                        <span>
                          {new Date(visitor.visitDate).toLocaleDateString(
                            "en-ZA",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      <span
                        className={`visitor-status ${visitor.followUpStatus
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {visitor.followUpStatus}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-empty">
                    <FontAwesomeIcon icon={faUserPlus} />

                    <span>No recent visitors.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LOWER GRID */}

          <div className="dashboard-lower-grid">
            {/* QUICK ACTIONS */}

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <p>ACTIONS</p>
                  <h2>Quick actions</h2>
                </div>
              </div>

              <div className="quick-actions">
                <Link to="/admin/members">
                  <div>
                    <FontAwesomeIcon icon={faUsers} />
                  </div>

                  <span>Add Member</span>

                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>

                <Link to="/admin/visitors">
                  <div>
                    <FontAwesomeIcon icon={faUserPlus} />
                  </div>

                  <span>Add Visitor</span>

                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>

                <Link to="/admin/events">
                  <div>
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </div>

                  <span>Create Event</span>

                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>

                <Link to="/admin/announcements">
                  <div>
                    <FontAwesomeIcon icon={faBullhorn} />
                  </div>

                  <span>New Announcement</span>

                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </div>

            {/* CHURCH SNAPSHOT */}

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <p>CHURCH</p>
                  <h2>Quick snapshot</h2>
                </div>

                <FontAwesomeIcon
                  className="panel-heading-icon"
                  icon={faChurch}
                />
              </div>

              <div className="snapshot-grid">
                <div>
                  <span>FAMILIES</span>
                  <strong>{dashboard.totalFamilies}</strong>
                </div>

                <div>
                  <span>MINISTRIES</span>
                  <strong>{dashboard.totalMinistries}</strong>
                </div>

                <div>
                  <span>ANNOUNCEMENTS</span>
                  <strong>{dashboard.publishedAnnouncements}</strong>
                </div>

                <div>
                  <span>MEDIA</span>
                  <strong>{dashboard.totalMedia}</strong>
                </div>
              </div>

              <div className="snapshot-footer">
                <span>
                  <FontAwesomeIcon icon={faUserCheck} />
                  {dashboard.activeMembers} active members
                </span>

                <span>{dashboard.inactiveMembers} inactive</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default Dashboard;
