import { useState } from "react";
import { Sheet } from "../components/Small";
import { todayISO } from "../lib/dates";

/* ================= Add lesson modal ================= */
export function AddLesson({ students, defaultDate, onClose, onSubmit }) {
  const [form, setForm] = useState({ studentId: "", date: defaultDate || todayISO, time: "16:00", duration: "60", price: "", subject: "", notes: "" });
  const [sendConfirm, setSendConfirm] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const priceFor = (sid, dur) => {
    const s = students.find((x) => x.id === Number(sid));
    return s ? String(Math.round((s.hourlyRate * Number(dur)) / 60)) : "";
  };
  const pickStudent = (sid) => {
    const s = students.find((x) => x.id === Number(sid));
    setForm((f) => ({ ...f, studentId: sid, price: priceFor(sid, f.duration), subject: s ? s.subject : f.subject }));
  };
  const pickDuration = (d) => setForm((f) => ({ ...f, duration: d, price: f.studentId ? priceFor(f.studentId, d) : f.price }));
  const valid = form.studentId && form.date && form.time && form.price;
  return (
    <Sheet title="שיבוץ שיעור חדש" onClose={onClose}>
      <label className="tf-label">תלמיד/ה</label>
      <select className="tf-input" value={form.studentId} onChange={(e) => pickStudent(e.target.value)}>
        <option value="">בחירת תלמיד/ה…</option>
        {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <div>
          <label className="tf-label">תאריך</label>
          <input className="tf-input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div>
          <label className="tf-label">שעת התחלה</label>
          <input className="tf-input" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
        </div>
      </div>
      <label className="tf-label" style={{ marginTop: 12 }}>משך השיעור</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {["45", "60", "90"].map((d) => (
          <button key={d} className={"tf-pill" + (form.duration === d ? " on" : "")} style={{ textAlign: "center" }} onClick={() => pickDuration(d)}>
            {d} דק׳
          </button>
        ))}
        <button className={"tf-pill" + (!["45","60","90"].includes(form.duration) ? " on" : "")}
          style={{ textAlign: "center" }} onClick={() => pickDuration("custom")}>
          אחר
        </button>
      </div>
      {!["45","60","90"].includes(form.duration) && (
        <input className="tf-input" type="number" min="1" max="300" style={{ marginTop: 8 }}
          placeholder="הזן מספר דקות…"
          value={form.duration === "custom" ? "" : form.duration}
          onChange={(e) => {
            const v = e.target.value;
            set("duration", v);
            if (form.studentId && v) set("price", String(Math.round((Number(form.price || 0) / (Number(form.duration) || 1)) * Number(v))));
          }} />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <div>
          <label className="tf-label">מקצוע</label>
          <input className="tf-input" value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="מתעדכן לפי התלמיד/ה" />
        </div>
        <div>
          <label className="tf-label">מחיר (₪)</label>
          <input className="tf-input" type="number" min="0" value={form.price} placeholder="לפי התעריף, ניתן לעריכה"
            onChange={(e) => set("price", e.target.value)} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label className="tf-label">הערות לשיעור (נושא, דגשים…)</label>
        <textarea className="tf-input" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "13px 2px", fontSize: 13.5, fontWeight: 300, color: "#5d574a", cursor: "pointer" }}>
        <input type="checkbox" checked={sendConfirm} onChange={(e) => setSendConfirm(e.target.checked)} style={{ accentColor: "#35493e" }} />
        שליחת אישור קביעת שיעור בוואטסאפ
      </label>
      <button disabled={!valid} onClick={() => onSubmit(form, sendConfirm)}
        style={{ width: "100%", background: valid ? "#35493e" : "#d9d2bf", color: "#efe9d8", border: "none", borderRadius: 12, padding: 12, fontSize: 15, fontWeight: 400, fontFamily: "inherit", cursor: valid ? "pointer" : "default" }}>
        שמירה
      </button>
    </Sheet>
  );
}
