import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { C } from "../lib/theme";
import { APPLE_IMG } from "../assets/images";
import { supabase } from "../lib/supabaseClient";

/* ================= Login Screen ================= */
export function LoginScreen({ initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("יש למלא אימייל וסיסמא"); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) { setError("אימייל או סיסמא שגויים"); }
      } else {
        const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
        if (err) { setError(err.message || "שגיאה בהרשמה"); }
      }
    } catch (e) {
      setError(e?.message || "אירעה שגיאה, נסה/י שוב");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) { setError(err.message || "שגיאה בכניסה עם Google"); setLoading(false); }
    // on success the browser redirects to Google, so no further action needed here
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Assistant',sans-serif",
      padding: "24px 20px", direction: "rtl" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <img src={APPLE_IMG} alt="" style={{ width: 80, pointerEvents: "none" }} />
        <div style={{ fontSize: 28, fontWeight: 400, color: C.ink, marginTop: 8 }}>TutorFlow</div>
        <div style={{ fontSize: 12, fontWeight: 300, color: C.sub, letterSpacing: ".5px" }}>לתכנן. ללמד. להשפיע.</div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 22,
        boxShadow: "0 8px 32px rgba(52,64,50,.12)", padding: "28px 24px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer",
            color: C.sub, fontFamily: "inherit", fontSize: 13, padding: 0, marginBottom: 16,
            display: "flex", alignItems: "center", gap: 4 }}>
            ← חזרה
          </button>
        )}

        {/* Mode tabs */}
        <div style={{ display: "flex", marginBottom: 24, background: "#f0ead8", borderRadius: 12, padding: 3 }}>
          {[["login","כניסה"], ["register","הרשמה"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px", border: "none", borderRadius: 10, cursor: "pointer",
                fontFamily: "inherit", fontSize: 14, fontWeight: 400, transition: "all .15s",
                background: mode === m ? C.card : "transparent",
                color: mode === m ? C.ink : C.sub,
                boxShadow: mode === m ? "0 2px 6px rgba(52,64,50,.1)" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={loading}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 12, padding: "11px",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 400, color: C.ink,
            marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          כניסה עם Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: C.hair }} />
          <span style={{ fontSize: 12, color: C.sub }}>או</span>
          <div style={{ flex: 1, height: 1, background: C.hair }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12.5, fontWeight: 400, color: C.sub, display: "block", marginBottom: 5 }}>אימייל</label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" dir="ltr"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.hair}`,
              background: C.cream, fontFamily: "inherit", fontSize: 14, color: C.ink, outline: "none",
              boxSizing: "border-box" }} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20, position: "relative" }}>
          <label style={{ fontSize: 12.5, fontWeight: 400, color: C.sub, display: "block", marginBottom: 5 }}>סיסמא</label>
          <input value={password} onChange={e => setPassword(e.target.value)}
            type={showPass ? "text" : "password"} placeholder="••••••••" dir="ltr"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "10px 40px 10px 12px", borderRadius: 10, border: `1px solid ${C.hair}`,
              background: C.cream, fontFamily: "inherit", fontSize: 14, color: C.ink, outline: "none",
              boxSizing: "border-box" }} />
          <button onClick={() => setShowPass(v => !v)}
            style={{ position: "absolute", left: 10, bottom: 10, background: "none", border: "none",
              cursor: "pointer", color: C.sub, padding: 2 }}>
            {showPass ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>

        {error && <div style={{ fontSize: 12.5, color: "#c04040", marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "12px", background: C.green, color: C.boardTx,
            border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
            fontSize: 15, fontWeight: 400, opacity: loading ? .7 : 1 }}>
          {loading ? "טוען..." : mode === "login" ? "כניסה" : "הרשמה"}
        </button>

        {mode === "register" && (
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
            לאחר ההרשמה ייתכן שתידרש/י לאשר את כתובת האימייל לפני הכניסה.
          </div>
        )}
      </div>
    </div>
  );
}
