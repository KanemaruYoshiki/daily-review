import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// localStorage keys
const LS_ACCESS = "dailyReviewAccess";
const LS_REFRESH = "dailyReviewRefresh";

/* ======================
   Utils
====================== */
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(ymd, diff) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + diff);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

async function safeJsonOrText(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function toHttpError(res, data) {
  const msg = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data);
  return new Error(`HTTP ${res.status}: ${msg}`);
}

/**
 * API call with:
 * - Bearer token
 * - auto refresh once on 401 (if refresh token exists)
 */
async function api(path, { access, refresh, setAccess, setRefresh, method = "GET", body } = {}) {
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

  // 1st try
  let res = await doFetch(access);
  if (res.status !== 401) {
    const data = await safeJsonOrText(res);
    if (!res.ok) throw toHttpError(res, data);
    return data;
  }

  // 401: try refresh once
  if (!refresh) {
    const data = await safeJsonOrText(res);
    throw new Error(`HTTP 401: ${typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)}`);
  }

  // refresh token -> new access
  const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh.trim() }),
  });

  const refreshData = await safeJsonOrText(refreshRes);
  if (!refreshRes.ok) {
    // refreshも無効ならログアウト扱い
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

  // save new access
  setAccess(newAccess);
  localStorage.setItem(LS_ACCESS, newAccess);

  // retry original request with new access
  res = await doFetch(newAccess);
  const data2 = await safeJsonOrText(res);
  if (!res.ok) throw toHttpError(res, data2);
  return data2;
}

/* ======================
   Hooks
====================== */
function useBodyTheme() {
  useEffect(() => {
    const prev = {
      margin: document.body.style.margin,
      background: document.body.style.background,
      color: document.body.style.color,
      fontFamily: document.body.style.fontFamily,
    };

    document.body.style.margin = "0";
    document.body.style.background =
      "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.35), transparent 60%)," +
      "radial-gradient(900px 500px at 85% 20%, rgba(16,185,129,0.20), transparent 55%)," +
      "radial-gradient(900px 500px at 70% 85%, rgba(236,72,153,0.18), transparent 55%)," +
      "linear-gradient(180deg, #0b1020, #070a14)";
    document.body.style.color = "rgba(255,255,255,0.92)";
    document.body.style.fontFamily =
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';

    return () => {
      document.body.style.margin = prev.margin;
      document.body.style.background = prev.background;
      document.body.style.color = prev.color;
      document.body.style.fontFamily = prev.fontFamily;
    };
  }, []);
}

function useToasts() {
  const [toasts, setToasts] = useState([]); // {id, type, message}

  const pushToast = useCallback((type, message, ms = 2500) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ms);
  }, []);

  return { toasts, pushToast };
}

function ToastArea({ toasts }) {
  return (
    <div style={styles.toastArea}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            ...styles.toast,
            background: t.type === "success" ? "rgba(16,185,129,0.20)" : "rgba(239,68,68,0.20)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function withBtnFx() {
  return {
    onMouseDown: (e) => (e.currentTarget.style.transform = "translateY(1px)"),
    onMouseUp: (e) => (e.currentTarget.style.transform = "translateY(0px)"),
    onMouseLeave: (e) => (e.currentTarget.style.transform = "translateY(0px)"),
  };
}

/* ======================
   Styles (outside)
====================== */
const styles = {
  page: { minHeight: "100vh", padding: "28px 16px 60px" },
  shell: { maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 },
  header: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  titleWrap: { display: "grid", gap: 6 },
  h1: { margin: 0, fontSize: 42, letterSpacing: "-0.04em", lineHeight: 1.05 },
  sub: { margin: 0, opacity: 0.75, fontSize: 14 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    fontSize: 13,
    opacity: 0.9,
  },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 16 },
  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    overflow: "hidden",
  },
  cardInner: { padding: 16 },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
    border: "none",
    margin: "0",
  },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  rowRight: { marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

  btnBase: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    fontSize: 14,
    lineHeight: "20px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    transition: "transform 120ms ease, background 120ms ease, border-color 120ms ease",
    userSelect: "none",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(16,185,129,0.65))",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  btnGhost: { background: "transparent", border: "1px solid rgba(255,255,255,0.22)" },
  btnDanger: {
    background: "linear-gradient(135deg, rgba(239,68,68,0.85), rgba(236,72,153,0.55))",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  field: { display: "grid", gap: 8 },
  label: { fontSize: 13, opacity: 0.85 },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10,14,30,0.55)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  textarea: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10,14,30,0.55)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    resize: "vertical",
    minHeight: 96,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  datePill: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    letterSpacing: "0.02em",
    opacity: 0.95,
  },

  alert: {
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  alertInfo: { border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.10)" },
  alertErr: {
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    color: "rgba(255,210,210,0.95)",
  },

  debugTitle: { margin: "0 0 10px", opacity: 0.75, fontSize: 13 },
  debug: {
    margin: 0,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    overflow: "auto",
    maxHeight: 260,
    fontSize: 12,
    lineHeight: 1.4,
  },

  toastArea: {
    position: "fixed",
    right: 20,
    bottom: 20,
    display: "grid",
    gap: 12,
    zIndex: 9999,
  },
  toast: {
    padding: "12px 14px",
    borderRadius: 16,
    minWidth: 240,
    maxWidth: 320,
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.95)",
    boxShadow: "0 14px 35px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    fontSize: 14,
    fontWeight: 600,
  },
};

