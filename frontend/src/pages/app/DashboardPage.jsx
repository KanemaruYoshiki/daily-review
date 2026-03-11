import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEntries } from "../../hooks/useEntries";
import { useToasts } from "../../hooks/useToasts";
import LoginCard from "../../components/auth/LoginCard";
import ReviewCalendar from "../../components/calendar/ReviewCalendar";
import EntryForm from "../../components/forms/EntryForm";
import { addDays } from "../../utils/date";
import { styles, withBtnFx } from "../../styles/appStyles"

export default function DashboardPage() {
  const {
    data, err, info, saving, entryId, date,
    title, good, bad, next, mood,
    setTitle, setGood, setBad, setNext, setMood,
    setErr, selectByDate, save, entryDateSet,
  } = useEntries(pushToast);

  const modeLabel = useMemo(() => (entryId ? "更新 (PATCH)" : "新規 (POST)"), [entryId]);

  if (!isLoggedIn) {
    return <LoginCard styles={styles} withBtnFx={withBtnFx} onError={setErr} />;
  }

  return (
    <div style={styles.grid}>
      <div style={styles.cardInner}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={styles.row}>
            <button style={{ ...styles.btnBase, ...styles.btnGhost }} {...withBtnFx()} onClick={() => selectByDate(addDays(date, -1))}>
              ← 前日
            </button>
            <button style={{ ...styles.btnBase, ...styles.btnGhost }} {...withBtnFx()} onClick={() => selectByDate(addDays(date, 1))}>
              翌日 →
            </button>
            <div style={styles.rowRight}>
              <span style={styles.datePill}>{date}</span>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={styles.label}>表示する日付</div>
            <ReviewCalendar date={date} entryDateSet={entryDateSet} selectByDate={selectByDate} styles={styles} />
          </div>
        </div>
      </div>

      <EntryForm
        styles={styles}
        withBtnFx={withBtnFx}
        title={title}
        good={good}
        bad={bad}
        next={next}
        mood={mood}
        setTitle={setTitle}
        setGood={setGood}
        setBad={setBad}
        setNext={setNext}
        setMood={setMood}
        save={save}
        saving={saving}
        modeLabel={modeLabel}
      />

      {(info || err) && (
        <div style={styles.card}>
          <div style={styles.cardInner}>
            {info && <div style={{ ...styles.alert, ...styles.alertInfo, marginBottom: err ? 10 : 0 }}>{info}</div>}
            {err && <div style={{ ...styles.alert, ...styles.alertErr }}>{err}</div>}
          </div>
        </div>
      )}

      {import.meta.env.DEV && (
        <div style={styles.card}>
          <div style={styles.cardInner}>
            <div style={styles.debugTitle}>entries（デバッグ表示）</div>
            <pre style={styles.debug}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}