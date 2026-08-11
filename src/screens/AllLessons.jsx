import { useState } from "react";
import { C } from "../lib/theme";
import { Sheet } from "../components/Small";
import { dotFor } from "../lib/utils";
import { heDateShort, todayISO } from "../lib/dates";

/* ================= All lessons modal ================= */
export function AllLessons({ lessons, onClose, onPick }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const list = lessons.filter((l) => {
    if (q.trim() && !(l.studentName.includes(q) || l.subject.includes(q))) return false;
    if (f === "paid") return l.status === "paid";
    if (f === "unpaid") return l.status === "unpaid";
    if (f === "future") return l.date >= todayISO;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  return (
    <Sheet title="כל השיעורים" onClose={onClose}>
      <input className="tf-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי תלמיד/ה או מקצוע…" />
      <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
        {[["all", "הכל"], ["future", "עתידיים"], ["paid", "שולם"], ["unpaid", "טרם שולם"]].map(([id, l]) => (
          <button key={id} className={"tf-pill" + (f === id ? " on" : "")} style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => setF(id)}>{l}</button>
        ))}
      </div>
      <div className="tf-card" style={{ maxHeight: "52vh", overflowY: "auto" }}>
        {list.length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, fontWeight: 300, color: C.sub, textAlign: "center" }}>לא נמצאו שיעורים.</div>
        ) : list.map((l, i) => (
          <div key={l.id} className={i < list.length - 1 ? "tf-hair" : ""} onClick={() => onPick(l.id)}
            style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 14px", cursor: "pointer" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotFor(l.subject), flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 400 }}>{l.studentName} · {l.subject}</div>
              <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub }}>{heDateShort(l.date)} · {l.time} · ₪{l.price}</div>
            </div>
            <span className="tf-badge" style={{ background: l.status === "paid" ? C.paidBg : C.unpaidBg, color: l.status === "paid" ? C.paidTx : C.unpaidTx }}>
              {l.status === "paid" ? "שולם" : "טרם שולם"}
            </span>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
