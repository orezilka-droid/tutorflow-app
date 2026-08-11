import { useState, useEffect } from "react";
import { C } from "../lib/theme";
import { SectionCard } from "../components/Small";

/* ================= Settings tab =================
   Note: there is no `settings` table in the database — teacherName /
   defaultRate / defaultDuration / inactiveAfterDays are local-only React
   state at the TutorFlowApp level (this was a deliberate scope-down; the
   live schema only has students/lessons/templates tables). */
export function SettingsTab({ settings, onSave, templates, setTemplates, fillTemplate, onLogout }) {
  const [draft, setDraft] = useState({ ...settings });
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);
  const setD = (k, v) => setDraft(p => ({ ...p, [k]: v }));

  useEffect(() => { setDraft({ ...settings }); }, [settings]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px 14px" }}>
        <div style={{ fontSize: 30, fontWeight: 400 }}>הגדרות</div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 400, color: C.sub, margin: "0 22px 8px", letterSpacing: ".3px" }}>פרופיל</div>
      <SectionCard style={{ margin: "0 20px 16px", padding: "0 18px" }}>
        <div style={{ padding: "13px 0", borderBottom: `1px solid ${C.hair}` }}>
          <label style={{ fontSize: 12, fontWeight: 300, color: C.sub, display: "block", marginBottom: 5 }}>שם המורה</label>
          <input className="tf-input" value={draft.teacherName}
            onChange={e => setD("teacherName", e.target.value)}
            style={{ padding: "8px 10px", fontSize: 14 }} />
        </div>
        <div style={{ padding: "13px 0", borderBottom: `1px solid ${C.hair}` }}>
          <label style={{ fontSize: 12, fontWeight: 300, color: C.sub, display: "block", marginBottom: 5 }}>עלות שיעור ברירת מחדל (₪)</label>
          <input className="tf-input" type="number" min="0" value={draft.defaultRate}
            onChange={e => setD("defaultRate", Number(e.target.value))}
            style={{ padding: "8px 10px", fontSize: 14 }} dir="ltr" />
        </div>
        <div style={{ padding: "13px 0" }}>
          <label style={{ fontSize: 12, fontWeight: 300, color: C.sub, display: "block", marginBottom: 5 }}>
            תלמיד ללא שיעור הופך ללא פעיל אחרי (ימים)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input className="tf-input" type="number" min="1" max="365" value={draft.inactiveAfterDays}
              onChange={e => setD("inactiveAfterDays", Number(e.target.value))}
              style={{ padding: "8px 10px", fontSize: 14, width: 90 }} dir="ltr" />
            <span style={{ fontSize: 13, fontWeight: 300, color: C.sub }}>
              {draft.inactiveAfterDays === 30 ? "חודש" : draft.inactiveAfterDays === 60 ? "חודשיים" : draft.inactiveAfterDays === 90 ? "רבעון" : `${draft.inactiveAfterDays} ימים`}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Default duration field */}
      <SectionCard style={{ margin: "0 20px 16px", padding: "0 18px" }}>
        <div style={{ padding: "13px 0" }}>
          <label style={{ fontSize: 12, fontWeight: 300, color: C.sub, display: "block", marginBottom: 5 }}>משך שיעור ברירת מחדל (דקות)</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[45, 60, 90].map(d => (
              <button key={d} className={"tf-pill" + (draft.defaultDuration === d ? " on" : "")}
                onClick={() => setD("defaultDuration", d)} style={{ padding: "6px 16px" }}>{d} דק׳</button>
            ))}
          </div>
        </div>
      </SectionCard>

      {changed && (
        <div style={{ margin: "0 20px 16px" }}>
          <button onClick={() => onSave(draft)}
            style={{ width: "100%", padding: "11px", background: C.green, color: C.boardTx,
              border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            שמירת הגדרות
          </button>
        </div>
      )}
    </>
  );
}
