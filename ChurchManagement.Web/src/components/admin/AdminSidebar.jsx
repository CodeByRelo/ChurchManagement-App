import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faGaugeHigh,
  faUsers,
  faPeopleGroup,
  faUserPlus,
  faChurch,
  faClipboardCheck,
  faClock,
  faCalendarDays,
  faListCheck,
  faBullhorn,
  faHandsPraying,
  faPhotoFilm,
  faCircleInfo,
  faUserGear,
  faFileLines,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

function AdminSidebar() {
  const { user, logout } = useAuth();

  const navigation = [
    {
      section: "MAIN",
      items: [
        {
          label: "Dashboard",
          path: "/admin",
          icon: faGaugeHigh,
        },
      ],
    },
    {
      section: "PEOPLE",
      items: [
        {
          label: "Members",
          path: "/admin/members",
          icon: faUsers,
        },
        {
          label: "Families",
          path: "/admin/families",
          icon: faPeopleGroup,
        },
        {
          label: "Visitors",
          path: "/admin/visitors",
          icon: faUserPlus,
        },
      ],
    },
    {
      section: "CHURCH",
      items: [
        {
          label: "Ministries",
          path: "/admin/ministries",
          icon: faChurch,
        },
        {
          label: "Attendance",
          path: "/admin/attendance",
          icon: faClipboardCheck,
        },
        {
          label: "Services",
          path: "/admin/services",
          icon: faClock,
        },
      ],
    },
    {
      section: "EVENTS",
      items: [
        {
          label: "Events",
          path: "/admin/events",
          icon: faCalendarDays,
        },
        {
          label: "Registrations",
          path: "/admin/registrations",
          icon: faListCheck,
        },
      ],
    },
    {
      section: "COMMUNICATION",
      items: [
        {
          label: "Announcements",
          path: "/admin/announcements",
          icon: faBullhorn,
        },
        {
          label: "Prayer Requests",
          path: "/admin/prayer-requests",
          icon: faHandsPraying,
        },
        {
          label: "Media",
          path: "/admin/media",
          icon: faPhotoFilm,
        },
      ],
    },
    {
      section: "WEBSITE",
      items: [
        {
          label: "Church Information",
          path: "/admin/church-information",
          icon: faCircleInfo,
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          label: "Users",
          path: "/admin/users",
          icon: faUserGear,
        },
        {
          label: "Audit Logs",
          path: "/admin/audit-logs",
          icon: faFileLines,
        },
      ],
    },
  ];

  async function handleLogout() {
    await logout();
  }

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-mark">JIA</div>

        <div>
          <strong>Jesus Is Able</strong>
          <span>ADMINISTRATION</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((group) => (
          <div className="sidebar-group" key={group.section}>
            <p className="sidebar-section">{group.section}</p>

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span className="sidebar-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>

                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {(user?.username || "A").charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user?.username || "Administrator"}</strong>

            <span>{user?.role || "Administrator"}</span>
          </div>
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          <span>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
