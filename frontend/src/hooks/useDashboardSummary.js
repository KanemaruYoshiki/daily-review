import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchDashboardSummary } from "../services/dashboardService";

export function useDashboardSummary() {
  const { access, refresh, setAccess, setRefresh, isLoggedIn } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accessRef = useRef(access);
  const refreshRef = useRef(refresh);

  useEffect(() => {
    accessRef.current = access;
  }, [access]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const auth = useMemo(
    () => ({
      access: accessRef.current,
      refresh: refreshRef.current,
      setAccess,
      setRefresh,
    }),
    [setAccess, setRefresh]
  );

  const loadSummary = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError("");
      const data = await fetchDashboardSummary(auth);
      setSummary(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [auth, isLoggedIn]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    loading,
    error,
    loadSummary,
  };
}