import { useState, useCallback } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((type, message, ms = 2500) => {
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now() + Math.random());

    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ms);
  }, []);

  return {
    toasts,
    pushToast,
  };
}