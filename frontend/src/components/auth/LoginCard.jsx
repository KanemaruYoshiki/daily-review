import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginCard({ styles, withBtnFx, onError }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
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

          <button
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
            {...withBtnFx()}
            onClick={() => login({ username, password }).catch((e) => onError?.(String(e)))}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}