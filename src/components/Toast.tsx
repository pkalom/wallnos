import type { ToastItem } from "../hooks/useToast";
import type { CSSProperties } from "react";

export default function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  return (
    <div style={container}>
      {toasts.map(t => (
        <div key={t.id} style={toast}>
          <span style={icon}>{t.icon}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

const container: CSSProperties = {
  position: "fixed",
  bottom: 28,
  right: 24,
  zIndex: 4000,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  pointerEvents: "none",
};

const toast: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 18px",
  borderRadius: 14,
  background: "rgba(20,20,20,0.92)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(139,92,246,0.15)",
  animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
  whiteSpace: "nowrap",
};

const icon: CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
};
