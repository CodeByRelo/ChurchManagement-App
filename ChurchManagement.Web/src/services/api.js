const API_BASE_URL = "https://churchmanagementapi.azurewebsites.net/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const error = await response.json();
      message = error.message || error.detail || message;
    } catch {
      // Ignore invalid error responses
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // PUBLIC
  getServices: () => request("/Services"),

  getEvents: () => request("/Events"),

  getAnnouncements: () => request("/Announcements/published"),

  getMedia: () => request("/Media"),

  submitPrayerRequest: (requestData, token) =>
    request("/PrayerRequests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    }),

  // CHURCH INFORMATION
  getChurchInfo: () => request("/ChurchInfo"),

  updateChurchInfo: (churchInfo, token) =>
    request("/ChurchInfo", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(churchInfo),
    }),

  // AUTH
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    }),

  getMe: (token) =>
    request("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  refresh: (refreshToken) =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    }),

  logout: (refreshToken, token) =>
    request("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }),

  // DASHBOARD
  getDashboard: (token) =>
    request("/Dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // MEMBERS
  getMembers: (token) =>
    request("/Members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getMember: (id, token) =>
    request(`/Members/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createMember: (member, token) =>
    request("/Members", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(member),
    }),

  updateMember: (id, member, token) =>
    request(`/Members/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(member),
    }),

  deactivateMember: (id, token) =>
    request(`/Members/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // FAMILIES
  getFamilies: (token) =>
    request("/Families", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getFamily: (id, token) =>
    request(`/Families/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createFamily: (family, token) =>
    request("/Families", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(family),
    }),

  updateFamily: (id, family, token) =>
    request(`/Families/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(family),
    }),

  deleteFamily: (id, token) =>
    request(`/Families/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // VISITORS
  getVisitors: (token) =>
    request("/Visitors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getVisitor: (id, token) =>
    request(`/Visitors/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createVisitor: (visitor, token) =>
    request("/Visitors", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(visitor),
    }),

  updateVisitor: (id, visitor, token) =>
    request(`/Visitors/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(visitor),
    }),

  updateVisitorFollowUp: (id, followUpStatus, token) =>
    request(`/Visitors/${id}/follow-up`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        followUpStatus,
      }),
    }),

  deleteVisitor: (id, token) =>
    request(`/Visitors/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // MINISTRIES
  getMinistries: (token) =>
    request("/Ministries", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getMinistry: (id, token) =>
    request(`/Ministries/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createMinistry: (ministry, token) =>
    request("/Ministries", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ministry),
    }),

  updateMinistry: (id, ministry, token) =>
    request(`/Ministries/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ministry),
    }),

  deleteMinistry: (id, token) =>
    request(`/Ministries/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getMinistryMembers: (id, token) =>
    request(`/Ministries/${id}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  addMinistryMember: (id, memberId, token) =>
    request(`/Ministries/${id}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        memberId: Number(memberId),
      }),
    }),

  removeMinistryMember: (id, memberId, token) =>
    request(`/Ministries/${id}/members/${memberId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // ATTENDANCE
  getAttendance: (token) =>
    request("/Attendance", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getAttendanceRecord: (id, token) =>
    request(`/Attendance/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getEventAttendance: (eventId, token) =>
    request(`/Attendance/event/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getMemberAttendance: (memberId, token) =>
    request(`/Attendance/member/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  recordAttendance: (attendance, token) =>
    request("/Attendance", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attendance),
    }),

  updateAttendance: (id, attendance, token) =>
    request(`/Attendance/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attendance),
    }),

  deleteAttendance: (id, token) =>
    request(`/Attendance/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // SERVICES
  getServices: (token) =>
    request("/Services", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getService: (id, token) =>
    request(`/Services/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createService: (service, token) =>
    request("/Services", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(service),
    }),

  updateService: (id, service, token) =>
    request(`/Services/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(service),
    }),

  deleteService: (id, token) =>
    request(`/Services/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // EVENTS
  getEvent: (id, token) =>
    request(`/Events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createEvent: (event, token) =>
    request("/Events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    }),

  updateEvent: (id, event, token) =>
    request(`/Events/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    }),

  deleteEvent: (id, token) =>
    request(`/Events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getEventRegistrations: (id, token) =>
    request(`/Events/${id}/registrations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  registerForEvent: (eventId, memberId, token) =>
    request(`/Events/${eventId}/registrations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        memberId,
      }),
    }),

  cancelEventRegistration: (eventId, memberId, token) =>
    request(`/Events/${eventId}/registrations/${memberId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // ANNOUNCEMENTS
  getAnnouncementsAdmin: (token) =>
    request("/Announcements", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getAnnouncement: (id, token) =>
    request(`/Announcements/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createAnnouncement: (announcement, token) =>
    request("/Announcements", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(announcement),
    }),

  updateAnnouncement: (id, announcement, token) =>
    request(`/Announcements/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(announcement),
    }),

  archiveAnnouncement: (id, token) =>
    request(`/Announcements/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // PRAYER REQUESTS
  getPrayerRequests: (token) =>
    request("/PrayerRequests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getPrayerRequest: (id, token) =>
    request(`/PrayerRequests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updatePrayerRequestStatus: (id, status, token) =>
    request(`/PrayerRequests/${id}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }),

  deletePrayerRequest: (id, token) =>
    request(`/PrayerRequests/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // MEDIA
  getMedia: () => request("/Media"),

  getMediaItem: (id, token) =>
    request(`/Media/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  createMedia: (media, token) =>
    request("/Media", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(media),
    }),

  updateMedia: (id, media, token) =>
    request(`/Media/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(media),
    }),

  deleteMedia: (id, token) =>
    request(`/Media/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // USERS
  createUser: (userData, token) =>
    request("/Users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }),

  getUsers: (token) =>
    request("/Users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getUser: (id, token) =>
    request(`/Users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updateUserRole: (id, roleId, token) =>
    request(`/Users/${id}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roleId,
      }),
    }),

  updateUserStatus: (id, isActive, token) =>
    request(`/Users/${id}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        isActive,
      }),
    }),

  // AUDIT LOGS
  getAuditLogs: (token) =>
    request("/AuditLogs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getAuditLog: (id, token) =>
    request(`/AuditLogs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
