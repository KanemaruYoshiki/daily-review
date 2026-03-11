import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../services/authService";
import { LS_ACCESS, LS_REFRESH } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [access, setAccess] = useState("");
  const [refresh, setRefresh] = useState("");

  useEffect(() => {
    const savedAccess = localStorage.getItem(LS_ACCESS) || "";
    const savedRefresh = localStorage.getItem(LS_REFRESH) || "";
    if (savedAccess && savedRefresh) {
      setAccess(savedAccess);
      setRefresh(savedRefresh);
    }
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const tok = await loginRequest({ username, password });
    setAccess(tok.access);
    setRefresh(tok.refresh);
    localStorage.setItem(LS_ACCESS, tok.access);
    localStorage.setItem(LS_REFRESH, tok.refresh);
    return tok;
  }, []);

  const logout = useCallback(() => {
    setAccess("");
    setRefresh("");
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
  }, []);

  const value = useMemo(() => ({
    access,
    refresh,
    setAccess,
    setRefresh,
    isLoggedIn: !!access,
    login,
    logout,
  }), [access, refresh, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}