import { useState } from "react";
import { ArrowRight, Trash2, Pencil, Calendar, MapPin, FileText, Phone, Paperclip, Link2 } from "lucide-react";
import { C, STROKE } from "../lib/theme";
import { Badge } from "../components/Small";
import { heDateShort, endTime } from "../lib/dates";
import { LESSON_BG_B64 } from "../assets/images";

/* ================= Lesson detail overlay =================
   Note: student.location has no DB column, so the "מיקום" row always
   falls back to the default "אונליין (זום)" text — same fallback the
   original source already used when location was unset. */
export function LessonDetail({ lesson, student, allLessons, onClose, onToggle, onWA, onShowUnpaid, onEdit, onSaveSummary, onUploadAttachment, onDelete }) {
  const prev = allLessons
    .filter((l) => l.studentId === lesson.studentId && l.id !== lesson.id && l.date <= lesson.date)
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const paid = lesson.status === "paid";
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSaveSummary = () => {
    onSaveSummary && onSaveSummary({ notes: summaryText.trim(), attachmentUrl: attachmentUrl.trim() || null });
    setShowSummary(false);
    setSummaryText("");
    setAttachmentUrl("");
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAttachment) return;
    setUploading(true);
    try {
      const url = await onUploadAttachment(file);
      setAttachmentUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 30, display: "flex", justifyContent: "center", background: "#efeadd", overflowY: "auto" }} dir="rtl">
      <div style={{ width: "100%", maxWidth: 430, background: C.cream, minHeight: "100%", paddingBottom: 30, fontFamily: "'Assistant',sans-serif", color: C.ink }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 8px" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink }}>
            <ArrowRight size={22} strokeWidth={STROKE} />
          </button>
          <div style={{ fontSize: 18, fontWeight: 400 }}>פרטי שיעור</div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button onClick={onDelete} title="מחיקת שיעור"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#c04040", padding: 0 }}>
              <Trash2 size={20} strokeWidth={STROKE} />
            </button>
            <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 0 }}>
              <Pencil size={20} strokeWidth={STROKE} />
            </button>
          </div>
        </div>

        <div style={{ margin: "6px 20px 14px", borderRadius: 18, overflow: "hidden", position: "relative", minHeight: 165,
          backgroundImage: `url(${LESSON_BG_B64})`, backgroundSize: "cover", backgroundPosition: "center",
          boxShadow: "0 4px 14px rgba(52,64,50,.18)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* name + subject — top */}
          <div style={{ position: "relative", zIndex: 2, padding: "22px 22px 0", color: "#efe9d8" }}>
            <div style={{ fontSize: 30, fontWeight: 400, letterSpacing: ".3px", lineHeight: 1.15 }}>{lesson.studentName}</div>
            <div style={{ fontSize: 15, fontWeight: 300, opacity: .88, marginTop: 1 }}>{lesson.subject || student?.subject}</div>
          </div>
          {/* status badge — bottom */}
          <div style={{ position: "relative", zIndex: 2, padding: "0 22px 18px" }}>
            {paid ? (
              <span style={{ background: C.sage, color: "#f4f0e2", fontSize: 13, fontWeight: 400, padding: "5px 18px", borderRadius: 99 }}>שולם</span>
            ) : (
              <button onClick={() => onShowUnpaid && onShowUnpaid(lesson.studentId)}
                style={{ background: "#c9a95c", color: "#3a2e0e", fontSize: 13, fontWeight: 600, padding: "5px 18px",
                  borderRadius: 99, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                חוב פתוח ↗
              </button>
            )}
          </div>
        </div>

        <div className="tf-card" style={{ margin: "0 20px" }}>
          {/* date + time on one row */}
          <div className="tf-hair" style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 18px" }}>
            <Calendar size={20} strokeWidth={STROKE} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, flexShrink: 0 }}>תאריך ושעה</div>
            <div style={{ fontSize: 15, fontWeight: 400, marginRight: "auto" }}>
              {heDateShort(lesson.date)} · {lesson.time} – {endTime(lesson.time, lesson.duration)}
            </div>
          </div>
          {[[MapPin, "מיקום", student?.location || "אונליין (זום)"],
            [FileText, "הערות כלליות", student?.notes || "—"]].map(([I, label, val], i, arr) => (
            <div key={label} className={i < arr.length - 1 ? "tf-hair" : ""} style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "11px 18px" }}>
              <I size={20} strokeWidth={STROKE} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 14, fontWeight: 300, color: C.sub, width: 62, flexShrink: 0, paddingTop: 1 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 400, marginRight: "auto", textAlign: "left", lineHeight: 1.45 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: "0 20px", display: "flex", gap: 10 }}>
          <button onClick={onWA}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: C.green2, color: C.boardTx, border: "none", borderRadius: 16, padding: "12px 14px",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 400 }}>
            <Phone size={20} strokeWidth={STROKE} />
            שליחת וואטסאפ
          </button>
          <button onClick={() => { setSummaryText(lesson.notes || ""); setAttachmentUrl(lesson.attachmentUrl || ""); setShowSummary(true); }}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: C.card, color: C.ink, border: `1px solid ${C.hair}`, borderRadius: 16, padding: "12px 14px",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 400 }}>
            <FileText size={20} strokeWidth={STROKE} />
            הוסף סיכום
          </button>
        </div>

        {/* ── Summary popup ── */}
        {showSummary && (
          <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
            <div onClick={() => setShowSummary(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.38)" }} />
            <div style={{ position: "relative", width: 340, background: C.card, borderRadius: 20, padding: "22px 20px 18px",
              boxShadow: "0 16px 40px rgba(38,37,31,.22)", fontFamily: "'Assistant',sans-serif", color: C.ink }}>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
                סיכום שיעור · {heDateShort(lesson.date)}
              </div>
              <textarea
                className="tf-input"
                rows={5}
                autoFocus
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="מה עברנו היום? איפה הייתה התקדמות? מה לחזור בפעם הבאה?"
              />

              <label className="tf-label" style={{ marginTop: 12, display: "block" }}>קובץ או קישור לסיכום (אופציונלי)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Link2 size={15} strokeWidth={STROKE} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: C.sub }} />
                  <input className="tf-input" dir="ltr" value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://..." style={{ paddingRight: 32, fontSize: 13 }} />
                </div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40,
                  borderRadius: 10, border: `1px solid ${C.hair}`, background: C.cream, cursor: "pointer", flexShrink: 0 }}>
                  <Paperclip size={17} strokeWidth={STROKE} style={{ color: C.sub }} />
                  <input type="file" onChange={handleFilePick} style={{ display: "none" }} />
                </label>
              </div>
              {uploading && <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>מעלה קובץ…</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={() => setShowSummary(false)} className="tf-ghost" style={{ flex: 1, padding: "9px" }}>ביטול</button>
                <button onClick={handleSaveSummary}
                  style={{ flex: 1, background: C.green, color: C.boardTx, border: "none", borderRadius: 12,
                    padding: "9px", fontSize: 14.5, fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                  שמירה
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Last summary ── */}
        {(() => {
          // Show current lesson's notes, OR fall back to most recent prev with notes
          const withNotes = [lesson, ...prev].filter(l => l.notes && l.notes.trim());
          const last = withNotes[0];
          if (!last) return (
            <div className="tf-card" style={{ margin: "16px 20px 0", padding: "15px 18px" }}>
              <div style={{ fontSize: 15.5, marginBottom: 6 }}>סיכום שיעור אחרון</div>
              <div style={{ fontSize: 13, fontWeight: 300, color: C.sub, fontStyle: "italic" }}>
                טרם נוסף סיכום לשיעורים. לחץ על "הוסף סיכום" כדי להתחיל.
              </div>
            </div>
          );
          return (
            <div className="tf-card" style={{ margin: "16px 20px 0", padding: "15px 18px" }}>
              <div style={{ fontSize: 15.5, marginBottom: 8 }}>סיכום שיעור אחרון</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 300, color: C.sub }}>
                  {heDateShort(last.date)} · {last.time} – {endTime(last.time, last.duration)}
                </span>
                <Badge status={last.status} onClick={() => {}} />
              </div>
              <div style={{ background: "#f7f3ea", borderRadius: 12, padding: "10px 13px", fontSize: 13.5, fontWeight: 300, color: "#4a463a", lineHeight: 1.6 }}>
                {last.notes}
              </div>
              {last.attachmentUrl && (
                <a href={last.attachmentUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, color: C.green, textDecoration: "none" }}>
                  <Paperclip size={14} strokeWidth={STROKE} />
                  קובץ מצורף
                </a>
              )}
              {/* All previous summaries */}
              {withNotes.slice(1).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 400, color: C.sub, marginBottom: 8 }}>סיכומים קודמים</div>
                  {withNotes.slice(1).map((l, i) => (
                    <div key={l.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < withNotes.slice(1).length - 1 ? `1px solid ${C.hair}` : "none" }}>
                      <div style={{ fontSize: 12, fontWeight: 300, color: C.sub, marginBottom: 4 }}>
                        {heDateShort(l.date)} · {l.time}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 300, color: "#4a463a", lineHeight: 1.55 }}>{l.notes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
