import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function todayYMD() {
  // ローカル日付で YYYY-MM-DD
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function api(path, { token, method = "GET", body } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token.trim()}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status}: ${
        typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)
      }`
    );
  }
  return data;
}

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [access, setAccess] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // 今日のエントリID（あればPATCH、なければPOST）
  const [entryId, setEntryId] = useState(null);

  // フォーム
  const [date, setDate] = useState(todayYMD());
  const [title, setTitle] = useState("");
  const [good, setGood] = useState("");
  const [bad, setBad] = useState("");
  const [next, setNext] = useState("");
  const [mood, setMood] = useState(3);

  const isLoggedIn = !!access;

  const resetForm = (ymd = todayYMD()) => {
    setEntryId(null);
    setDate(ymd);
    setTitle("");
    setGood("");
    setBad("");
    setNext("");
    setMood(3);
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

  const login = async () => {
    setErr("");
    setInfo("");
    const tok = await api("/api/token/", {
      method: "POST",
      body: { username, password },
    });
    setAccess(tok.access);
    setInfo("ログイン成功");
  };

  const loadEntries = async () => {
    setErr("");
    setInfo("");
    const list = await api("/api/entries/", { token: access });
    setData(list);

    // 今日の分を探してフォームに反映（無ければ空フォーム）
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

  // ログイン後に自動で読み込み
  useEffect(() => {
    if (!access) return;
    loadEntries().catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const save = async () => {
    setErr("");
    setInfo("");

    // 入力チェック（最低限）
    if (!date) throw new Error("date が空です");

    if (entryId) {
      // PATCH（今日の分を更新）
      const updated = await api(`/api/entries/${entryId}/`, {
        token: access,
        method: "PATCH",
        body: { title, good, bad, next, mood, date },
      });
      setInfo(`更新しました（id=${updated.id}）`);
    } else {
      // POST（今日の分を作成）
      const created = await api("/api/entries/", {
        token: access,
        method: "POST",
        body: { date, title, good, bad, next, mood },
      });
      setInfo(`作成しました（id=${created.id}）`);
    }

    // 再取得してフォーム状態も同期
    await loadEntries();
  };

  const modeLabel = useMemo(() => (entryId ? "更新 (PATCH)" : "新規 (POST)"), [entryId]);

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h1>Daily Review (JWT)</h1>

      {!isLoggedIn ? (
        <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
          <input
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => login().catch((e) => setErr(String(e)))}>Login</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => loadEntries().catch((e) => setErr(String(e)))}>
              Reload
            </button>
            <button onClick={() => resetForm(todayYMD())}>今日を新規として書き直す</button>
            <span style={{ opacity: 0.8 }}>モード: {modeLabel}</span>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <div style={{ display: "grid", gap: 8 }}>
            <label>
              日付（YYYY-MM-DD）
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <label>
              タイトル
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <label>
              よかった
              <textarea
                value={good}
                onChange={(e) => setGood(e.target.value)}
                rows={4}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <label>
              よくなかった
              <textarea
                value={bad}
                onChange={(e) => setBad(e.target.value)}
                rows={4}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <label>
              次やること
              <textarea
                value={next}
                onChange={(e) => setNext(e.target.value)}
                rows={3}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <label>
              気分（1〜5）
              <input
                type="number"
                min={1}
                max={5}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                style={{ display: "block", width: 120 }}
              />
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