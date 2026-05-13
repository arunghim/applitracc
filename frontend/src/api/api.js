const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
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
  localStorage.setItem("token", token);
  localStorage.setItem("firstName", firstName);
  localStorage.setItem("lastName", lastName);
  return res;
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const createApplication = (application) =>
  request("/applications", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(application),
  });

export const getApplication = (applicationId) =>
  request(`/applications/${applicationId}`, { headers: authHeaders() });

export const getAllApplications = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.company) query.set("company", params.company);
  if (params.page != null) query.set("page", params.page);
  if (params.size != null) query.set("size", params.size);
  const qs = query.toString();
  return request(`/applications${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
};

export const updateApplication = (applicationId, application) =>
  request(`/applications/${applicationId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(application),
  });

export const deleteApplication = (applicationId) =>
  request(`/applications/${applicationId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

export const getColumns = () => request("/columns", { headers: authHeaders() });

export const addColumn = (name) =>
  request("/columns", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });

export const deleteColumn = (columnId) =>
  request(`/columns/${columnId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
