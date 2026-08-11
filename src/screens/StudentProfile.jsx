import { useState } from "react";
import { Settings2, Phone, MessageCircle } from "lucide-react";
import { C } from "../lib/theme";
import { Sheet, Badge, Ic } from "../components/Small";
import { heDateShort } from "../lib/dates";
import { openWhatsApp } from "../lib/utils";

/* ================= Student profile + settings =================
   Note: the `location` field was removed — the live `students` table has
   no `location` column, so the "מיקום קבוע" editor is dropped from this
   settings block. `student.totalHours` is a value derived at the
   TutorFlowApp level from the lessons list (there's no total_hours
   column either), so it's just displayed here as-is. */
export function StudentProfile({ student, lessons, onClose, onToggleLesson, onUpdate }) {
  const [edit, setEdit] = useState({
    hourlyRate: String(student.hourlyRate), phone: student.phone,
    notes: student.notes,
    subject: student.subject, active: student.active !== false,
  });
  const dirty =
    Number(edit.hourlyRate) !== student.hourlyRate || edit.phone !== student.phone ||
    edit.notes !== student.notes ||
    edit.subject !== student.subject || edit.active !== (student.active !== false);
  const set = (k, v) => setEdit((e) => ({ ...e, [k]: v }));
  const save = () => onUpdate(student.id, {
    hourlyRate: Number(edit.hourlyRate) || student.hourlyRate,
    phone: edit.phone.trim() || student.phone,
    notes: edit.notes,
    subject: edit.subject, active: edit.active,
  });
  const history = lessons.filter((l) => l.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Sheet title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {student.name}
          <span style={{ fontSize: 11, fontWeight: 400, padding: "2px 10px", borderRadius: 99,
            background: (student.active !== false) ? "#e3ead4" : "#ede8df",
            color: (student.active !== false) ? "#54704e" : "#8a7f6e" }}>
            {(student.active !== false) ? "פעיל/ה" : "לא פעיל/ה"}
          </span>
        </span>
      } onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
        {[["כיתה", student.grade], ["מקצוע", student.subject], ["שעות מצטברות", student.totalHours]].map(([label, val], i) => (
          <div key={i} style={{ background: C.cream, border: `1px solid ${C.hair}`, borderRadius: 12, padding: "9px 12px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 400, marginTop: 1 }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="tf-card" style={{ margin: "12px 0", padding: "13px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15.5, marginBottom: 10 }}>
          <Settings2 size={18} strokeWidth={1.4} />הגדרות תלמיד/ה
        </div>
        {/* Active toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 300 }}>סטטוס תלמיד/ה:</span>
          <button onClick={() => set("active", !edit.active)}
            style={{ fontSize: 12, fontWeight: 400, padding: "3px 14px", borderRadius: 99, border: "none", cursor: "pointer",
              background: edit.active ? "#e3ead4" : "#ede8df", color: edit.active ? "#54704e" : "#8a7f6e", fontFamily: "inherit" }}>
            {edit.active ? "פעיל/ה" : "לא פעיל/ה"}
          </button>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="tf-label">מקצוע</label>
          <input className="tf-input" value={edit.subject} onChange={(e) => set("subject", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="tf-label">תעריף לשעה (₪)</label>
            <input className="tf-input" type="number" min="0" value={edit.hourlyRate}
              onChange={(e) => set("hourlyRate", e.target.value)} />
          </div>
          <div>
            <label className="tf-label">טלפון</label>
            <input className="tf-input" dir="ltr" value={edit.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <label className="tf-label">הערות</label>
          <textarea className="tf-input" rows={2} value={edit.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <button disabled={!dirty} onClick={save}
          style={{ width: "100%", marginTop: 12, background: dirty ? C.green : "#d9d2bf", color: C.boardTx, border: "none", borderRadius: 12, padding: 10, fontSize: 14.5, fontWeight: 400, fontFamily: "inherit", cursor: dirty ? "pointer" : "default" }}>
          שמירת הגדרות
        </button>
        <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub, marginTop: 7, lineHeight: 1.5 }}>
          שינוי התעריף ישפיע על שיעורים חדשים בלבד; מחירי שיעורים קיימים לא ישתנו.
        </div>
      </div>

      <div style={{ fontSize: 15, marginBottom: 6 }}>היסטוריית שיעורים</div>
      <div className="tf-card" style={{ maxHeight: 170, overflowY: "auto", marginBottom: 12 }}>
        {history.length === 0 ? (
          <div style={{ padding: "14px 16px", fontSize: 13, fontWeight: 300, color: C.sub, textAlign: "center" }}>אין עדיין שיעורים.</div>
        ) : history.map((l, i) => (
          <div key={l.id} className={i < history.length - 1 ? "tf-hair" : ""} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 400 }}>{heDateShort(l.date)} · {l.time}</div>
              <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub }}>{l.duration} דק׳ · ₪{l.price}</div>
            </div>
            <Badge status={l.status} onClick={() => onToggleLesson(l.id)} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <a className="tf-ghost" href={`tel:${student.phone}`} style={{ textDecoration: "none" }}>
          <Ic icon={Phone} size={17} />חיוג
        </a>
        <button className="tf-ghost" style={{ background: C.green2, color: C.boardTx, borderColor: C.green2 }}
          onClick={() => openWhatsApp(student.phone, `היי ${student.name}! `)}>
          <Ic icon={MessageCircle} size={17} />וואטסאפ
        </button>
      </div>
    </Sheet>
  );
}
