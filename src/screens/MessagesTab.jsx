import { useState } from "react";
import { Plus, Filter, ChevronRight } from "lucide-react";
import { C, STROKE } from "../lib/theme";
import { SectionCard, Sheet } from "../components/Small";
import { GLOBE2 } from "../assets/images";
import { iso } from "../lib/dates";

const TEMPLATE_DOT_COLORS = ["#BD8573", "#829171", "#DEA04D", "#526A7A", "#8A7680"];

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
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openIds, setOpenIds] = useState(new Set());
  const toggleOpen = (key) => setOpenIds((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

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
      {/* ── Top banner: filter + add-template icons ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "14px 20px 0", gap: 8 }}>
        <button onClick={() => setShowFilterMenu((v) => !v)} title="סינון"
          style={{ width: 34, height: 34, borderRadius: "50%",
            background: showFilterMenu ? "#6a7870" : C.cream, color: showFilterMenu ? "#f0ede6" : C.ink,
            border: `1px solid ${showFilterMenu ? "#6a7870" : C.hair}`, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Filter size={16} strokeWidth={STROKE} />
        </button>
        <button onClick={() => setShowNewTpl(true)} title="הוספת תבנית חדשה"
          style={{ width: 34, height: 34, borderRadius: "50%", background: "#6a7870", color: "#f0ede6",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={17} strokeWidth={STROKE} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 20px 8px" }}>
        <img src={GLOBE2} alt="" style={{ width: 160, height: 160, objectFit: "contain", pointerEvents: "none", flexShrink: 0 }} />
        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.15 }}>הודעות</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, marginTop: 4 }}>מוכנות לשליחה</div>
        </div>
      </div>

      <div style={{ margin: "14px 22px 16px", fontSize: 13.5, fontWeight: 300, color: C.sub, lineHeight: 1.6 }}>
        ערכי את התבנית ולחצי + להוספת פרטים אוטומטיים. לחיצה על אייקון וואטסאפ ליד שיעור תפתח חלון בחירת תבנית.
      </div>

      {/* ── Filter popup (opened by the filter icon) ── */}
      {showFilterMenu && (
        <Sheet title="סינון הודעות" onClose={() => setShowFilterMenu(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={() => { setFilter("all"); setShowFilterMenu(false); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                padding: "12px 14px", borderRadius: 12, border: `1px solid ${filter === "all" ? C.green : C.hair}`,
                background: filter === "all" ? "#eef4e8" : C.card, cursor: "pointer", fontFamily: "inherit",
                fontSize: 14.5, color: C.ink, textAlign: "right" }}>
              הכל
            </button>
            {allKeys.map(({ key, label }, i) => (
              <button key={key} onClick={() => { setFilter(key); setShowFilterMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "12px 14px", borderRadius: 12, border: `1px solid ${filter === key ? C.green : C.hair}`,
                  background: filter === key ? "#eef4e8" : C.card, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14.5, color: C.ink, textAlign: "right" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                  background: TEMPLATE_DOT_COLORS[i % TEMPLATE_DOT_COLORS.length] }} />
                {label}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {visibleKeys.map(({ key, label, desc }, i) => {
        const isOpen = openIds.has(key);
        return (
          <SectionCard key={key} style={{ margin: "0 20px 14px", padding: 0, overflow: "hidden" }}>
            <button onClick={() => toggleOpen(key)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", textAlign: "right" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                background: TEMPLATE_DOT_COLORS[i % TEMPLATE_DOT_COLORS.length] }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: C.ink }}>{label}</div>
                <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub, marginTop: 2 }}>{desc}</div>
              </div>
              <ChevronRight size={16} strokeWidth={STROKE} style={{ color: C.sub, flexShrink: 0,
                transform: isOpen ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s" }} />
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
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
                <div style={{ fontSize: 11, color: C.sub, margin: "10px 0 4px" }}>תצוגה מקדימה:</div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ background: "#E3EAD4", borderRadius: "14px 14px 3px 14px", padding: "9px 13px",
                    maxWidth: "85%", fontSize: 13, fontWeight: 300, color: "#26251f", lineHeight: 1.7, position: "relative" }}>
                    {fillTemplate(templates[key], { studentName: "נועה לוי", date: iso(new Date()), time: "16:00", price: 270 })}
                    <span style={{ position: "absolute", bottom: 0, left: -6, width: 12, height: 12,
                      background: "#E3EAD4", clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        );
      })}
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
