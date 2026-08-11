import { useState } from "react";
import { C } from "../lib/theme";
import { Sheet } from "../components/Small";

/* ================= Edit lesson modal ================= */
export function EditLesson({ lesson, onClose, onSave, onDelete }) {
  const [f, setF] = useState({
    date: lesson.date, time: lesson.time, duration: String(lesson.duration),
    subject: lesson.subject, price: String(lesson.price), notes: lesson.notes || "",
  });
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => {
    onSave(lesson.id, {
      date: f.date, time: f.time, duration: Number(f.duration) || lesson.duration,
      subject: f.subject.trim() || lesson.subject, price: Number(f.price) || lesson.price, notes: f.notes,
    });
    onClose();
  };
  return (
    <Sheet title={`עריכת שיעור · ${lesson.studentName}`} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label className="tf-label">תאריך</label>
          <input className="tf-input" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div>
          <label className="tf-label">שעת התחלה</label>
          <input className="tf-input" type="time" value={f.time} onChange={(e) => set("time", e.target.value)} />
        </div>
      </div>
      <label className="tf-label" style={{ marginTop: 12 }}>משך השיעור</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {["45", "60", "90"].map((d) => (
          <button key={d} className={"tf-pill" + (f.duration === d ? " on" : "")} style={{ textAlign: "center" }} onClick={() => set("duration", d)}>
            {d} דק׳
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <div>
          <label className="tf-label">מקצוע</label>
          <input className="tf-input" value={f.subject} onChange={(e) => set("subject", e.target.value)} />
        </div>
        <div>
          <label className="tf-label">מחיר (₪)</label>
          <input className="tf-input" type="number" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label className="tf-label">הערות לשיעור</label>
        <textarea className="tf-input" rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <button onClick={save}
        style={{ width: "100%", marginTop: 14, background: C.green, color: C.boardTx, border: "none", borderRadius: 12, padding: 12, fontSize: 15, fontWeight: 400, fontFamily: "inherit", cursor: "pointer" }}>
        שמירת שינויים
      </button>
      <button onClick={() => (confirmDel ? onDelete(lesson.id) : setConfirmDel(true))}
        className="tf-ghost" style={{ width: "100%", marginTop: 9, borderColor: "#c69c8b", color: "#9c4a33" }}>
        {confirmDel ? "בטוחה? לחיצה נוספת תמחק לצמיתות" : "ביטול / מחיקת שיעור"}
      </button>
    </Sheet>
  );
}
