import { useState } from "react";
import { C } from "../lib/theme";
import { daysAgo, todayISO } from "../lib/dates";

/* ================= Export Modal ================= */
export function ExportModal({ lessons, students, onClose, notify }) {
  const [fromDate, setFromDate] = useState(daysAgo(30));
  const [toDate, setToDate]   = useState(todayISO);
  const [fields, setFields]   = useState({
    studentName: true, lessonCount: true, revenue: true,
    hours: true, unpaid: false, lastLesson: false, summaries: false,
  });
  const FIELD_LABELS = {
    studentName: "שם תלמיד", lessonCount: "כמות שיעורים",
    revenue: "הכנסה", hours: "שעות הוראה",
    unpaid: "חוב פתוח", lastLesson: "שיעור אחרון", summaries: "סיכומים",
  };
  const toggleField = f => setFields(p => ({ ...p, [f]: !p[f] }));

  const doExport = (fmt) => {
    const filtered = lessons.filter(l => l.date >= fromDate && l.date <= toDate);
    const byStudent = students.map(s => {
      const sLessons = filtered.filter(l => l.studentId === s.id);
      if (!sLessons.length) return null;
      return {
        studentName: s.name,
        lessonCount: sLessons.length,
        revenue: sLessons.filter(l => l.status === "paid").reduce((t,l) => t+l.price, 0),
        hours: +(sLessons.reduce((t,l) => t+l.duration/60, 0)).toFixed(1),
        unpaid: sLessons.filter(l => l.status === "unpaid" && new Date(l.date + "T" + l.time) <= new Date()).reduce((t,l) => t+l.price, 0),
        lastLesson: sLessons.sort((a,b) => b.date.localeCompare(a.date))[0]?.date || "",
        summaries: sLessons.filter(l => l.notes?.trim()).map(l => l.notes).join(" | "),
      };
    }).filter(Boolean);

    const activeFields = Object.entries(fields).filter(([,v]) => v).map(([k]) => k);
    const headers = activeFields.map(f => FIELD_LABELS[f]);
    const rows = byStudent.map(r => activeFields.map(f => String(r[f] ?? "")));

    if (byStudent.length === 0) { notify("אין נתונים בתקופה הנבחרת"); return; }

    // Build CSV and open in new tab for saving
    const csv = [headers, ...rows].map(r =>
      r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const table = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
      <title>TutorFlow Export</title>
      <style>body{font-family:sans-serif;padding:24px;direction:rtl}
      h2{font-weight:400;margin-bottom:16px}
      table{border-collapse:collapse;width:100%;font-size:14px}
      th,td{border:1px solid #ccc;padding:8px 14px;text-align:right}
      th{background:#f0ead8;font-weight:500}
      tr:nth-child(even){background:#fafaf7}
      .csv{background:#f7f3ea;border-radius:8px;padding:16px;margin-top:24px;font-size:12px;direction:ltr;white-space:pre-wrap;overflow-x:auto}
      button{background:#35493e;color:#efe9d8;border:none;padding:10px 22px;border-radius:8px;cursor:pointer;font-size:14px;margin-left:10px}
      </style></head><body>
      <h2>TutorFlow — ייצוא נתונים · ${fromDate} עד ${toDate}</h2>
      <button onclick="window.print()">🖨️ הדפסה / PDF</button>
      <button onclick="copyCSV()">📋 העתק CSV</button>
      <table><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr>
      ${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}
      </table>
      <div class="csv" id="csvdata">${csv}</div>
      <script>function copyCSV(){navigator.clipboard?.writeText(document.getElementById('csvdata').textContent)||alert('העתק ידנית מהתיבה למטה');}</script>
      </body></html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(table);
      win.document.close();
    } else {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(csv).then(() => notify("CSV הועתק ללוח — הדבק לאקסל"));
    }
    notify(`יוצאו ${byStudent.length} תלמידים`);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 62, display: "flex", alignItems: "flex-end", justifyContent: "center" }} dir="rtl">
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.45)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 430, background: C.card,
        borderRadius: "22px 22px 0 0", padding: "22px 22px 36px",
        boxShadow: "0 -8px 30px rgba(38,37,31,.18)", fontFamily: "'Assistant',sans-serif", maxHeight: "85vh", overflowY: "auto" }}>

        <div style={{ fontSize: 18, fontWeight: 400, marginBottom: 18 }}>ייצוא נתונים</div>

        {/* Date range */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 400, color: C.sub, marginBottom: 8 }}>בחר תקופה</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: C.sub, display: "block", marginBottom: 3 }}>מתאריך</label>
              <input type="date" className="tf-input" value={fromDate} onChange={e => setFromDate(e.target.value)}
                style={{ padding: "7px 10px", fontSize: 13 }} dir="ltr" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: C.sub, display: "block", marginBottom: 3 }}>עד תאריך</label>
              <input type="date" className="tf-input" value={toDate} onChange={e => setToDate(e.target.value)}
                style={{ padding: "7px 10px", fontSize: 13 }} dir="ltr" />
            </div>
          </div>
          {/* Quick range pills */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {[["חודש אחרון", 30], ["3 חודשים", 90], ["שנה", 365]].map(([label, days]) => (
              <button key={label} className="tf-pill" style={{ fontSize: 11.5, padding: "3px 12px" }}
                onClick={() => { setFromDate(daysAgo(days)); setToDate(todayISO); }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 400, color: C.sub, marginBottom: 8 }}>בחר עמודות</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(FIELD_LABELS).map(([key, label]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                background: fields[key] ? "#eef4e8" : C.cream, border: `1px solid ${fields[key] ? C.sage : C.hair}`,
                borderRadius: 10, padding: "8px 12px", fontSize: 13.5, fontWeight: 300 }}>
                <input type="checkbox" checked={fields[key]} onChange={() => toggleField(key)}
                  style={{ accentColor: C.green, width: 16, height: 16 }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Export button */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => doExport()}
            style={{ flex: 1, padding: "11px", background: C.green, color: C.boardTx,
              border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            ייצוא וצפייה בנתונים
          </button>
        </div>

        <button onClick={onClose} className="tf-ghost" style={{ width: "100%", marginTop: 10 }}>ביטול</button>
      </div>
    </div>
  );
}
