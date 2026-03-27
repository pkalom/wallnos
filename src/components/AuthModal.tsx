import { useState, useEffect } from "react";
import { X, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Props {
  onClose: () => void;
}

type Mode = "login" | "signup" | "forgot";

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const reset = () => { setError(""); setSuccess(""); };

  useEffect(() => {
    if (!loggedIn) return;
    const t = setTimeout(() => onClose(), 1400);
    return () => clearTimeout(t);
  }, [loggedIn, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccess("Check your email for a reset link.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setLoggedIn(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    reset();
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  if (loggedIn) return (
    <div style={overlay}>
      <div style={{ ...modal, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "48px 28px" }}>
        <div style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <CheckCircle size={64} color="#4ade80" strokeWidth={1.5} />
        </div>
        <p style={{ ...title, animation: "slideUp 0.4s ease 0.15s both" }}>Welcome back!</p>
        <p style={{ ...subtitle, animation: "slideUp 0.4s ease 0.25s both" }}>Signing you in…</p>
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button style={closeBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={logoGradient}>W</div>
          <h2 style={title}>
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h2>
          <p style={subtitle}>
            {mode === "login" ? "Sign in to your WallNos account" :
             mode === "signup" ? "Join WallNos for free" :
             "We'll send you a reset link"}
          </p>
        </div>

        {/* Google OAuth */}
        {mode !== "forgot" && (
          <>
            <button style={googleBtn} onClick={handleGoogle} type="button">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.84v2.07A8 8 0 0 0 8.98 17Z"/>
                <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.84A8 8 0 0 0 .98 9c0 1.29.31 2.51.86 3.59l2.67-2.07Z"/>
                <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.84 5.4L4.51 7.48c.63-1.89 2.39-3.9 4.47-3.9Z"/>
              </svg>
              Continue with Google
            </button>
            <div style={divider}><span style={dividerText}>or</span></div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={inputWrap}>
            <Mail size={16} style={inputIcon} />
            <input
              style={input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {mode !== "forgot" && (
            <div style={inputWrap}>
              <Lock size={16} style={inputIcon} />
              <input
                style={{ ...input, paddingRight: 40 }}
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                style={eyeBtn}
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}

          {error && <p style={errorMsg}>{error}</p>}
          {success && <p style={successMsg}>{success}</p>}

          <button style={submitBtn} type="submit" disabled={loading}>
            {loading
              ? <Loader2 size={17} style={{ animation: "spin 0.7s linear infinite" }} />
              : mode === "login" ? "Sign in"
              : mode === "signup" ? "Create account"
              : "Send reset link"}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#888" }}>
          {mode === "login" && (
            <>
              <button style={linkBtn} onClick={() => { setMode("forgot"); reset(); }}>Forgot password?</button>
              <span style={{ margin: "0 8px" }}>·</span>
              <button style={linkBtn} onClick={() => { setMode("signup"); reset(); }}>Create account</button>
            </>
          )}
          {mode === "signup" && (
            <button style={linkBtn} onClick={() => { setMode("login"); reset(); }}>Already have an account? Sign in</button>
          )}
          {mode === "forgot" && (
            <button style={linkBtn} onClick={() => { setMode("login"); reset(); }}>Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  backdropFilter: "blur(8px)",
  animation: "fadeIn 0.2s ease",
};

const modal: React.CSSProperties = {
  position: "relative",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 24,
  padding: "32px 28px",
  width: "min(420px, 100%)",
  boxShadow: "0 8px 32px rgba(139,92,246,0.12), 0 40px 80px rgba(0,0,0,0.45)",
  animation: "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: "var(--bg-search)",
  border: "1px solid var(--border-ui)",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoGradient: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  color: "#fff",
  fontSize: 22,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 12px",
};

const title: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "var(--text)",
  margin: "0 0 4px",
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-muted)",
  margin: 0,
};

const googleBtn: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 16px",
  border: "1.5px solid var(--border-ui)",
  borderRadius: 10,
  background: "var(--bg-search)",
  color: "var(--text)",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  marginBottom: 16,
};

const divider: React.CSSProperties = {
  position: "relative",
  textAlign: "center",
  marginBottom: 16,
};

const dividerText: React.CSSProperties = {
  background: "var(--bg)",
  padding: "0 10px",
  fontSize: 12,
  color: "var(--text-muted)",
  position: "relative",
  zIndex: 1,
};

const inputWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon: React.CSSProperties = {
  position: "absolute",
  left: 12,
  color: "var(--text-muted)",
  pointerEvents: "none",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px 11px 38px",
  border: "1.5px solid var(--border-ui)",
  borderRadius: 10,
  background: "var(--bg-search)",
  color: "var(--text)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
};

const eyeBtn: React.CSSProperties = {
  position: "absolute",
  right: 10,
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  padding: 4,
};

const submitBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 4,
};

const errorMsg: React.CSSProperties = {
  fontSize: 13,
  color: "#ef4444",
  background: "#2a0a0a",
  border: "1px solid #5a1a1a",
  borderRadius: 8,
  padding: "8px 12px",
  margin: 0,
};

const successMsg: React.CSSProperties = {
  fontSize: 13,
  color: "#4ade80",
  background: "#0a1f0a",
  border: "1px solid #1a3a1a",
  borderRadius: 8,
  padding: "8px 12px",
  margin: 0,
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#8b5cf6",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "inherit",
  padding: 0,
};
