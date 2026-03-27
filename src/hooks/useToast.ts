import { useState, useCallback } from "react";

export interface ToastItem {
  id: number;
  message: string;
  icon: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, icon = "✓") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2600);
  }, []);

  return { toasts, showToast };
}
