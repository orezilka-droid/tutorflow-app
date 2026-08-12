import { CalendarPlus, Share2, Download, ChevronRight, MessageCircle, FileText, Pencil } from "lucide-react";
import { C, STROKE } from "../lib/theme";
import { Badge, SectionCard } from "../components/Small";
import { dotFor } from "../lib/utils";
import { iso, todayISO, heDateShort, endTime, HE_DAYS, addDaysISO } from "../lib/dates";
import { DIARY } from "../assets/images";

const navBtn = { background: "none", border: `1px solid ${C.hair}`, borderRadius: 10, width: 32, height: 32,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.ink };

function LessonRow({ lesson, student, onOpen, onWA, onEdit, onSummary, onToggle, allLessons }) {
  const paid = lesson.status === "paid";
  const hasSummary = allLessons
    .filter(l => l.studentId === lesson.studentId && l.notes && l.notes.trim())
    .length > 0 || (lesson.notes && lesson.notes.trim());
  return (
    <div className="tf-hair" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotFor(lesson.subject), flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <button onClick={onOpen} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "right" }}>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: C.ink }}>{lesson.studentName}</div>
        </button>
        <div style={{ fontSize: 12, fontWeight: 300, color: C.sub }}>
          {lesson.time} – {endTime(lesson.time, lesson.duration)} · {lesson.subject}
          {paid && lesson.paidAt ? ` · שולם` : !paid ? ` · טרם שולם` : ""}
        </div>
      </div>
      {/* icon actions */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button title="שליחת תזכורת וואטסאפ" onClick={onWA}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#2e9e5b" }}>
          <MessageCircle size={18} strokeWidth={STROKE} />
        </button>
        <button title={hasSummary ? "סיכום שיעור אחרון" : "אין סיכום עדיין"} onClick={onSummary}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: hasSummary ? C.ink : C.sub }}>
          <FileText size={18} strokeWidth={STROKE} />
        </button>
        <button title="עריכת שיעור" onClick={onEdit}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.sub }}>
          <Pencil size={18} strokeWidth={STROKE} />
        </button>
        <Badge status={lesson.status} onClick={() => onToggle && onToggle(lesson.id)} />
      </div>
    </div>
  );
}

