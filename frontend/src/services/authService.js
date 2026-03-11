import { API_BASE, safeJsonOrText, toHttpError } from "./apiClient";

export async function loginRequest({ username, password }) {
  const res = await fetch(`${API_BASE}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const tok = await safeJsonOrText(res);
  if (!res.ok) throw toHttpError(res, tok);
  return tok;
}