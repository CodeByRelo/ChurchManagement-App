const API_BASE_URL = "https://localhost:7290/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
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
  getChurchInfo: () => request("/ChurchInfo"),

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
};
