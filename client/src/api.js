const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
const API_ORIGIN = new URL(API_BASE).origin;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const getStoredAuthToken = () => {
  try {
    return sessionStorage.getItem("wild-oasis-auth-token");
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) sessionStorage.setItem("wild-oasis-auth-token", token);
    else sessionStorage.removeItem("wild-oasis-auth-token");
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
};

export const getAssetUrl = (assetPath) => {
  if (!assetPath) return "";
  if (/^(https?:|data:|blob:)/i.test(assetPath)) return assetPath;

  const normalizedPath = assetPath
    .replace(/^public\//, "/")
    .replace(/^\/+/, "/");

  return `${API_ORIGIN}${normalizedPath}`;
};
export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const authToken = getStoredAuthToken();

  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

    // DELETE requests may return 204 with no response body
  if (response.status === 204) {
    return null;
  }

  let data;
  const isJson = response.headers.get("content-type")?.includes("application/json");
  data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(data?.message || "Something went wrong.", response.status);
  }
  return data;
};
