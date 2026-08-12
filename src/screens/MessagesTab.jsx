import { useState } from "react";
import { Plus } from "lucide-react";
import { C, STROKE } from "../lib/theme";
import { SectionCard } from "../components/Small";
import { GLOBE2 } from "../assets/images";
import { iso } from "../lib/dates";

/* ================= Messages tab =================
   templates:        { [key]: body }
   customTemplates:  [{ key, label }]  — derived from the `templates` DB rows
                      whose key starts with "custom_"
   onChangeTemplate(key, body)  — persists an edit to an existing row
   onAddCustomTemplate(label)   — inserts a brand-new custom template row
*/
export function MessagesTab({ templates, customTemplates, onChangeTemplate, onAddCustomTemplate, fillTemplate }) {
  const TEMPLATE_KEYS = [
    { key: "reminder",     label: "תזכורת לשיעור",      desc: "נשלחת מכפתור הוואטסאפ ליד שיעור" },
    { key: "payment",      label: "תזכורת תשלום",        desc: "לשיעורים שטרם שולמו" },
    { key: "confirmation", label: "אישור קביעת שיעור",   desc: "לאחר שיבוץ שיעור חדש" },
  ];
  const VARS = [
    { tag: "{student_name}", label: "שם" },
    { tag: "{date}",         label: "תאריך" },
    { tag: "{time}",         label: "שעה" },
    { tag: "{price}",        label: "מחיר" },
  ];

  const [newTplName, setNewTplName] = useState("");
  const [showNewTpl, setShowNewTpl] = useState(false);
  const [filter, setFilter] = useState("all");

  const allKeys = [
    ...TEMPLATE_KEYS,
    ...(customTemplates || []).map((k) => ({ key: k.key, label: k.label || "תבנית מותאמת אישית", desc: "תבנית מותאמת אישית" })),
  ];
  const visibleKeys = filter === "all" ? allKeys : allKeys.filter((k) => k.key === filter);

  const addCustomTemplate = () => {
    if (!newTplName.trim()) return;
    onAddCustomTemplate(newTplName.trim());
    setNewTplName("");
    setShowNewTpl(false);
  };

  const insertTag = (key, tag) => {
    const el = document.getElementById("tpl-" + key);
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const val = templates[key] || "";
    const newVal = val.slice(0, start) + tag + val.slice(end);
    onChangeTemplate(key, newVal);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "12px 20px 8px" }}>
        <img src={GLOBE2} alt="" style={{ width: 160, height: 160, objectFit: "contain", pointerEvents: "none", flexShrink: 0 }} />
        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.15 }}>הודעות</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, marginTop: 4 }}>מוכנות לשליחה</div>
        </div>
      </div>

      <div style={{ margin: "14px 22px 16px", fontSize: 13.5, fontWeight: 300, color: C.sub, lineHeight: 1.6 }}>
        ערכי את התבנית ולחצי + להוספת פרטים אוטומטיים. לחיצה על אייקון וואטסאפ ליד שיעור תפתח חלון בחירת תבנית.
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 20px 16px", alignItems: "center" }}>
        <button onClick={() => setFilter("all")} className={"tf-pill" + (filter === "all" ? " on" : "")}>
          הכל
        </button>
        {allKeys.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} className={"tf-pill" + (filter === key ? " on" : "")}>
            {label}
          </button>
        ))}
        <button onClick={() => setShowNewTpl(true)} title="הוסף תבנית חדשה"
          style={{ width: 30, height: 30, borderRadius: "50%", background: "#6a7870", color: "#f0ede6",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Plus size={16} strokeWidth={STROKE} />
        </button>
      </div>

      {visibleKeys.map(({ key, label, desc }) => (
        <SectionCard key={key} style={{ margin: "0 20px 14px", padding: "14px 16px" }}>
          <div style={{ fontSize: 15, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub, marginBottom: 10 }}>{desc}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {VARS.map(({ tag, label: vl }) => (
              <button key={tag} onClick={() => insertTag(key, tag)}
                style={{ fontSize: 11.5, padding: "3px 10px", borderRadius: 99,
                  border: "1px solid " + C.hair, background: C.cream, color: C.green,
                  cursor: "pointer", fontFamily: "inherit", fontWeight: 400 }}>
                + {vl}
              </button>
            ))}
          </div>
          <textarea id={"tpl-" + key} className="tf-input" rows={3} value={templates[key] || ""}
            onChange={(e) => onChangeTemplate(key, e.target.value)} />
          <div style={{ marginTop: 10, background: "#f7f3ea", borderRadius: 10, padding: "9px 12px",
            fontSize: 13, fontWeight: 300, color: "#4a463a", lineHeight: 1.6 }}>
            <span style={{ fontSize: 11, color: C.sub, display: "block", marginBottom: 3 }}>תצוגה מקדימה:</span>
            {fillTemplate(templates[key], { studentName: "נועה לוי", date: iso(new Date()), time: "16:00", price: 270 })}
          </div>
        </SectionCard>
      ))}
      <div style={{ margin: "4px 20px 24px" }}>
        {showNewTpl ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="tf-input" value={newTplName} autoFocus
              onChange={e => setNewTplName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addCustomTemplate(); if (e.key === "Escape") setShowNewTpl(false); }}
              placeholder="שם התבנית..." style={{ flex: 1, padding: "9px 12px", fontSize: 14 }} />
            <button onClick={addCustomTemplate}
              style={{ padding: "9px 16px", background: C.green, color: C.boardTx, border: "none",
                borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, whiteSpace: "nowrap" }}>
              הוסף
            </button>
            <button onClick={() => { setShowNewTpl(false); setNewTplName(""); }} className="tf-ghost"
              style={{ padding: "9px 12px" }}>ביטול</button>
          </div>
        ) : (
          <button onClick={() => setShowNewTpl(true)} className="tf-ghost"
            style={{ width: "100%", padding: "10px", background: "#6a7870", borderColor: "#6a7870", color: "#f0ede6" }}>
            <Plus size={16} strokeWidth={STROKE} style={{ verticalAlign: "middle", marginLeft: 6 }} />
            הוסף תבנית חדשה
          </button>
        )}
      </div>
    </>
  );
}
