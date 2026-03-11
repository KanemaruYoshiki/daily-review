import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px 80px",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.35), transparent 60%)," +
      "radial-gradient(900px 500px at 85% 20%, rgba(16,185,129,0.20), transparent 55%)," +
      "radial-gradient(900px 500px at 70% 85%, rgba(236,72,153,0.18), transparent 55%)," +
      "linear-gradient(180deg, #0b1020, #070a14)",
    color: "rgba(255,255,255,0.92)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif',
  },
  shell: {
    maxWidth: 520,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  card: {
    borderRadius: 22,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.28)",
    display: "grid",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 42px)",
    letterSpacing: "-0.04em",
  },
  sub: {
    margin: 0,
    opacity: 0.78,
    lineHeight: 1.7,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.86,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10,14,30,0.55)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.16)",
    color: "white",
    cursor: "pointer",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(16,185,129,0.65))",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.06)",
  },
  row: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  message: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
  },
  error: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.28)",
    color: "rgba(255,220,220,0.95)",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/app";

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");

    if (!username.trim()) {
      setErr("ユーザー名を入力してください。");
      return;
    }

    if (!password) {
      setErr("パスワードを入力してください。");
      return;
    }

    try {
      setLoading(true);
      await login({ username, password });
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.card}>
          <div style={{ display: "grid", gap: 8 }}>
            <h1 style={styles.title}>ログイン</h1>
            <p style={styles.sub}>
              Daily Review にログインして、日々の記録を続けましょう。
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 14 }}>
            <div style={styles.field}>
              <label style={styles.label}>ユーザー名</label>
              <input
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例: takumi"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>パスワード</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
              />
            </div>

            {err && <div style={{ ...styles.message, ...styles.error }}>{err}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div style={styles.row}>
            <Link to="/" style={{ ...styles.btn, ...styles.btnGhost }}>
              LPへ戻る
            </Link>
            <Link to="/signup" style={{ ...styles.btn, ...styles.btnGhost }}>
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}