const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// Access token lives in module memory — not localStorage — so XSS cannot read it.
// It is lost on page refresh; the silent-refresh flow re-populates it on the
// first 401 from any protected endpoint (the HttpOnly refresh-token cookie is
// sent automatically by the browser).
let _accessToken = null;

let refreshPromise = null;

async function request(path, options = {}, isRetry = false) {
  const { headers: optHeaders, ...restOptions } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
      ...optHeaders,
    },
    ...restOptions,
  });

  if (
    response.status === 401 &&
    !isRetry &&
    path !== "/auth/login" &&
    path !== "/auth/refresh"
  ) {
    if (!refreshPromise) {
      refreshPromise = silentRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
    } catch {
      clearAuth();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    // _accessToken is now updated; request() will pick it up automatically
    return request(path, options, true);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

async function silentRefresh() {
  // No body needed — the HttpOnly refresh-token cookie is sent automatically.
  const res = await request("/auth/refresh", { method: "POST" }, true);
  _accessToken = res.data.token;
}

function clearAuth() {
  _accessToken = null;
  localStorage.removeItem("email");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
}

export const getHealth = () => request("/health");

export const register = (firstName, lastName, email, password) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

export const login = async (email, password) => {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const { token, firstName, lastName } = res.data;
  _accessToken = token;
  localStorage.setItem("email", email);
  localStorage.setItem("firstName", firstName);
  localStorage.setItem("lastName", lastName);
  return res;
};

export const logout = async () => {
  try {
    // No body needed — server reads the HttpOnly cookie and clears it.
    await request("/auth/logout", { method: "POST" });
  } catch {
    // logout is best-effort; ignore errors
  }
  clearAuth();
};

export const createApplication = (application) =>
  request("/applications", {
    method: "POST",
    body: JSON.stringify(application),
  });

export const getApplication = (applicationId) =>
  request(`/applications/${applicationId}`);

export const getAllApplications = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.company) query.set("company", params.company);
  if (params.page != null) query.set("page", params.page);
  if (params.size != null) query.set("size", params.size);
  const qs = query.toString();
  return request(`/applications${qs ? `?${qs}` : ""}`);
};

export const updateApplication = (applicationId, application) =>
  request(`/applications/${applicationId}`, {
    method: "PUT",
    body: JSON.stringify(application),
  });

export const deleteApplication = (applicationId) =>
  request(`/applications/${applicationId}`, { method: "DELETE" });

export const getColumns = () => request("/columns");

export const addColumn = (name) =>
  request("/columns", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const deleteColumn = (columnId) =>
  request(`/columns/${columnId}`, { method: "DELETE" });
