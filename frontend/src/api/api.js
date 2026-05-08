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

export const register = async (username, email, password) => {};

export const login = async (username, password) => {};

export const createApplication = async (application) => {};

export const getApplication = async (applicationId) => {};

export const getAllApplications = async () => {};

export const updateApplication = async (applicationId, application) => {};

export const deleteApplication = async (applicationId) => {};