/* ======================
   App
====================== */
export default function App() {
  useBodyTheme();

  // login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // tokens
  const [access, setAccess] = useState("");
  const [refresh, setRefresh] = useState("");

  // data/messages
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // form state
  const [entryId, setEntryId] = useState(null);
  const [date, setDate] = useState(todayYMD());
  const [title, setTitle] = useState("");
  const [good, setGood] = useState("");
  const [bad, setBad] = useState("");
  const [next, setNext] = useState("");
  const [mood, setMood] = useState(3);

  const isLoggedIn = !!access;

  // saving & toast
  const [saving, setSaving] = useState(false);
  const { toasts, pushToast } = useToasts();

  // latest token refs (元の挙動維持)
  const accessRef = useRef(access);
  const refreshRef = useRef(refresh);
  useEffect(() => {
    accessRef.current = access;
  }, [access]);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const modeLabel = useMemo(() => (entryId ? "更新 (PATCH)" : "新規 (POST)"), [entryId]);

  const modeChip = useMemo(() => {
    return entryId
      ? { label: "Update", sub: "PATCH", glow: "rgba(16,185,129,0.45)" }
      : { label: "Create", sub: "POST", glow: "rgba(99,102,241,0.45)" };
  }, [entryId]);

  const resetForm = useCallback((ymd = todayYMD()) => {
    setEntryId(null);
    setDate(ymd);
    setTitle("");
    setGood("");
    setBad("");
    setNext("");
    setMood(3);
  }, []);

  const applyEntryToForm = useCallback((e) => {
    setEntryId(e?.id ?? null);
    setDate(e?.date ?? todayYMD());
    setTitle(e?.title ?? "");
    setGood(e?.good ?? "");
    setBad(e?.bad ?? "");
    setNext(e?.next ?? "");
    setMood(e?.mood ?? 3);
  }, []);

  const isDuplicateDateError = (msg) =>
  typeof msg === "string" &&
  msg.includes("HTTP 400") &&
  msg.includes('"date"') &&
  msg.includes("This date already has an entry.");

  const findEntryByDate = (list, ymd) =>
    Array.isArray(list) ? list.find((e) => e.date === ymd) : null;

  // ✅ 指定idにPATCHして保存する（ここが自動化の本体）
  const patchById = async (id) => {
    const updated = await api(`/api/entries/${id}/`, {
      access: accessRef.current,
      refresh: refreshRef.current,
      setAccess,
      setRefresh,
      method: "PATCH",
      body: { title, good, bad, next, mood, date },
    });
    return updated;
  };

  // ✅ 元コードのselectByDateをそのまま
  const selectByDate = useCallback(
    (ymd) => {
      if (!ymd) return;

      // entriesが未取得なら、フォームの日付だけ変えて終了
      if (!Array.isArray(data)) {
        setEntryId(null);
        setDate(ymd);
        return;
      }

      const found = data.find((e) => e.date === ymd);

      if (found) {
        // すでに同じentryを表示中なら何もしない
        if (entryId === found.id && date === found.date) return;
        applyEntryToForm(found);
        setInfo(`${ymd}の記録を読み込みました（更新モード）`);
      } else {
        // その日付の記録がない -> 新規
        if (entryId === null && date === ymd) return;
        resetForm(ymd);
        setInfo(`${ymd}は未作成です（新規作成モード）`);
      }
    },
    [applyEntryToForm, data, date, entryId, resetForm]
  );

  const logout = useCallback(() => {
    setAccess("");
    setRefresh("");
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    setInfo("ログアウトしました");
  }, []);

  const login = useCallback(async () => {
    setErr("");
    setInfo("");

    const res = await fetch(`${API_BASE}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const tok = await safeJsonOrText(res);
    if (!res.ok) throw toHttpError(res, tok);

    setAccess(tok.access);
    setRefresh(tok.refresh);

    localStorage.setItem(LS_ACCESS, tok.access);
    localStorage.setItem(LS_REFRESH, tok.refresh);

    setInfo("ログイン成功（トークン保存済み）");
  }, [password, username]);

  const loadEntries = useCallback(async () => {
    setErr("");
    setInfo("");

    const list = await api("/api/entries/", {
      access: accessRef.current,
      refresh: refreshRef.current,
      setAccess,
      setRefresh,
    });

    setData(list);

    // entriesを取り直したら、現在フォームの日付に合わせてモードを再判定
    setTimeout(() => selectByDate(date), 0);

    const ymd = todayYMD();
    const todayEntry = Array.isArray(list) ? list.find((e) => e.date === ymd) : null;
    if (todayEntry) {
      applyEntryToForm(todayEntry);
      setInfo("今日の記録を読み込みました（更新モード）");
    } else {
      resetForm(ymd);
      setInfo("今日の記録が無いので新規作成モードです");
    }
  }, [applyEntryToForm, date, resetForm, selectByDate]);

  // 起動時に localStorage から復元（元コード同様）
  useEffect(() => {
    const savedAccess = localStorage.getItem(LS_ACCESS) || "";
    const savedRefresh = localStorage.getItem(LS_REFRESH) || "";
    if (savedAccess && savedRefresh) {
      setAccess(savedAccess);
      setRefresh(savedRefresh);
      setInfo("保存済みトークンで復帰しました");
    }
  }, []);

  // ログイン（accessが入った）後に自動ロード（元コード同様）
  useEffect(() => {
    if (!access) return;
    loadEntries().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const save = useCallback(async () => {
    setErr("");
    setInfo("");
    if (!date) throw new Error("date が空です");
    if (saving) return;

    try {
      setSaving(true);

      if (entryId) {
        const updated = await api(`/api/entries/${entryId}/`, {
          access: accessRef.current,
          refresh: refreshRef.current,
          setAccess,
          setRefresh,
          method: "PATCH",
          body: { title, good, bad, next, mood, date },
        });
        setInfo(`更新しました（id=${updated.id}）`);
        pushToast("success", "更新しました ✅");
      } else {
        const created = await api("/api/entries/", {
          access: accessRef.current,
          refresh: refreshRef.current,
          setAccess,
          setRefresh,
          method: "POST",
          body: { date, title, good, bad, next, mood },
        });
        setInfo(`作成しました（id=${created.id}）`);
        pushToast("success", "作成しました ✅");
      }

      await loadEntries();
    } catch (e) {
      const msg = String(e);

      // ✅ 同日重複（POST）なら → 自動でPATCH保存まで実行
      if (!entryId && isDuplicateDateError(msg)) {
        try {
          // まず手元の data から同日entryを探す
          let found = findEntryByDate(data, date);

          // dataが古い/未取得なら再取得して探す
          if (!found) {
            const list = await api("/api/entries/", {
              access: accessRef.current,
              refresh: refreshRef.current,
              setAccess,
              setRefresh,
            });
            setData(list);
            found = findEntryByDate(list, date);
          }

          if (!found) {
            // ここまで来たら想定外（でも安全に案内）
            setErr(msg);
            pushToast("error", "同日データが見つからず更新できませんでした");
            return;
          }

          // ✅ ここで自動PATCH保存
          const updated = await patchById(found.id);

          // 画面も更新モードに同期（見た目/状態が一致するように）
          applyEntryToForm(updated);

          pushToast("success", "同日の記録が存在したため、自動で更新しました ✅");
          setInfo(`同日の記録が存在したため自動で更新しました（id=${updated.id}）`);

          // 一覧を更新して確定
          await loadEntries();
          return;
        } catch (e2) {
          setErr(String(e2));
          pushToast("error", "自動更新に失敗しました ❌");
          return;
        }
      }

      // 通常エラー
      setErr(msg);
      pushToast("error", "保存に失敗しました ❌");
    } finally {
      setSaving(false);
    }
  }, [bad, date, entryId, good, loadEntries, mood, next, pushToast, saving, title]);

  return (
    <div style={styles.page}>
      {/* global css */}
      <style>{`
        input, textarea, button { font: inherit; }
        input:focus, textarea:focus {
          border-color: rgba(99,102,241,0.45) !important;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.18) !important;
        }
        button:hover { filter: brightness(1.05); }
        ::placeholder { color: rgba(255,255,255,0.45); }
      `}</style>

      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.titleWrap}>
            <h1 style={styles.h1}>Daily Review</h1>
            <p style={styles.sub}>JWT + Django REST / Simple Journal</p>
          </div>

          <div
            style={{
              ...styles.badge,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.10), 0 10px 30px rgba(0,0,0,0.35), 0 0 40px ${modeChip.glow}`,
            }}
            title="現在の保存モード"
          >
            <span style={{ fontWeight: 900 }}>{modeChip.label}</span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span style={{ opacity: 0.85 }}>{modeChip.sub}</span>
          </div>
        </div>

        {!isLoggedIn ? (
          <div style={styles.card}>
            <div style={styles.cardInner}>
              <div style={{ display: "grid", gap: 12, maxWidth: 380 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={styles.label}>Username</div>
                  <input style={styles.input} placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={styles.label}>Password</div>
                  <input
                    style={styles.input}
                    placeholder="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button style={{ ...styles.btnBase, ...styles.btnPrimary }} {...withBtnFx()} onClick={() => login().catch((e) => setErr(String(e)))}>
                  Login
                </button>

                <div style={{ opacity: 0.65, fontSize: 12, lineHeight: 1.5 }}>
                  ※ トークンは localStorage に保存されます（開発用）。本番では HttpOnly Cookie を推奨。
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.grid}>
            {/* Actions */}
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <div style={styles.row}>
                  <button style={{ ...styles.btnBase, ...styles.btnPrimary }} {...withBtnFx()} onClick={() => loadEntries().catch((e) => setErr(String(e)))}>
                    Reload
                  </button>

                  <button style={{ ...styles.btnBase, ...styles.btnGhost }} {...withBtnFx()} onClick={() => resetForm(todayYMD())}>
                    今日を新規として書き直す
                  </button>

                  <div style={styles.rowRight}>
                    <button style={{ ...styles.btnBase, ...styles.btnDanger }} {...withBtnFx()} onClick={logout}>
                      Logout
                    </button>

                    <span style={{ opacity: 0.75, fontSize: 13 }}>モード: {modeLabel}</span>
                  </div>
                </div>
              </div>

              <hr style={styles.divider} />

              {/* Date Selector */}
              <div style={styles.cardInner}>
                <div style={{ ...styles.row, gap: 12 }}>
                  <button style={{ ...styles.btnBase, ...styles.btnGhost }} {...withBtnFx()} onClick={() => selectByDate(addDays(date, -1))}>
                    ← 前日
                  </button>

                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={styles.label}>表示する日付</div>
                    <input type="date" value={date} onChange={(e) => selectByDate(e.target.value)} style={{ ...styles.input, width: 220 }} />
                  </div>

                  <button style={{ ...styles.btnBase, ...styles.btnGhost }} {...withBtnFx()} onClick={() => selectByDate(addDays(date, 1))}>
                    翌日 →
                  </button>

                  <div style={styles.rowRight}>
                    <span style={styles.datePill} title="保存対象の日付">
                      {date}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={styles.field}>
                    <div style={styles.label}>タイトル</div>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} placeholder="例）今日の振り返り" />
                  </div>

                  <div style={styles.field}>
                    <div style={styles.label}>よかった</div>
                    <textarea value={good} onChange={(e) => setGood(e.target.value)} rows={4} style={styles.textarea} placeholder="例）朝から勉強できた" />
                  </div>

                  <div style={styles.field}>
                    <div style={styles.label}>よくなかった</div>
                    <textarea value={bad} onChange={(e) => setBad(e.target.value)} rows={4} style={styles.textarea} placeholder="例）夜更かしした" />
                  </div>

                  <div style={styles.field}>
                    <div style={styles.label}>次やること</div>
                    <textarea value={next} onChange={(e) => setNext(e.target.value)} rows={3} style={styles.textarea} placeholder="例）30分だけ復習" />
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={styles.label}>気分（1〜5）</div>
                      <input type="number" min={1} max={5} value={mood} onChange={(e) => setMood(Number(e.target.value))} style={{ ...styles.input, width: 120 }} />
                    </div>

                    <div style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() => save().catch((e) => setErr(String(e)))}
                        disabled={saving}
                        style={{
                          ...styles.btnBase,
                          ...styles.btnPrimary,
                          ...(saving ? styles.btnDisabled : {}),
                        }}
                        {...withBtnFx()}
                      >
                        {saving ? "保存中..." : `保存（${modeLabel}）`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info / Error */}
            {(info || err) && (
              <div style={styles.card}>
                <div style={styles.cardInner}>
                  {info && <div style={{ ...styles.alert, ...styles.alertInfo, marginBottom: err ? 10 : 0 }}>{info}</div>}
                  {err && <div style={{ ...styles.alert, ...styles.alertErr }}>{err}</div>}
                </div>
              </div>
            )}

            {/* Debug */}
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <div style={styles.debugTitle}>entries（デバッグ表示）</div>
                <pre style={styles.debug}>{JSON.stringify(data, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastArea toasts={toasts} />
    </div>
  );
}