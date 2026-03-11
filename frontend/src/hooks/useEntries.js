import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchEntries, createEntry, updateEntry } from "../services/entryService";
import { todayYMD } from "../utils/date";

export function useEntries(pushToast) {
  const { access, refresh, setAccess, setRefresh, isLoggedIn } = useAuth();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

  const [entryId, setEntryId] = useState(null);
  const [date, setDate] = useState(todayYMD());
  const [title, setTitle] = useState("");
  const [good, setGood] = useState("");
  const [bad, setBad] = useState("");
  const [next, setNext] = useState("");
  const [mood, setMood] = useState(3);

  const accessRef = useRef(access);
  const refreshRef = useRef(refresh);
  useEffect(() => { accessRef.current = access; }, [access]);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  const auth = useMemo(() => ({
    access: accessRef.current,
    refresh: refreshRef.current,
    setAccess,
    setRefresh,
  }), [setAccess, setRefresh]);

  const resetForm = useCallback((ymd = todayYMD()) => {
    setEntryId(null);
    setDate(ymd);
    setTitle("");
    setGood("");
    setBad("");
    setNext("");
    setMood(3);
  }, []);

  const applyEntryToForm = useCallback((e) => {
    setEntryId(e?.id ?? null);
    setDate(e?.date ?? todayYMD());
    setTitle(e?.title ?? "");
    setGood(e?.good ?? "");
    setBad(e?.bad ?? "");
    setNext(e?.next ?? "");
    setMood(e?.mood ?? 3);
  }, []);

  const selectByDate = useCallback((ymd) => {
    if (!ymd) return;
    if (!Array.isArray(data)) {
      setEntryId(null);
      setDate(ymd);
      return;
    }
    const found = data.find((e) => e.date === ymd);
    if (found) {
      applyEntryToForm(found);
      setInfo(`${ymd}の記録を読み込みました（更新モード）`);
    } else {
      resetForm(ymd);
      setInfo(`${ymd}は未作成です（新規作成モード）`);
    }
  }, [applyEntryToForm, data, resetForm]);

  const loadEntries = useCallback(async () => {
      setErr("");
      setInfo("");
      const list = await fetchEntries(auth);
      setData(list);
      const ymd = todayYMD();
      const todayEntry = Array.isArray(list) ? list.find((e) => e.date === ymd) : null;
      if (todayEntry) {
        applyEntryToForm(todayEntry);
        setInfo("今日の記録を読み込みました（更新モード）");
      } else {
        resetForm(ymd);
        setInfo("今日の記録が無いので新規作成モードです");
      }
    }, [auth, applyEntryToForm, resetForm]);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadEntries().catch((e) => setErr(String(e)));
  }, [isLoggedIn, loadEntries]);

  const save = useCallback(async () => {
    if (!date || saving) return;
    setErr("");
    setInfo("");

    try {
      setSaving(true);
      const payload = { date, title, good, bad, next, mood };

      if (entryId) {
        const updated = await updateEntry(auth, entryId, payload);
        setInfo(`更新しました（id=${updated.id}）`);
        pushToast?.("success", "更新しました ✅");
      } else {
        const created = await createEntry(auth, payload);
        setInfo(`作成しました（id=${created.id}）`);
        pushToast?.("success", "作成しました ✅");
      }

      await loadEntries();
    } catch (e) {
      setErr(String(e));
      pushToast?.("error", "保存に失敗しました ❌");
    } finally {
      setSaving(false);
    }
  }, [auth, date, title, good, bad, next, mood, entryId, loadEntries, pushToast, saving]);

  const entryDateSet = useMemo(() => {
    if (!Array.isArray(data)) return new Set();
    return new Set(data.map((e) => e.date));
  }, [data]);

  return {
    data,
    err,
    info,
    saving,
    entryId,
    date,
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
    setErr,
    selectByDate,
    save,
    loadEntries,
    entryDateSet,
  };
}