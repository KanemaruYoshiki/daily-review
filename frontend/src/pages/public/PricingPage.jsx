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
    gap: 24,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "clamp(32px, 6vw, 52px)",
    letterSpacing: "-0.05em",
  },
  sub: {
    margin: 0,
    opacity: 0.8,
    lineHeight: 1.7,
    maxWidth: 720,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
    marginTop: 8,
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
  planName: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  price: {
    margin: 0,
    fontSize: 36,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  priceSub: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: 500,
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    lineHeight: 1.9,
    opacity: 0.9,
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
  },
  btnGhost: {
    background: "rgba(255,255,255,0.06)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(16,185,129,0.18)",
    border: "1px solid rgba(16,185,129,0.32)",
    fontSize: 12,
    fontWeight: 800,
  },
};

export default function PricingPage() {
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.title}>料金プラン</h1>
            <p style={styles.sub}>
              まずは無料で始めて、継続的に使う人向けに分析やレビュー機能を拡張する形を想定しています。
            </p>
          </div>

          <div style={styles.buttonRow}>
            <Link to="/" style={{ ...styles.btn, ...styles.btnGhost }}>
              LPに戻る
            </Link>
            <Link to="/app" style={{ ...styles.btn, ...styles.btnPrimary }}>
              アプリを開く
            </Link>
          </div>
        </div>

        <div style={styles.grid}>
          <section style={styles.card}>
            <div>
              <h2 style={styles.planName}>Free</h2>
              <p style={styles.price}>
                ¥0 <span style={styles.priceSub}>/ 月</span>
              </p>
            </div>

            <ul style={styles.list}>
              <li>日次記録の作成</li>
              <li>カレンダーで記録確認</li>
              <li>基本的な振り返り利用</li>
              <li>まず試したい人向け</li>
            </ul>

            <Link to="/app" style={{ ...styles.btn, ...styles.btnGhost }}>
              無料で始める
            </Link>
          </section>

          <section
            style={{
              ...styles.card,
              border: "1px solid rgba(99,102,241,0.36)",
              boxShadow: "0 12px 35px rgba(0,0,0,0.28), 0 0 28px rgba(99,102,241,0.18)",
            }}
          >
            <span style={styles.badge}>おすすめ</span>

            <div>
              <h2 style={styles.planName}>Pro</h2>
              <p style={styles.price}>
                ¥980 <span style={styles.priceSub}>/ 月</span>
              </p>
            </div>

            <ul style={styles.list}>
              <li>過去全履歴の閲覧</li>
              <li>週次レビュー</li>
              <li>月次レビュー</li>
              <li>CSV出力</li>
              <li>将来的なAI振り返りコメント</li>
            </ul>

            <Link to="/app" style={{ ...styles.btn, ...styles.btnPrimary }}>
              Proを試す
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}