export function LessonsScreen({ lessons, students, anchor, setAnchor, view, setView, onOpenLesson, onAdd, onAll, onWA, onToggle, onEdit, onSummary, notify }) {
  const a = new Date(anchor + "T00:00:00");
  const lessonsOn = (d) => lessons.filter((l) => l.date === d).sort((x, y) => x.time.localeCompare(y.time));

  // Fix: RTL layout means "forward" should add days/months, "back" subtracts
  const shift = (dir) => {
    const d = new Date(anchor + "T00:00:00");
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * (view === "day" ? 1 : 7));
    setAnchor(iso(d));
  };

  const weekStart = addDaysISO(anchor, -a.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const label = view === "day"
    ? `${a.toLocaleDateString("he-IL", { weekday: "long" })}, ${heDateShort(anchor)}`
    : view === "week"
      ? `${heDateShort(weekDates[0])} – ${heDateShort(weekDates[6])}`
      : a.toLocaleDateString("he-IL", { month: "long", year: "numeric" });

  const first = new Date(a.getFullYear(), a.getMonth(), 1);
  const cells = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate() },
      (_, i) => iso(new Date(a.getFullYear(), a.getMonth(), i + 1))),
  ];
  const dayLessons = lessonsOn(anchor);

  return (
    <>
      {/* Top banner: export + add lesson + share */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "8px 20px 2px", gap: 4 }}>
        <button onClick={onAdd} title="הוספת שיעור חדש"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 6 }}>
          <CalendarPlus size={22} strokeWidth={STROKE} />
        </button>
        <button onClick={() => {
            const text = lessons.filter(l => l.date >= todayISO).sort((a,b) => a.date.localeCompare(b.date))
              .map(l => `${heDateShort(l.date)} ${l.time} – ${l.studentName}`).join("\n");
            if (navigator.share) navigator.share({ title: "שיעורים מתוכננים", text });
            else { navigator.clipboard?.writeText(text); notify && notify("הרשימה הועתקה"); }
          }} title="שיתוף רשימת שיעורים"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 6 }}>
          <Share2 size={22} strokeWidth={STROKE} />
        </button>
        <button onClick={() => {
            const rows = ["תלמיד,תאריך,שעה,מקצוע,מחיר,סטטוס",
              ...lessons.map(l => `${l.studentName},${l.date},${l.time},${l.subject},${l.price},${l.status === "paid" ? "שולם" : "טרם שולם"}`)];
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8;" }));
            a.download = "tutorflow-lessons.csv"; a.click();
            notify && notify("קובץ CSV נוצר");
          }} title="ייצוא לאקסל"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 6 }}>
          <Download size={22} strokeWidth={STROKE} />
        </button>
      </div>

      {/* Hero: globe LEFT, title+count RIGHT */}
      {(() => {
        const upcoming = lessons.filter(l => l.date >= todayISO).length;
        return (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, margin: "0 20px 0" }}>
            <div style={{ textAlign: "right", flex: 1, paddingBottom: 8, marginTop: -68 }}>
              <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.15, marginTop: 6 }}>שיעורים מתוכננים</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, marginTop: 4 }}>{upcoming} שיעורים קרובים</div>
            </div>
            <img src={DIARY} alt="" style={{ width: 230, marginTop: 30, pointerEvents: "none", flexShrink: 0 }} />
          </div>
        );
      })()}

      <div style={{ display: "flex", gap: 8, margin: "16px 20px 8px" }}>
        {[["day", "יומי"], ["week", "שבועי"], ["month", "חודשי"]].map(([id, l]) => (
          <button key={id} className={"tf-pill" + (view === id ? " on" : "")} style={{ flex: 1, textAlign: "center" }} onClick={() => setView(id)}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 20px 12px" }}>
        {/* RTL: right arrow = back, left arrow = forward */}
        <button onClick={() => shift(-1)} style={navBtn} title="אחורה">
          <ChevronRight size={18} strokeWidth={STROKE} style={{ transform: "scaleX(-1)" }} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 400 }}>{label}</div>
        <button onClick={() => shift(1)} style={navBtn} title="קדימה">
          <ChevronRight size={18} strokeWidth={STROKE} />
        </button>
      </div>

      {/* ── DAILY: single card with all lessons ── */}
      {view === "day" && (
        <SectionCard style={{ margin: "0 20px" }}>
          {dayLessons.length === 0 ? (
            <div style={{ padding: "20px 18px", textAlign: "center", fontSize: 13.5, fontWeight: 300, color: C.sub }}>
              אין שיעורים ביום זה. לחץ + כדי לשבץ שיעור חדש.
            </div>
          ) : dayLessons.map((l) => (
            <LessonRow key={l.id} lesson={l} student={students.find((s) => s.id === l.studentId)}
              allLessons={lessons}
              onOpen={() => onOpenLesson(l.id)}
              onWA={() => onWA(l)}
              onEdit={() => onEdit(l.id)}
              onSummary={() => onSummary(l.id)}
              onToggle={onToggle}
            />
          ))}
        </SectionCard>
      )}

      {/* ── WEEKLY ── */}
      {view === "week" && (
        <SectionCard style={{ margin: "0 20px" }}>
          {weekDates.map((d, i) => {
            const ls = lessonsOn(d);
            const isToday = d === todayISO;
            return (
              <div key={d} className={i < 6 ? "tf-hair" : ""}
                style={{ display: "flex", gap: 12, padding: "9px 14px", alignItems: "flex-start", background: isToday ? "#f6f1e2" : "transparent" }}>
                <button onClick={() => { setAnchor(d); setView("day"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", width: 42, textAlign: "center", color: C.ink, padding: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 300, color: C.sub }}>{HE_DAYS[i]}</div>
                  <div style={{ fontSize: 16, fontWeight: isToday ? 500 : 300 }}>{Number(d.slice(8, 10))}</div>
                </button>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
                  {ls.length === 0 ? (
                    <span style={{ fontSize: 12, fontWeight: 300, color: "#b8ae94", paddingTop: 6 }}>פנוי</span>
                  ) : ls.map((l) => (
                    <button key={l.id} onClick={() => onOpenLesson(l.id)}
                      style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", border: "none",
                        cursor: "pointer", fontFamily: "inherit", padding: 0, boxShadow: "0 1px 4px rgba(52,64,50,.08)" }}>
                      <div style={{ background: dotFor(l.subject), color: "#fff", padding: "6px 10px", display: "flex",
                        flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 50, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>{l.time}</span>
                        <span style={{ fontSize: 10, fontWeight: 300, opacity: .85, lineHeight: 1.3 }}>{endTime(l.time, l.duration)}</span>
                      </div>
                      <div style={{ flex: 1, background: C.card, padding: "6px 12px", textAlign: "right", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.subject}</div>
                        <div style={{ fontSize: 11, fontWeight: 300, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.studentName}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", padding: "0 10px", background: C.card,
                        fontSize: 10.5, fontWeight: 300, color: l.status === "paid" ? C.paidTx : C.unpaidTx, flexShrink: 0 }}>
                        {l.status === "paid" ? "שולם" : "טרם"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </SectionCard>
      )}

      {/* ── MONTHLY: calendar first, then day lessons below ── */}
      {view === "month" && (
        <>
          <SectionCard style={{ margin: "0 20px 12px", padding: "12px 12px 14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
              {HE_DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 300, color: C.sub }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {cells.map((d, i) => d === null ? <div key={"e" + i} /> : (() => {
                const ls = lessonsOn(d);
                const isToday = d === todayISO;
                const isSelected = d === anchor;
                return (
                  <button key={d} onClick={() => setAnchor(d)}
                    style={{ aspectRatio: "1 / 0.8", border: `1px solid ${isToday ? "#c8b98f" : C.hair}`, background: isSelected ? "#e8e2d0" : C.card, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", color: C.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 500 : 300 }}>{Number(d.slice(8, 10))}</span>
                    <span style={{ display: "flex", gap: 2, height: 5 }}>
                      {ls.slice(0, 3).map((l) => <i key={l.id} style={{ width: 5, height: 5, borderRadius: "50%", background: dotFor(l.subject) }} />)}
                    </span>
                  </button>
                );
              })())}
            </div>
          </SectionCard>
          {/* Day lessons below calendar */}
          <div style={{ fontSize: 15, fontWeight: 400, margin: "0 22px 8px" }}>
            {heDateShort(anchor)}
          </div>
          <SectionCard style={{ margin: "0 20px" }}>
            {dayLessons.length === 0 ? (
              <div style={{ padding: "16px 18px", fontSize: 13.5, fontWeight: 300, color: C.sub, textAlign: "center" }}>אין שיעורים ביום זה.</div>
            ) : dayLessons.map((l) => (
              <LessonRow key={l.id} lesson={l} student={students.find((s) => s.id === l.studentId)}
                allLessons={lessons}
                onOpen={() => onOpenLesson(l.id)}
                onWA={() => onWA(l)}
                onEdit={() => onEdit(l.id)}
                onSummary={() => onSummary(l.id)}
                onToggle={onToggle}
              />
            ))}
          </SectionCard>
        </>
      )}
    </>
  );
}
