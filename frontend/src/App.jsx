import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

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
    throw new Error(`HTTP ${res.status}: ${typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)}`);
  }
  return data;
}

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [access, setAccess] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const login = async () => {
    setErr("");
    const tok = await api("/api/token/", {
      method: "POST",
      body: { username, password },
    });
    setAccess(tok.access);
  };

  const load = async () => {
    setErr("");
    const d = await api("/api/entries/", { token: access });
    setData(d);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Daily Review (JWT)</h1>

      {!access ? (
        <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
          <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => login().catch((e) => setErr(String(e)))}>Login</button>
        </div>
      ) : (
        <button onClick={() => load().catch((e) => setErr(String(e)))}>GET /api/entries/</button>
      )}

      {err && <pre style={{ marginTop: 12 }}>{err}</pre>}
      <pre style={{ marginTop: 12 }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
