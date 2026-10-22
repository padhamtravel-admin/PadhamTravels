const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

console.log("🔌 API_BASE:", API_BASE);

async function handleResponse(res) {
  // Success → just return
  if (res.ok) return res;

  // Try to extract readable message
  let msg = "";
  try {
    const text = await res.text();
    if (text) {
      try {
        const json = JSON.parse(text);
        msg = json.message || JSON.stringify(json);
      } catch {
        msg = text;
      }
    }
  } catch {
    // ignore
  }

  // --- AUTH ERROR HANDLING (Modified) ---
  if (res.status === 401 || res.status === 403) {
    // If this error comes from "get-user" or "login", handle gracefully without global alert/redirect
    if (res.url.includes("/auth/get-user") || res.url.includes("/auth/login")) {
      const err = new Error(msg || "Authentication failed");
      err.response = { status: res.status, data: { message: msg } };
      throw err;
    }

    // For other routes (like trying to book a flight without login), keep blocking:
    localStorage.removeItem("authUser");
    sessionStorage.clear();
    localStorage.removeItem("user_flight_search_pref");
    const message = msg || "Session expired. Please login again.";

    alert(message);
    window.location.assign("/");
    const err = new Error(message);
    err.response = { status: res.status, data: { message } };
    throw err;
  }
  // -------------------------------------------

  // Other errors
  const err = new Error(msg || `Request failed with status ${res.status}`);
  err.response = { status: res.status, data: { message: msg } };
  throw err;
}

export async function apiGet(path) {
  const fullUrl = `${API_BASE}${path}`;
  console.log(`📡 GET Request to: ${fullUrl}`);
  const res = await fetch(fullUrl, {
    credentials: "include",
  });
  return handleResponse(res);
}

export async function apiPost(path, body, options = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...headers, ...options?.headers },
    credentials: "include",
    body: isFormData ? body : JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPut(path, body, options = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { ...headers, ...options?.headers },
    credentials: "include",
    body: isFormData ? body : JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiPatch(path, body, options = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { ...headers, ...options?.headers },
    credentials: "include",
    body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};

export default apiClient;

