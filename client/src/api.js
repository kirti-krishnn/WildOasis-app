const API_BASE = "/api/v1";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});

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
