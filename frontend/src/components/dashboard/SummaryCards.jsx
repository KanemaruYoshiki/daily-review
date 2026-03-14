export default function SummaryCards({ summary, loading, error, styles }) {
  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.cardInner}>サマリーを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.card}>
        <div style={styles.cardInner}>
          <div style={{ ...styles.alert, ...styles.alertErr }}>
            サマリーの取得に失敗しました
            <br />
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const items = [
    {
      label: "継続日数",
      value: `${summary.current_streak}日`,
    },
    {
      label: "今週の記録回数",
      value: `${summary.entries_this_week}回`,
    },
    {
      label: "今月の記録回数",
      value: `${summary.entries_this_month}回`,
    },
    {
      label: "今週の平均気分",
      value:
        summary.average_mood_this_week !== null
          ? `${summary.average_mood_this_week} / 5`
          : "-",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={styles.card}>
          <div style={styles.cardInner}>
            <div style={{ fontSize: 13, opacity: 0.72, marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}