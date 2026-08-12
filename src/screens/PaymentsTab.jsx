import { useState } from "react";
import { Download } from "lucide-react";
import { C, STROKE } from "../lib/theme";
import { SectionCard } from "../components/Small";
import { heDateShort, HE_MONTHS_SHORT, HE_MONTHS_FULL } from "../lib/dates";
import { HOURGLASS, KPI_STUDENTS2, KPI_WALLET2, KPI_CLOCK2, KPI_HOURGLASS2 } from "../assets/images";

/* ================= Payments tab ================= */
export function PaymentsTab({ lessons, students, unpaidByStudent, templates, onOpenWhatsApp, onShowUnpaid, fillTemplate, onToggle }) {
  const now = new Date();
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());

  const monthStr = `${selYear}-${String(selMonth+1).padStart(2,"0")}`;
  const mLessons = lessons.filter(l => l.date.startsWith(monthStr));
  const mDone    = mLessons.filter(l => l.status === "paid").length;
  const mRevenue = mLessons.reduce((s,l) => s+l.price, 0);
  const mHours   = +(mLessons.reduce((s,l) => s+l.duration/60, 0)).toFixed(1);
  const mUnpaid  = mLessons.filter(l => l.status === "unpaid" && new Date(l.date + "T" + l.time) <= now).reduce((s,l) => s+l.price, 0);

  const graphMonths = Array.from({length:6}, (_,i) => {
    const d = new Date(selYear, selMonth - 5 + i, 1);
    return { label: HE_MONTHS_SHORT[d.getMonth()], key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` };
  });
  const graphVals = graphMonths.map(({key}) =>
    lessons.filter(l => l.date.startsWith(key)).reduce((s,l) => s+l.price, 0)
  );
  const maxVal = Math.max(...graphVals, 1);
  const W = 340, H = 100, pad = 14;
  const pts = graphVals.map((v,i) => ({
    x: pad + (i/(graphVals.length-1||1)) * (W - pad*2),
    y: H - pad - ((v/maxVal) * (H - pad*2))
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${H-pad} ` + pts.map(p=>`L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length-1].x},${H-pad} Z`;

  const [confirmPay,     setConfirmPay]     = useState(null);
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  const kpis = [
    { label: "כמות שיעורים", value: String(mDone), img: KPI_STUDENTS2 },
    { label: "סה״כ הכנסות", value: `₪${mRevenue.toLocaleString()}`, img: KPI_WALLET2 },
    { label: "שעות הוראה", value: String(mHours), img: KPI_CLOCK2 },
    { label: "ממתין לתשלום", value: `₪${mUnpaid.toLocaleString()}`, img: KPI_HOURGLASS2, amber: true, onClick: () => setShowOnlyUnpaid(v => !v) },
  ];

  return (
    <>
      {/* Top banner with export */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 20px 0" }}>
        <button title="ייצוא לאקסל" onClick={() => {
            const rows = ["תלמיד,תאריך,שעה,מחיר,סטטוס",
              ...mLessons.sort((a,b) => b.date.localeCompare(a.date))
                .map(l => `${l.studentName},${l.date},${l.time},${l.price},${l.status === "paid" ? "שולם" : "טרם שולם"}`)];
            const csv = "﻿" + rows.join("\n");
            const w = window.open("", "_blank");
            w.document.write("<pre dir=\"ltr\">" + csv + "</pre>");
          }}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 6 }}>
          <Download size={22} strokeWidth={STROKE} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 20px 6px" }}>
        <img src={HOURGLASS} alt="" style={{ width: 121, pointerEvents: "none", flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 400, marginTop: 6 }}>תשלומים והכנסות</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, marginTop: 4 }}>
            הכנסות {HE_MONTHS_FULL[selMonth]}: ₪{mRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* KPI grid title */}
      <div style={{ fontSize: 15, fontWeight: 400, margin: "4px 22px 8px", textAlign: "right" }}>סיכום תשלומים</div>

      {/* KPI grid - 2 paired cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, margin: "0 20px 10px" }}>
        {[0, 1].map(col => (
          <div key={col} style={{ background: C.card, border: `1px solid #e8e0cc`, borderRadius: 18,
            boxShadow: "0 2px 8px rgba(80,65,40,.07)", overflow: "hidden" }}>
            {kpis.filter((_,i) => i % 2 === col).map(({ label, value, img, amber, onClick }, i) => (
              <div key={label} onClick={onClick}
                style={{ padding: "12px 12px 10px", cursor: onClick ? "pointer" : "default",
                  borderBottom: i === 0 ? `1px solid #e8e0cc` : "none",
                  background: "transparent",
                  display: "flex", alignItems: "center", gap: 8, minHeight: 88 }}>
                <img src={img} alt="" style={{ width: 48, height: 48, flexShrink: 0, objectFit: "contain" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 400, color: amber ? "#c04040" : C.sub, lineHeight: 1.2 }}>{label}{amber ? " ↗" : ""}</div>
                  <div style={{ fontSize: value.length > 9 ? 16 : value.length > 6 ? 19 : 24, fontWeight: 700,
                    fontFamily: "'Google Sans Flex',sans-serif", color: amber ? "#c04040" : C.ink, lineHeight: 1.1, marginTop: 2,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Month selector — below cards */}
      <div style={{ display: "flex", justifyContent: "center", margin: "0 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6,
          background: "#f4f0e4", borderRadius: 20, padding: "5px 16px", border: `1px solid ${C.hair}` }}>
          <button onClick={() => { let m=selMonth-1,y=selYear; if(m<0){m=11;y--;} setSelMonth(m);setSelYear(y); }}
            style={{ background:"none",border:"none",cursor:"pointer",color:C.ink,padding:"0 2px",fontFamily:"inherit",fontSize:16,lineHeight:1 }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 400, minWidth: 80, textAlign: "center" }}>
            {HE_MONTHS_FULL[selMonth]} {selYear}
          </span>
          <button onClick={() => { let m=selMonth+1,y=selYear; if(m>11){m=0;y++;} setSelMonth(m);setSelYear(y); }}
            style={{ background:"none",border:"none",cursor:"pointer",color:C.ink,padding:"0 2px",fontFamily:"inherit",fontSize:16,lineHeight:1 }}>›</button>
        </div>
      </div>

      {/* Graph title + graph */}
      <div style={{ fontSize: 15, fontWeight: 400, margin: "0 22px 8px" }}>הכנסות לאורך זמן</div>
      <div style={{ margin: "0 20px 16px", background: C.card, border: `1px solid #e8e0cc`,
        borderRadius: 16, padding: "12px 14px", boxShadow: "0 2px 8px rgba(80,65,40,.07)" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{ overflow: "visible", direction: "ltr" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7f9c78" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#7f9c78" stopOpacity="0.04"/>
            </linearGradient>
          </defs>
          {[0, Math.round(maxVal/2), maxVal].map((v,i) => {
            const y = H - pad - ((v/maxVal)*(H-pad*2));
            return <g key={i}>
              <line x1={pad} y1={y} x2={W-pad} y2={y} stroke="#e0dac8" strokeWidth="0.8" strokeDasharray="4,4"/>
              <text x={pad-4} y={y+4} textAnchor="end" fontSize="9" fill="#b0a888">
                {v >= 1000 ? `${Math.round(v/1000)}k` : v}₪
              </text>
            </g>;
          })}
          <path d={area} fill="url(#areaGrad)" />
          <polyline points={polyline} fill="none" stroke="#7f9c78" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
          {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#7f9c78" strokeWidth="2"/>)}
          {pts.map((p,i) => <text key={i} x={p.x} y={H+16} textAnchor="middle" fontSize="9" fill="#b0a888">{graphMonths[i].label}</text>)}
        </svg>
      </div>

      {/* Payments list title + filter + list */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 22px 10px" }}>
        <div style={{ fontSize: 15, fontWeight: 400 }}>
          תשלומים · {HE_MONTHS_FULL[selMonth]} {selYear}
        </div>
        {showOnlyUnpaid && (
          <button onClick={() => setShowOnlyUnpaid(false)}
            style={{ fontSize: 11.5, fontWeight: 400, padding: "3px 12px", borderRadius: 99, border: "none",
              cursor: "pointer", background: "#faedc8", color: "#96762a", fontFamily: "inherit" }}>
            טרם שולם ✕
          </button>
        )}
      </div>
      {(() => {
        const displayed = showOnlyUnpaid
          ? mLessons.filter(l => l.status === "unpaid")
          : mLessons;

        if (displayed.length === 0) return (
          <div style={{ margin: "10px 20px", textAlign: "center", fontSize: 13.5, fontWeight: 300, color: C.sub }}>
            {showOnlyUnpaid ? "אין שיעורים שלא שולמו בחודש זה." : "אין שיעורים בחודש זה."}
          </div>
        );

        // Group unpaid by student, keep paid individual
        const unpaidByS = {};
        const paidRows = [];
        [...displayed].sort((a,b) => b.date.localeCompare(a.date)).forEach(l => {
          if (l.status === "unpaid") {
            if (!unpaidByS[l.studentId]) unpaidByS[l.studentId] = { studentName: l.studentName, lessons: [] };
            unpaidByS[l.studentId].lessons.push(l);
          } else {
            paidRows.push(l);
          }
        });
        const unpaidGroups = Object.values(unpaidByS);
        const allRows = [...unpaidGroups.map(g => ({ type: "group", ...g })), ...paidRows.map(l => ({ type: "single", ...l }))];

        return (
          <SectionCard style={{ margin: "0 20px" }}>
            {allRows.map((row, i) => row.type === "group" ? (
              // Grouped unpaid row
              <div key={row.studentName + "g"} className={i < allRows.length - 1 ? "tf-hair" : ""}
                style={{ padding: "10px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10,
                  cursor: row.lessons.length > 1 ? "pointer" : "default" }}
                  onClick={() => {
                    if (row.lessons.length <= 1) return;
                    setExpandedGroups(prev => {
                      const n = new Set(prev);
                      n.has(row.studentName) ? n.delete(row.studentName) : n.add(row.studentName);
                      return n;
                    });
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{row.studentName}</span>
                      {row.lessons.length > 1 && (
                        <span style={{ fontSize: 11, fontWeight: 400, padding: "2px 9px", borderRadius: 99,
                          background: "#faedc8", color: "#96762a" }}>
                          {row.lessons.length} שיעורים
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub, marginTop: 2 }}>
                      {row.lessons.map(l => heDateShort(l.date)).join(" · ")}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#96762a" }}>
                    ₪{row.lessons.reduce((s,l) => s+l.price, 0)}
                  </div>
                  {row.lessons.length === 1 ? (
                    <button onClick={e => { e.stopPropagation(); setConfirmPay(row.lessons[0].id); }}
                      style={{ fontSize: 11, fontWeight: 400, padding: "3px 10px", borderRadius: 99, border: "none",
                        cursor: "pointer", fontFamily: "inherit", background: "#faedc8", color: "#96762a" }}>
                      טרם שולם
                    </button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); row.lessons.forEach(l => onToggle(l.id)); }}
                      style={{ fontSize: 11, fontWeight: 400, padding: "3px 10px", borderRadius: 99, border: "none",
                        cursor: "pointer", fontFamily: "inherit", background: "#faedc8", color: "#96762a" }}>
                      סמן הכל כשולם
                    </button>
                  )}
                  {row.lessons.length > 1 && (
                    <span style={{ fontSize: 13, color: C.sub, marginRight: 2 }}>
                      {expandedGroups.has(row.studentName) ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                {/* Sub-rows — only when expanded */}
                {row.lessons.length > 1 && expandedGroups.has(row.studentName) && (
                  <div style={{ marginTop: 6, paddingRight: 0 }}>
                    {row.lessons.map(l => (
                      <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 4px 0",
                        borderTop: `1px dashed ${C.hair}`, marginTop: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 300, color: C.sub, flex: 1 }}>
                          {heDateShort(l.date)} · {l.time}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#96762a" }}>₪{l.price}</span>
                        <button onClick={() => setConfirmPay(l.id)}
                          style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 99, border: "none",
                            cursor: "pointer", fontFamily: "inherit", background: "#f4e6c4", color: "#96762a" }}>
                          טרם שולם
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Individual paid row
              <div key={row.id} className={i < allRows.length - 1 ? "tf-hair" : ""}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{row.studentName}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub }}>
                    {heDateShort(row.date)} · {row.time}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#54704e" }}>₪{row.price}</div>
                <button onClick={() => setConfirmPay(row.id)}
                  style={{ fontSize: 11, fontWeight: 400, padding: "3px 10px", borderRadius: 99, border: "none",
                    cursor: "pointer", fontFamily: "inherit", background: "#e3ead4", color: "#54704e" }}>
                  שולם
                </button>
              </div>
            ))}
          </SectionCard>
        );
      })()}

      {/* Confirm toggle dialog */}
      {confirmPay !== null && (() => {
        const l = mLessons.find(x => x.id === confirmPay);
        const willBePaid = l?.status === "unpaid";
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
            <div onClick={() => setConfirmPay(null)} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.38)" }} />
            <div style={{ position: "relative", width: 310, background: "#fffdf8", borderRadius: 20, padding: "22px 20px 18px",
              boxShadow: "0 16px 40px rgba(38,37,31,.22)", fontFamily: "'Assistant',sans-serif", color: C.ink }}>
              <div style={{ fontSize: 16.5, fontWeight: 500, marginBottom: 8 }}>האם אתה בטוח?</div>
              <div style={{ fontSize: 13.5, fontWeight: 300, color: C.sub, lineHeight: 1.55, marginBottom: 18 }}>
                {willBePaid
                  ? `לסמן את השיעור מ-${l ? heDateShort(l.date) : ""} עם ${l?.studentName} כ"שולם"?`
                  : `לסמן את השיעור מ-${l ? heDateShort(l.date) : ""} עם ${l?.studentName} כ"טרם שולם"?`}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmPay(null)} className="tf-ghost" style={{ flex: 1, padding: "9px" }}>ביטול</button>
                <button onClick={() => { onToggle(confirmPay); setConfirmPay(null); }}
                  style={{ flex: 1, background: willBePaid ? C.green : "#c9a95c",
                    color: willBePaid ? C.boardTx : "#3a2e0e",
                    border: "none", borderRadius: 12, padding: "9px", fontSize: 14.5, fontWeight: 400,
                    cursor: "pointer", fontFamily: "inherit" }}>
                  {willBePaid ? "סמן כשולם" : "סמן כטרם שולם"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
