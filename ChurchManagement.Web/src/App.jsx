import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public/Home";

import ProtectedRoute from "./components/admin/ProtectedRoute";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import Families from "./pages/admin/Families";
import Visitors from "./pages/admin/Visitors";
import Ministries from "./pages/admin/Ministries";
import Attendance from "./pages/admin/Attendance";
import Services from "./pages/admin/Services";
import Events from "./pages/admin/Events";
import Registrations from "./pages/admin/Registrations";
import Announcements from "./pages/admin/Announcements";
import PrayerRequests from "./pages/admin/PrayerRequests";
import Media from "./pages/admin/Media";
import ChurchInformation from "./pages/admin/ChurchInformation";
import Users from "./pages/admin/Users";
import AuditLogs from "./pages/admin/AuditLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<Login />} />

        {/* PROTECTED ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/members" element={<Members />} />
            <Route path="/admin/families" element={<Families />} />
            <Route path="/admin/visitors" element={<Visitors />} />
            <Route path="/admin/ministries" element={<Ministries />} />
            <Route path="/admin/attendance" element={<Attendance />} />
            <Route path="/admin/services" element={<Services />} />
            <Route path="/admin/events" element={<Events />} />
            <Route path="/admin/registrations" element={<Registrations />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            <Route path="/admin/prayer-requests" element={<PrayerRequests />} />
            <Route path="/admin/media" element={<Media />} />
            <Route
              path="/admin/church-information"
              element={<ChurchInformation />}
            />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
