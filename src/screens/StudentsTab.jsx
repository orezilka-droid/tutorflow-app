import { useState } from "react";
import { UserPlus, Download, Search, ChevronRight, Phone, MessageCircle, FileText, Pencil } from "lucide-react";
import { C, STROKE } from "../lib/theme";
import { SectionCard } from "../components/Small";
import { dotFor } from "../lib/utils";
import { heDateShort } from "../lib/dates";
import { PENCIL_CASE } from "../assets/images";

/* ================= Students tab ================= */
export function StudentsTab({ students, lessons, activeCount, totalCount, search, setSearch, onAdd, onExport, onOpenProfile, onSummary, onWA, getStudentActive }) {
  const [openIds, setOpenIds] = useState(new Set());
  const [onlyActive, setOnlyActive] = useState(false);
  const toggle = (id) => setOpenIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <>
      {/* Top banner: icons only */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "14px 20px 6px", gap: 8 }}>
        <button onClick={onAdd} title="תלמיד/ה חדש/ה"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 6 }}>
          <UserPlus size={22} strokeWidth={STROKE} />
        </button>
        <button onClick={onExport} title="ייצוא CSV"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 6 }}>
          <Download size={22} strokeWidth={STROKE} />
        </button>
      </div>

      {/* Hero row: title RIGHT, pencil case LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 20px 14px" }}>
        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.15, marginTop: -8 }}>רשימת תלמידים</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, marginTop: 4 }}>
            {activeCount} פעילים מתוך {totalCount}
          </div>
        </div>
        <img src={PENCIL_CASE} alt="" style={{ width: 160, pointerEvents: "none", flexShrink: 0 }} />
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, margin: "0 20px 10px", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} strokeWidth={STROKE} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.sub }} />
          <input className="tf-input" style={{ paddingRight: 36 }} value={search}
            onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש…" />
        </div>
        <button className={"tf-pill" + (onlyActive ? " on" : "")}
          style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: 12.5 }}
          onClick={() => setOnlyActive(v => !v)}>
          פעילים בלבד
        </button>
      </div>

      {/* Accordion list */}
      <SectionCard style={{ margin: "0 20px" }}>
        {(onlyActive
          ? students.filter(s => getStudentActive ? getStudentActive(s) : s.active !== false)
          : students
        ).length === 0 && (
          <div style={{ padding: "22px", textAlign: "center", fontSize: 13.5, fontWeight: 300, color: C.sub }}>
            לא נמצאו תלמידים.
          </div>
        )}
        {(onlyActive
          ? students.filter(s => getStudentActive ? getStudentActive(s) : s.active !== false)
          : students
        ).map((s, i, arr) => {
          const isOpen = openIds.has(s.id);
          const isActive = getStudentActive ? getStudentActive(s) : s.active !== false;
          const lastLesson = lessons.filter(l => l.studentId === s.id).sort((a,b) => b.date.localeCompare(a.date))[0];
          const unpaidSum = lessons.filter(l => l.studentId === s.id && l.status === "unpaid" && new Date(l.date + "T" + l.time) <= new Date()).reduce((t,l) => t + l.price, 0);
          const iconBtn = (onClick, icon, color, title, href) => {
            const style = { background: C.cream, border: `1px solid ${C.hair}`, borderRadius: 10, padding: "7px 10px", cursor: "pointer", color: color || C.ink, display: "flex", alignItems: "center", justifyContent: "center" };
            if (href) return <a key={title} href={href} style={{ textDecoration: "none" }} title={title}><button style={style}>{icon}</button></a>;
            return <button key={title} title={title} style={style} onClick={onClick}>{icon}</button>;
          };
          return (
            <div key={s.id} className={i < arr.length - 1 ? "tf-hair" : ""}>
              <button onClick={() => toggle(s.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 18px", background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Assistant',sans-serif", textAlign: "right" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotFor(s.subject), flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: C.ink }}>{s.name}</span>
                {!isActive && (
                  <span style={{ fontSize: 10.5, fontWeight: 400, padding: "2px 9px", borderRadius: 99,
                    background: "#ede8df", color: "#8a7f6e" }}>לא פעיל</span>
                )}
                <span style={{ fontSize: 11.5, fontWeight: 300, color: C.sub }}>{s.subject}</span>
                <ChevronRight size={15} strokeWidth={STROKE} style={{ color: C.sub, transform: isOpen ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s", flexShrink: 0 }} />
              </button>
              {isOpen && (
                <div style={{ padding: "4px 18px 12px", borderTop: `1px solid ${C.hair}` }}>
                  <div style={{ display: "flex", gap: 14, padding: "7px 0 10px", fontSize: 12.5, fontWeight: 300, color: C.sub, flexWrap: "wrap" }}>
                    <span>₪{s.hourlyRate} לשעה</span>
                    {lastLesson && <span>שיעור אחרון: {heDateShort(lastLesson.date)}</span>}
                    {unpaidSum > 0 && <span style={{ color: "#96762a", fontWeight: 400 }}>חוב: ₪{unpaidSum}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {iconBtn(null, <Phone size={17} strokeWidth={STROKE} />, C.ink, "חיוג", `tel:${s.phone}`)}
                    {iconBtn(() => onWA(s), <MessageCircle size={17} strokeWidth={STROKE} />, "#2e9e5b", "וואטסאפ")}
                    {iconBtn(() => onSummary(s.id), <FileText size={17} strokeWidth={STROKE} />, C.ink, "סיכומים")}
                    {iconBtn(() => onOpenProfile(s.id), <Pencil size={17} strokeWidth={STROKE} />, C.ink, "עריכת פרטים")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>
    </>
  );
}
