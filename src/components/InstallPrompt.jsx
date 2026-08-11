import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";
import { C, STROKE } from "../lib/theme";

const DISMISS_KEY = "tf_install_prompt_dismissed";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      setVisible(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setShowIOSHelp(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (isIOS()) { setShowIOSHelp(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 398, zIndex: 70,
      background: C.card, border: `1px solid ${C.hair}`, borderRadius: 16,
      boxShadow: "0 8px 28px rgba(38,37,31,.18)", padding: "14px 16px",
      fontFamily: "'Assistant',sans-serif", direction: "rtl" }}>
      {!showIOSHelp ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: C.ink, marginBottom: 2 }}>התקיני את TutorFlow</div>
            <div style={{ fontSize: 12.5, fontWeight: 300, color: C.sub }}>הוסיפי קיצור דרך למסך הבית לגישה מהירה</div>
          </div>
          <button onClick={install}
            style={{ background: C.green, color: C.boardTx, border: "none", borderRadius: 10,
              padding: "8px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit", whiteSpace: "nowrap" }}>
            התקנה
          </button>
          <button onClick={dismiss} title="סגירה"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 4, flexShrink: 0 }}>
            <X size={16} strokeWidth={STROKE} />
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: C.ink }}>הוספה למסך הבית</div>
            <button onClick={dismiss} title="סגירה"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 4 }}>
              <X size={16} strokeWidth={STROKE} />
            </button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 300, color: C.ink, lineHeight: 1.8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Share size={16} strokeWidth={STROKE} style={{ color: C.sub, flexShrink: 0 }} />
              <span>לחצי על כפתור השיתוף בדפדפן</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PlusSquare size={16} strokeWidth={STROKE} style={{ color: C.sub, flexShrink: 0 }} />
              <span>ואז על "הוסף למסך הבית"</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
