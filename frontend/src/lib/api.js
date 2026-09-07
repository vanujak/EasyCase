const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Retrieve the active Clerk session token (or fallback to localStorage)
 */
export async function getAuthToken() {
  try {
    if (window.Clerk?.session) {
      return await window.Clerk.session.getToken();
    }
  } catch (err) {
    console.error("Error retrieving Clerk token:", err);
  }
  return localStorage.getItem("token") || null;
}

/**
 * Universal authenticated fetch helper
 * @param {string} path - URL path (e.g. "/api/cases" or full URL)
 * @param {RequestInit} options - fetch options
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const token = options.token || (await getAuthToken());

  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Default content-type for JSON requests with a body
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });
}
