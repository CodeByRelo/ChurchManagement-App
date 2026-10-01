import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminTopbar() {
  const location = useLocation();
  const { user } = useAuth();

  const pageNames = {
    "/admin": "Dashboard",
    "/admin/members": "Members",
    "/admin/families": "Families",
    "/admin/visitors": "Visitors",
    "/admin/ministries": "Ministries",
    "/admin/attendance": "Attendance",
    "/admin/services": "Services",
    "/admin/events": "Events",
    "/admin/registrations": "Registrations",
    "/admin/announcements": "Announcements",
    "/admin/prayer-requests": "Prayer Requests",
    "/admin/media": "Media",
    "/admin/church-information": "Church Information",
    "/admin/users": "Users",
    "/admin/audit-logs": "Audit Logs",
  };

  const pageTitle = pageNames[location.pathname] || "Administration";

  return (
    <header className="admin-topbar">
      <div>
        <p className="topbar-label">JESUS IS ABLE MINISTRIES</p>

        <h1>{pageTitle}</h1>
      </div>

      <div className="topbar-user">
        <div className="topbar-user-text">
          <strong>{user?.username || "Administrator"}</strong>

          <span>{user?.role || "Administrator"}</span>
        </div>

        <div className="topbar-avatar">
          {(user?.username || "A").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
