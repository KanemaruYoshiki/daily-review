import { LS_ACCESS, LS_REFRESH } from "../utils/storage";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function safeJsonOrText(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export function toHttpError(res, data) {
  const msg = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data);
  return new Error(`HTTP ${res.status}: ${msg}`);
}

export async function api(path, { access, refresh, setAccess, setRefresh, method = "GET", body } = {}) {
  const doFetch = async (token) => {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token.trim()}`;

    return fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(access);
  if (res.status !== 401) {
    const data = await safeJsonOrText(res);
    if (!res.ok) throw toHttpError(res, data);
    return data;
  }

  if (!refresh) {
    const data = await safeJsonOrText(res);
    throw new Error(`HTTP 401: ${typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)}`);
  }

  const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh.trim() }),
  });

  const refreshData = await safeJsonOrText(refreshRes);
  if (!refreshRes.ok) {
    setAccess("");
    setRefresh("");
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    throw new Error(
      `Refresh failed (HTTP ${refreshRes.status}): ${
        typeof refreshData === "string" ? refreshData.slice(0, 200) : JSON.stringify(refreshData)
      }`
    );
  }

  const newAccess = refreshData.access;
  if (!newAccess) throw new Error("Refresh succeeded but no access token returned.");

  setAccess(newAccess);
  localStorage.setItem(LS_ACCESS, newAccess);

  res = await doFetch(newAccess);
  const data2 = await safeJsonOrText(res);
  if (!res.ok) throw toHttpError(res, data2);
  return data2;
}