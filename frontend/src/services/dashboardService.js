import { api } from "./apiClient";

export async function fetchDashboardSummary(auth) {
  return api("/api/dashboard/summary/", auth);
}