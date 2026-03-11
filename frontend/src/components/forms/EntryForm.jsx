import { Rating } from "react-simple-star-rating";

export default function EntryForm({
  styles,
  withBtnFx,
  title,
  good,
  bad,
  next,
  mood,
  setTitle,
  setGood,
  setBad,
  setNext,
  setMood,
  save,
  saving,
  modeLabel,
}) {
  return (
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
              <div style={styles.starWrap}>
                <Rating
                  initialValue={mood}
                  allowFraction={false}
                  transition
                  size={32}
                  onClick={(value) => setMood(value)}
                  SVGstyle={{ display: "inline-block" }}
                />
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>現在の気分: {mood} / 5</div>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => save().catch?.(() => {})}
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
  );
}