import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

// localStorage keys
const LS_ACCESS = "dailyReviewAccess";
const LS_REFRESH = "dailyReviewRefresh";

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function safeJsonOrText(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
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

  // 1st try with current access
  let res = await doFetch(access);
  if (res.status !== 401) {
    const data = await safeJsonOrText(res);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)}`);
    return data;
  }

  // 401: try refresh once (only if refresh exists)
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
    // refreshも無効ならログアウト扱いが安全
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
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${typeof data2 === "string" ? data2.slice(0, 200) : JSON.stringify(data2)}`);
  return data2;
}

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [access, setAccess] = useState("");
  const [refresh, setRefresh] = useState("");

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [entryId, setEntryId] = useState(null);

  // フォーム
  const [date, setDate] = useState(todayYMD());
  const [title, setTitle] = useState("");
  const [good, setGood] = useState("");
  const [bad, setBad] = useState("");
  const [next, setNext] = useState("");
  const [mood, setMood] = useState(3);

  const isLoggedIn = !!access;

  // 最新トークン参照（コールバックの古い値問題を避ける）
  const accessRef = useRef(access);
  const refreshRef = useRef(refresh);
  useEffect(() => { accessRef.current = access; }, [access]);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  const resetForm = (ymd = todayYMD()) => {
    setEntryId(null);
    setDate(ymd);
    setTitle("");
    setGood("");
    setBad("");
    setNext("");
    setMood(3);
  };

  const selectByDate = (ymd) => {
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
      // その日付の記録がない　-> 新規
      if (entryId === null && date === ymd) return;

      resetForm(ymd);
      setInfo(`${ymd}は未作成です（新規作成モード）`);
    }
  };

  const applyEntryToForm = (e) => {
    setEntryId(e?.id ?? null);
    setDate(e?.date ?? todayYMD());
    setTitle(e?.title ?? "");
    setGood(e?.good ?? "");
    setBad(e?.bad ?? "");
    setNext(e?.next ?? "");
    setMood(e?.mood ?? 3);
  };

  const logout = () => {
    setAccess("");
    setRefresh("");
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    setInfo("ログアウトしました");
  };

  const login = async () => {
    setErr("");
    setInfo("");
    const res = await fetch(`${API_BASE}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const tok = await safeJsonOrText(res);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${typeof tok === "string" ? tok.slice(0, 200) : JSON.stringify(tok)}`);
    }

    setAccess(tok.access);
    setRefresh(tok.refresh);

    // ★ localStorage に保存（ログイン維持）
    localStorage.setItem(LS_ACCESS, tok.access);
    localStorage.setItem(LS_REFRESH, tok.refresh);

    setInfo("ログイン成功（トークン保存済み）");
  };

  const loadEntries = async () => {
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
    // （作成/更新後に日付に紐づくentryIdがズレないように）
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
  };

  // ★ 起動時に localStorage から復元（ログイン維持）
  useEffect(() => {
    const savedAccess = localStorage.getItem(LS_ACCESS) || "";
    const savedRefresh = localStorage.getItem(LS_REFRESH) || "";
    if (savedAccess && savedRefresh) {
      setAccess(savedAccess);
      setRefresh(savedRefresh);
      setInfo("保存済みトークンで復帰しました");
    }
  }, []);

  // ログイン（accessが入った）後に自動ロード
  useEffect(() => {
    if (!access) return;
    loadEntries().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const save = async () => {
    setErr("");
    setInfo("");
    if (!date) throw new Error("date が空です");

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
    }

    await loadEntries();
  };

  const modeLabel = useMemo(() => (entryId ? "更新 (PATCH)" : "新規 (POST)"), [entryId]);

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h1>Daily Review (JWT)</h1>

      {!isLoggedIn ? (
        <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
          <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => login().catch((e) => setErr(String(e)))}>Login</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => loadEntries().catch((e) => setErr(String(e)))}>Reload</button>
            <button onClick={() => resetForm(todayYMD())}>今日を新規として書き直す</button>
            <button onClick={logout}>Logout</button>
            <span style={{ opacity: 0.8 }}>モード: {modeLabel}</span>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <div style={{ display: "grid", gap: 8 }}>
            <label>
              表示する日付
              <input
                type="date"
                value={date}
                onChange={(e) => selectByDate(e.target.value)}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <label>
              日付（YYYY-MM-DD）
              <input
                value={date}
                readOnly
                style={{ display: "block", width: "100%", background: "#f5f5f5" }}
              />
            </label>

            <label>
              タイトル
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ display: "block", width: "100%" }} />
            </label>

            <label>
              よかった
              <textarea value={good} onChange={(e) => setGood(e.target.value)} rows={4} style={{ display: "block", width: "100%" }} />
            </label>

            <label>
              よくなかった
              <textarea value={bad} onChange={(e) => setBad(e.target.value)} rows={4} style={{ display: "block", width: "100%" }} />
            </label>

            <label>
              次やること
              <textarea value={next} onChange={(e) => setNext(e.target.value)} rows={3} style={{ display: "block", width: "100%" }} />
            </label>

            <label>
              気分（1〜5）
              <input type="number" min={1} max={5} value={mood} onChange={(e) => setMood(Number(e.target.value))} style={{ display: "block", width: 120 }} />
            </label>

            <button onClick={() => save().catch((e) => setErr(String(e)))}>
              保存（{modeLabel}）
            </button>
          </div>
        </>
      )}

      {info && <pre style={{ marginTop: 12 }}>{info}</pre>}
      {err && <pre style={{ marginTop: 12, color: "crimson" }}>{err}</pre>}

      <h3 style={{ marginTop: 16 }}>entries（デバッグ表示）</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}