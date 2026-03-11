import { api } from "./apiClient";

export async function fetchEntries(auth) {
  return api("/api/entries/", auth);
}

export async function createEntry(auth, payload) {
  return api("/api/entries/", {
    ...auth,
    method: "POST",
    body: payload,
  });
}

export async function updateEntry(auth, id, payload) {
  return api(`/api/entries/${id}/`, {
    ...auth,
    method: "PATCH",
    body: payload,
  });
}