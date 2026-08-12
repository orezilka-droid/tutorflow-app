import { useState } from "react";
import { C } from "../lib/theme";
import { Sheet } from "../components/Small";

/* ================= Add student modal =================
   Note: the `location` field was removed — the live `students` table has
   no `location` column, so it's dropped from the form entirely (grid
   reflows naturally with 5 fields instead of 6). */
const contactsSupported = typeof navigator !== "undefined" && navigator.contacts && navigator.contacts.select;

export function AddStudent({ onClose, onSubmit }) {
  const [f, setF] = useState({ name: "", phone: "", grade: "", subject: "", hourlyRate: "", notes: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const phoneOk = /^0[5-9]\d{8}$/.test(f.phone.replace(/[-\s]/g, ""));
  const valid = f.name.trim() && phoneOk && f.subject.trim() && Number(f.hourlyRate) > 0;

  const pickContact = async () => {
    try {
      const [contact] = await navigator.contacts.select(["name", "tel"], { multiple: false });
      if (!contact) return;
      const name = contact.name?.[0] || "";
      const phone = (contact.tel?.[0] || "").replace(/[^\d+]/g, "").replace(/^\+972/, "0");
      setF((p) => ({ ...p, name: name || p.name, phone: phone || p.phone }));
    } catch (e) {
      // user cancelled the picker, or it's unsupported — nothing to do
    }
  };

  return (
    <Sheet title="תלמיד/ה חדש/ה" onClose={onClose}>
      {contactsSupported && (
        <button onClick={pickContact} className="tf-ghost" style={{ width: "100%", marginBottom: 12 }}>
          בחירה מאנשי קשר
        </button>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label className="tf-label">שם מלא *</label>
          <input className="tf-input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="למשל: נועה לוי" />
        </div>
        <div>
          <label className="tf-label">טלפון *</label>
          <input className="tf-input" dir="ltr" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05X-XXXXXXX" />
          {f.phone.trim() && !/^0[5-9]\d{8}$/.test(f.phone.replace(/[-\s]/g,"")) && (
            <div style={{ fontSize: 11.5, color: "#c04040", marginTop: 3 }}>מספר טלפון לא תקין (10 ספרות, מתחיל ב-05)</div>
          )}
        </div>
        <div>
          <label className="tf-label">כיתה</label>
          <input className="tf-input" value={f.grade} onChange={(e) => set("grade", e.target.value)} placeholder="למשל: י״א" />
        </div>
        <div>
          <label className="tf-label">מקצוע *</label>
          <input className="tf-input" value={f.subject} onChange={(e) => set("subject", e.target.value)} placeholder="למשל: מתמטיקה" />
        </div>
        <div>
          <label className="tf-label">תעריף לשעה (₪) *</label>
          <input className="tf-input" type="number" min="0" value={f.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} placeholder="180" />
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <label className="tf-label">הערות</label>
        <textarea className="tf-input" rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="רקע, דגשים, העדפות…" />
      </div>
      <button disabled={!valid} onClick={() => onSubmit(f)}
        style={{ width: "100%", marginTop: 14, background: valid ? C.green : "#d9d2bf", color: C.boardTx, border: "none", borderRadius: 12, padding: 12, fontSize: 15, fontWeight: 400, fontFamily: "inherit", cursor: valid ? "pointer" : "default" }}>
        הוספת תלמיד/ה
      </button>
    </Sheet>
  );
}
