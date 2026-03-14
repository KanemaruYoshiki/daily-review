export const styles = {
  page: { minHeight: "100vh", padding: "28px 16px 60px" },

  shell: {
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },

  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
  },

  cardInner: {
    padding: 16,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },

  btnBase: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    cursor: "pointer",
  },

  btnPrimary: {
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(16,185,129,0.65))",
  },

  alert: {
    padding: "12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
  },

  alertErr: {
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
  },
};