/**
 * api.js — Centralized HTTP Client
 *
 * Handles two different error shapes the backend can return:
 *
 * Shape 1 — Custom errors from controller actions (our own code):
 *   { message: "Email already in use." }
 *
 * Shape 2 — ASP.NET ValidationProblemDetails (automatic from [ApiController]):
 *   { "title": "...", "errors": { "Field": ["msg"] } }
 *
 * Auto-logout: any 401 response wipes localStorage and redirects to /login.
 * This handles expired tokens silently — user gets sent to login instead of
 * seeing a confusing "Request failed (401)" error message.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5057";

function extractErrorMessage(data, status) {
  if (data?.message) return data.message;
  if (data?.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField.length > 0) return firstField[0];
  }
  return data?.title ?? `Request failed (${status})`;
}

function handleExpiredSession() {
  // Wipe everything auth-related from storage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userFullName");
  localStorage.removeItem("userRole");

  // Hard redirect to login — we use window.location instead of React Router
  // here because api.js has no access to the router context, and we want to
  // guarantee a clean state reset rather than a soft navigation.
  // The ?expired=1 param lets LoginPage show "Session expired, please sign in again."
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login?expired=1";
  }
}

async function request(endpoint, { auth = false, body, method = "GET", ...rest } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...rest,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch {
    const err = new Error(
      `Cannot reach the server at ${BASE_URL}. ` +
      `Make sure the backend is running: dotnet run --launch-profile http`
    );
    err.status = 0;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Token expired or missing — kick the user to login automatically
    if (response.status === 401) {
      handleExpiredSession();
      // Throw anyway so any in-flight promise chains stop cleanly
      const err = new Error("Session expired. Please sign in again.");
      err.status = 401;
      throw err;
    }

    const err = new Error(extractErrorMessage(data, response.status));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get:    (endpoint, opts = {}) => request(endpoint, { ...opts, method: "GET"    }),
  post:   (endpoint, opts = {}) => request(endpoint, { ...opts, method: "POST"   }),
  put:    (endpoint, opts = {}) => request(endpoint, { ...opts, method: "PUT"    }),
  patch:  (endpoint, opts = {}) => request(endpoint, { ...opts, method: "PATCH"  }),
  delete: (endpoint, opts = {}) => request(endpoint, { ...opts, method: "DELETE" }),
};

export default api;