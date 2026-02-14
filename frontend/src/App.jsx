import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/entries/", { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Daily Review</h1>
      {err && <pre>{err}</pre>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
