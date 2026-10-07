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

export const get = (p) =>
  fetch(`${B}${p}`).then(r => {
    if (!r.ok) throw { status: r.status, message: getErrorMessage(r.status) };
    return r.json().catch(() => {
      throw { status: r.status, message: getErrorMessage(r.status, true) };
    });
  });

export const post = async (p, body) => {
  const r = await fetch(`${B}${p}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  let d;
  try {
    d = await r.json();
  } catch {
    d = {};
  }
  if (!r.ok) throw { status: r.status, data: d, message: getErrorMessage(r.status, !Object.keys(d).length) };
  return d;
};
