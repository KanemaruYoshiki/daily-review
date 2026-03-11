import Calendar from "react-calendar";
import { dateToYMD, todayYMD, ymdToDate } from "../../utils/date";

export default function ReviewCalendar({ date, entryDateSet, selectByDate, styles }) {
  return (
    <div style={styles.calendarWrap}>
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            selectByDate(dateToYMD(value));
          }
        }}
        value={ymdToDate(date)}
        locale="ja-JP"
        calendarType="gregory"
        prev2Label={null}
        next2Label={null}
        tileClassName={({ date: tileDate, view }) => {
          if (view !== "month") return null;
          return dateToYMD(tileDate) === todayYMD() ? "calendar-today" : null;
        }}
        tileContent={({ date: tileDate, view }) => {
          if (view !== "month") return null;
          const ymd = dateToYMD(tileDate);
          if (!entryDateSet.has(ymd)) return null;
          return (
            <div style={{ marginTop: 2, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.95)",
                  boxShadow: "0 0 6px rgba(16,185,129,0.75)",
                }}
              />
            </div>
          );
        }}
      />
    </div>
  );
}