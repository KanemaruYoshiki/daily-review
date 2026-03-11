import { Link } from "react-router-dom";

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
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gap: 28,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  brand: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
  },
  navLinks: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  hero: {
    display: "grid",
    gap: 20,
    padding: "36px 0 12px",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(36px, 7vw, 64px)",
    lineHeight: 1.05,
    letterSpacing: "-0.05em",
    maxWidth: 760,
  },
  heroText: {
    margin: 0,
    fontSize: 18,
    opacity: 0.8,
    lineHeight: 1.7,
    maxWidth: 720,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
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
  },
  btnPrimary: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(16,185,129,0.65))",
    boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
  },
  btnGhost: {
    background: "rgba(255,255,255,0.06)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.28)",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: 18,
    fontWeight: 800,
  },
  cardText: {
    margin: 0,
    opacity: 0.8,
    lineHeight: 1.6,
    fontSize: 14,
  },
  sectionTitle: {
    margin: "12px 0 8px",
    fontSize: 28,
    letterSpacing: "-0.03em",
  },
  sectionText: {
    margin: "0 0 16px",
    opacity: 0.78,
    lineHeight: 1.7,
  },
};

export default function LandingPage() {
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <nav style={styles.nav}>
          <h1 style={styles.brand}>Daily Review</h1>
          <div style={styles.navLinks}>
            <Link to="/pricing" style={{ ...styles.btn, ...styles.btnGhost }}>
              料金
            </Link>
            <Link to="/signup" style={{ ...styles.btn, ...styles.btnPrimary }}>
              無料登録
            </Link>

          </div>
        </nav>

        <section style={styles.hero}>
          <h2 style={styles.heroTitle}>
            毎日の学習と振り返りを、
            <br />
            1分で記録するSaaS
          </h2>
          <p style={styles.heroText}>
            Daily Review は、学習・開発・習慣の記録をカレンダーで見える化し、
            継続しやすくするための振り返りアプリです。
          </p>

          <div style={styles.buttonRow}>
            <Link to="/signup" style={{ ...styles.btn, ...styles.btnPrimary }}>
              無料で始める
            </Link>
            <Link to="/pricing" style={{ ...styles.btn, ...styles.btnGhost }}>
              料金を見る
            </Link>
          </div>
        </section>

        <section>
          <h3 style={styles.sectionTitle}>できること</h3>
          <p style={styles.sectionText}>
            まずはシンプルな日次記録とカレンダー可視化から始め、将来的に週次レビューや分析機能へ広げていく構成です。
          </p>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>毎日の記録</h4>
              <p style={styles.cardText}>
                その日の良かったこと、良くなかったこと、次やること、気分を簡単に残せます。
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>カレンダー可視化</h4>
              <p style={styles.cardText}>
                記録した日がひと目で分かるので、努力の積み上がりを実感しやすくなります。
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>継続支援</h4>
              <p style={styles.cardText}>
                学習や開発を続けたい人向けに、日々の行動を振り返る土台を作れます。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}