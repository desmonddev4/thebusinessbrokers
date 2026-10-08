const B = import.meta.env.VITE_API_URL || "/api";

const getErrorMessage = (status, isJsonError = false) => {
  if (isJsonError) return "Unable to connect to the server. Please check your internet connection or try again later.";
  if (status === 0) return "Network error. Please check your connection.";
  if (status >= 500) return "Server error. Please try again later.";
  if (status === 404) return "Resource not found.";
  if (status === 403) return "Access denied.";
  if (status === 401) return "Authentication required.";
  return "Something went wrong. Please try again.";
};

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const get = (p) =>
  fetch(`${B}${p}`, { headers: getHeaders() }).then(r => {
    if (!r.ok) throw { status: r.status, message: getErrorMessage(r.status), data: null };
    return r.json().catch(() => {
      throw { status: r.status, message: getErrorMessage(r.status, true), data: null };
    });
  });

export const post = async (p, body, isFormData = false) => {
  const headers = getHeaders();
  if (isFormData) {
    delete headers["Content-Type"]; // Let browser set multipart/form-data boundary
  }

  const r = await fetch(`${B}${p}`, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body)
  });
  let d;
  try {
    d = await r.json();
  } catch {
    d = {};
  }
  if (!r.ok) {
    // Try to get a more specific error message from the response
    let message = d.detail || d.error || d.message || getErrorMessage(r.status, !Object.keys(d).length);
    if (typeof d === 'object' && Object.keys(d).length > 0) {
      message = `${message}: ${JSON.stringify(d)}`;
    }
    throw { status: r.status, data: d, message };
  }
  return d;
};

export const put = async (p, body) => {
  const r = await fetch(`${B}${p}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  let d;
  try {
    d = await r.json();
  } catch {
    d = {};
  }
  if (!r.ok) {
    let message = d.detail || d.error || d.message || getErrorMessage(r.status, !Object.keys(d).length);
    if (typeof d === 'object' && Object.keys(d).length > 0) {
      message = `${message}: ${JSON.stringify(d)}`;
    }
    throw { status: r.status, data: d, message };
  }
  return d;
};

export const del = async (p) => {
  const r = await fetch(`${B}${p}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!r.ok) throw { status: r.status, message: getErrorMessage(r.status) };
  return true;
};

// Helper to fetch site content with fallback to static files
export const getContent = async (key, fallback = null) => {
  try {
    const data = await get("/content/");
    const content = data[key];
    if (content) {
      // Parse JSON if needed
      if (content.type === "json") {
        try {
          return JSON.parse(content.value);
        } catch {
          return content.value;
        }
      }
      return content.value;
    }
  } catch (err) {
    console.warn(`Failed to fetch content for ${key}:`, err);
  }
  return fallback;
};
