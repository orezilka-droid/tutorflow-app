import { C } from "../lib/theme";
import { LOGO_IMG } from "../assets/images";

/* ================= Splash Screen ================= */
export function SplashScreen({ onLogin, onRegister }) {
  return (
    <div style={{ minHeight: "100vh", background: "#efe7e1", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Assistant',sans-serif",
      padding: "32px 28px", direction: "rtl" }}>
      <img src={LOGO_IMG} alt="TutorFlow" style={{ width: "85%", maxWidth: 340, pointerEvents: "none", marginBottom: 24 }} />
      <div style={{ fontSize: 32, fontWeight: 400, color: C.ink, letterSpacing: ".5px", marginBottom: 6 }}>TutorFlow</div>
      <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, marginBottom: 48, letterSpacing: ".3px" }}>לתכנן. ללמד. להשפיע.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
        <button onClick={onRegister}
          style={{ width: "100%", padding: "14px", background: "#35493e", color: "#f5ece4",
            border: "none", borderRadius: 14, cursor: "pointer",
            fontFamily: "'Assistant',sans-serif",
            fontSize: 17, fontWeight: 400, letterSpacing: ".3px" }}>
          הרשמה
        </button>
        <button onClick={onLogin}
          style={{ width: "100%", padding: "14px", background: "transparent", color: "#35493e",
            border: "1.5px solid #c8b89a", borderRadius: 14, cursor: "pointer",
            fontFamily: "'Assistant',sans-serif",
            fontSize: 17, fontWeight: 400, letterSpacing: ".3px" }}>
          התחברות
        </button>
      </div>
    </div>
  );
}
