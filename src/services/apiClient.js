// ONE central place that knows how to talk to the backend.
// Every service file (authService, adminService, documentService) is built
// on top of this — none of them call `fetch` directly. This is what makes
// the API layer reusable and keeps every page's code focused on UI only.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include", // send/receive the httpOnly auth cookie
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkErr) {
    // The backend server itself is unreachable (offline, wrong URL, etc.)
    throw new Error("Could not reach the server. Please check your connection.");
  }

  // The backend ALWAYS replies with { success, message, data } — parse once, here.
  let json;
  try {
    json = await res.json();
  } catch (parseErr) {
    throw new Error("Unexpected response from server");
  }

  if (!res.ok || !json.success) {
    // Every caller just needs to catch this one Error and show err.message in a toast.
    const error = new Error(json.message || "Something went wrong");
    error.status = res.status;
    error.details = json.data;
    throw error;
  }

  return json.data;
}

async function requestBlob(path, { method = "GET" } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Please check your connection.");
  }

  if (!res.ok) {
    let errorMessage = "Failed to retrieve file";
    try {
      const json = await res.json();
      if (json && json.message) {
        errorMessage = json.message;
      }
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    const error = new Error(errorMessage);
    error.status = res.status;
    throw error;
  }

  return await res.blob();
}

const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body, opts = {}) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: "PUT", body, ...opts }),
  del: (path, body, opts = {}) => request(path, { method: "DELETE", body, ...opts }),
  blob: (path, opts = {}) => requestBlob(path, opts),
};

export default apiClient;

