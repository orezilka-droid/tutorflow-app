import { useState, useMemo, useEffect, useRef } from "react";
import {
  Menu, Calendar, Users, Wallet, MessageCircle, Home,
  Download, Settings2, Trash2, LogOut, X,
} from "lucide-react";
import { C, STROKE } from "./lib/theme";
import { todayISO, today, iso, heDateShort } from "./lib/dates";
import { openWhatsApp, fillTemplate, defaultSettings } from "./lib/utils";
import { Sheet, Badge } from "./components/Small";
import {
  fetchAllData, dbInsertStudent, dbUpdateStudent, dbClearStudents,
  dbInsertLesson, dbUpdateLesson, dbDeleteLesson, dbClearLessons,
  dbUpdateTemplateBody, dbInsertTemplateRow, dbSaveSettings,
} from "./lib/db";

import { HomeTab } from "./screens/HomeTab";
import { LessonsScreen } from "./screens/LessonsScreen";
import { StudentsTab } from "./screens/StudentsTab";
import { PaymentsTab } from "./screens/PaymentsTab";
import { MessagesTab } from "./screens/MessagesTab";
import { SettingsTab } from "./screens/SettingsTab";
import { LessonDetail } from "./screens/LessonDetail";
import { StudentProfile } from "./screens/StudentProfile";
import { AddStudent } from "./screens/AddStudent";
import { AddLesson } from "./screens/AddLesson";
import { EditLesson } from "./screens/EditLesson";
import { AllLessons } from "./screens/AllLessons";
import { ExportModal } from "./screens/ExportModal";

export function TutorFlowApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [loading, setLoading] = useState(true);

  // Teacher name / default rate / default duration / inactive-after-days,
  // persisted in the `settings` table (one row per user).
  const [settings, setSettings] = useState(defaultSettings);

  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [templateRows, setTemplateRows] = useState([]); // [{id,key,label,body}]

  const [range, setRange] = useState("weekly");
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lessonView, setLessonView] = useState("day");
  const [anchorISO, setAnchorISO] = useState(todayISO);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [showSummaryFor, setShowSummaryFor] = useState(null); // lesson id
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [unpaidFilter, setUnpaidFilter] = useState(null); // null = all, number = specific studentId
  const [editLessonId, setEditLessonId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  /* ---- initial load from Supabase ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllData(user.id);
        if (cancelled) return;
        setStudents(data.students);
        setLessons(data.lessons);
        setTemplateRows(data.templateRows);
        setSettings(data.settings);
      } catch (e) {
        console.error(e);
        notify("שגיאה בטעינת הנתונים");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  /* ---- templates: derived object + custom-template list, from templateRows ---- */
  const templates = useMemo(() => {
    const o = {};
    templateRows.forEach(r => { o[r.key] = r.body; });
    return o;
  }, [templateRows]);

  const customTemplates = useMemo(() =>
    templateRows
      .filter(r => /^custom_\d+$/.test(r.key))
      .sort((a, b) => a.id - b.id)
      .map(r => ({ key: r.key, label: r.label })),
    [templateRows]
  );

  const templateSaveTimers = useRef({});
  const handleChangeTemplate = (key, body) => {
    setTemplateRows((prev) => prev.map((r) => (r.key === key ? { ...r, body } : r)));
    const row = templateRows.find((r) => r.key === key);
    if (!row) return; // shouldn't happen — body edits only ever target an existing row
    clearTimeout(templateSaveTimers.current[key]);
    templateSaveTimers.current[key] = setTimeout(() => {
      dbUpdateTemplateBody(user.id, row.id, body).catch((e) => {
        console.error(e);
        notify("שגיאה בשמירת התבנית");
      });
    }, 600);
  };

  const handleAddCustomTemplate = async (label) => {
    const nextIndex = customTemplates.length;
    const key = `custom_${nextIndex}`;
    try {
      const created = await dbInsertTemplateRow(user.id, key, label, "");
      setTemplateRows((prev) => [...prev, created]);
    } catch (e) {
      console.error(e);
      notify("שגיאה בהוספת תבנית");
    }
  };

  /* ---- students with derived totalHours (no total_hours column in DB) ---- */
  const studentsWithHours = useMemo(() => students.map((s) => ({
    ...s,
    totalHours: +(lessons.filter((l) => l.studentId === s.id).reduce((sum, l) => sum + l.duration / 60, 0)).toFixed(1),
  })), [students, lessons]);

  /* ---- derived ---- */
  const todaysLessons = useMemo(
    () => lessons.filter((l) => l.date === todayISO).sort((a, b) => a.time.localeCompare(b.time)),
    [lessons]
  );
  const rangeLessons = useMemo(() => {
    const y = today.getFullYear(), m = today.getMonth();
    let start, end;
    if (range === "weekly") {
      const s = new Date(today); s.setDate(s.getDate() - s.getDay());
      const e = new Date(s); e.setDate(e.getDate() + 6);
      start = iso(s); end = iso(e);
    } else if (range === "monthly") {
      start = iso(new Date(y, m, 1)); end = iso(new Date(y, m + 1, 0));
    } else {
      start = iso(new Date(y, 0, 1)); end = iso(new Date(y, 11, 31));
    }
    return lessons.filter((l) => l.date >= start && l.date <= end);
  }, [lessons, range]);

  const daysAgoLocal = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };

  // Dynamic active status — must be defined BEFORE stats
  const getStudentActive = (s) => {
    if (s.active === false) return false;
    const threshold = daysAgoLocal(settings.inactiveAfterDays);
    const last = lessons.filter(l => l.studentId === s.id).sort((a,b) => b.date.localeCompare(a.date))[0];
    const autoActive = last ? last.date >= threshold : false;
    if (s.active === true) return true;
    return autoActive;
  };

  const unpaidByStudent = useMemo(() => {
    const m = {};
    rangeLessons.filter((l) => l.status === "unpaid" && new Date(l.date + "T" + l.time) <= new Date()).forEach((l) => {
      if (!m[l.studentId]) m[l.studentId] = { student: studentsWithHours.find((s) => s.id === l.studentId), sum: 0, last: l };
      m[l.studentId].sum += l.price;
      if (l.date > m[l.studentId].last.date) m[l.studentId].last = l;
    });
    return Object.values(m).sort((a, b) => b.sum - a.sum);
  }, [rangeLessons, studentsWithHours]);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) || null;
  const selectedStudent = studentsWithHours.find((s) => s.id === selectedStudentId) || null;
  const editLesson = lessons.find((l) => l.id === editLessonId) || null;

  /* ---- actions ---- */
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [conflictLesson, setConflictLesson] = useState(null);
  const [pendingLesson, setPendingLesson] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // lesson id to delete

  const toggleStatus = async (id) => {
    const l = lessons.find(x => x.id === id);
    if (!l) return;
    const newStatus = l.status === "paid" ? "unpaid" : "paid";
    const patch = { status: newStatus, paidAt: newStatus === "paid" ? todayISO : null };
    setLessons((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    try {
      await dbUpdateLesson(user.id, id, patch);
    } catch (e) {
      console.error(e);
      notify("שגיאה בעדכון סטטוס התשלום");
    }
  };

  const requestToggle = (id) => setConfirmToggle(id);
  const confirmToggleFn = () => { toggleStatus(confirmToggle); setConfirmToggle(null); };

  const deleteLesson = async (id) => {
    setLessons((p) => p.filter((l) => l.id !== id));
    setSelectedLessonId(null);
    setEditLessonId(null);
    setConfirmDelete(null);
    try {
      await dbDeleteLesson(user.id, id);
      notify("השיעור נמחק");
    } catch (e) {
      console.error(e);
      notify("שגיאה במחיקת השיעור");
    }
  };

  const updateLesson = async (id, patch) => {
    setLessons((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    try {
      await dbUpdateLesson(user.id, id, patch);
      notify("השיעור עודכן");
    } catch (e) {
      console.error(e);
      notify("שגיאה בעדכון השיעור");
    }
  };

  const [templatePicker, setTemplatePicker] = useState(null); // lesson for template picker

  const sendLessonWA = (lesson) => setTemplatePicker(lesson);

  const exportCSV = () => {
    const rows = ["שם,טלפון,כיתה,מקצוע,תעריף שעתי,סהכ שעות",
      ...studentsWithHours.map((s) => [s.name, s.phone, s.grade, s.subject, s.hourlyRate, s.totalHours].join(","))];
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tutorflow-students.csv"; a.click();
    URL.revokeObjectURL(url);
    notify("קובץ CSV נוצר והורד");
  };

  const addLesson = (form, sendConfirm) => {
    const s = students.find((x) => x.id === Number(form.studentId));
    if (!s) return;
    const dur = Number(form.duration) || 60;
    const newStart = form.time.replace(":", "");
    const newEnd = (() => {
      const [h, m] = form.time.split(":").map(Number);
      const e = h * 60 + m + dur;
      return String(Math.floor(e / 60) % 24).padStart(2,"0") + String(e % 60).padStart(2,"0");
    })();
    const clash = lessons.find(l => {
      if (l.date !== form.date) return false;
      const ls = l.time.replace(":","");
      const le = (() => {
        const [h,m] = l.time.split(":").map(Number);
        const e = h*60+m+l.duration;
        return String(Math.floor(e/60)%24).padStart(2,"0")+String(e%60).padStart(2,"0");
      })();
      return newStart < le && newEnd > ls;
    });
    if (clash) {
      setConflictLesson(clash);
      setPendingLesson({ form, sendConfirm });
      return;
    }
    doAddLesson(form, sendConfirm);
  };

  const doAddLesson = async (form, sendConfirm) => {
    const s = students.find((x) => x.id === Number(form.studentId));
    if (!s) return;
    const dur = Number(form.duration);
    const draft = {
      studentId: s.id, studentName: s.name,
      date: form.date, time: form.time, duration: dur, price: Number(form.price), status: "unpaid",
      subject: (form.subject || "").trim() || s.subject, notes: (form.notes || "").trim(), paidAt: null,
    };
    try {
      const created = await dbInsertLesson(user.id, draft);
      setLessons((p) => [...p, created]);
      setShowAdd(false);
      setConflictLesson(null); setPendingLesson(null);
      notify("השיעור נוסף ליומן");
      if (sendConfirm)
        openWhatsApp(s.phone, fillTemplate(templates.confirmation, { studentName: s.name, date: form.date, time: form.time, price: form.price }));
    } catch (e) {
      console.error(e);
      notify("שגיאה בהוספת השיעור");
    }
  };

  const addStudent = async (f) => {
    const draft = {
      name: f.name.trim(), phone: f.phone.trim(), grade: f.grade.trim() || "—",
      subject: f.subject.trim(), hourlyRate: Number(f.hourlyRate),
      notes: f.notes.trim() || "—",
    };
    try {
      const created = await dbInsertStudent(user.id, draft);
      setStudents((p) => [...p, created]);
      setShowAddStudent(false);
      notify("התלמיד/ה נוספו בהצלחה");
    } catch (e) {
      console.error(e);
      notify("שגיאה בהוספת תלמיד/ה");
    }
  };

  const updateStudent = async (id, patch) => {
    setStudents((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    try {
      await dbUpdateStudent(user.id, id, patch);
      notify("ההגדרות נשמרו");
    } catch (e) {
      console.error(e);
      notify("שגיאה בשמירת ההגדרות");
    }
  };

  const filteredStudents = studentsWithHours.filter((s) => {
    const q = search.trim();
    return !q || s.name.includes(q) || s.subject.includes(q) || s.grade.includes(q);
  }).sort((a, b) => a.name.localeCompare(b.name, "he"));

  const NAV = [
    { id: "home", label: "בית", icon: Home },
    { id: "lessons", label: "שיעורים", icon: Calendar },
    { id: "students", label: "תלמידים", icon: Users },
    { id: "payments", label: "תשלומים", icon: Wallet },
    { id: "more", label: "הודעות", icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: "#efeadd", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Assistant',sans-serif", color: C.sub }}>
        טוען נתונים...
      </div>
    );
  }

  /* ================= render ================= */
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#efeadd", display: "flex", justifyContent: "center", fontFamily: "'Assistant',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600&family=Lora:ital@1&family=Hina+Mincho&family=Fredoka:wght@400;500;600&display=swap');
        .tf-card{background:${C.card};border:1px solid ${C.hair};border-radius:18px;box-shadow:0 2px 8px rgba(52,64,50,.04);}
        .tf-badge{font-size:12px;font-weight:400;padding:3px 13px;border-radius:99px;white-space:nowrap;border:none;cursor:pointer;font-family:inherit;}
        .tf-hair{border-bottom:1px solid ${C.hair};}
        .tf-ghost{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid #b9b09a;color:${C.ink};
          font-weight:400;font-size:14px;padding:9px;border-radius:12px;background:${C.card};cursor:pointer;font-family:inherit;flex:1;}
        .tf-input{width:100%;background:${C.card};border:1px solid ${C.hair};border-radius:12px;padding:11px 13px;font-size:14.5px;
          font-family:inherit;color:${C.ink};outline:none;font-weight:400;}
        .tf-input:focus{border-color:#b9b09a;}
        .tf-label{display:block;font-size:13px;font-weight:300;color:${C.sub};margin-bottom:5px;}
        .tf-pill{border:1px solid ${C.hair};background:${C.card};color:${C.sub};font-size:13.5px;font-weight:400;
          padding:7px 18px;border-radius:99px;cursor:pointer;font-family:inherit;}
        .tf-pill.on{background:#6a7870;border-color:#6a7870;color:#f0ede6;}
        .tf-q{background:${C.card};border:1px solid ${C.hair};border-radius:16px;padding:11px 2px 9px;display:flex;flex-direction:column;
          align-items:center;gap:7px;font-size:13.5px;font-weight:400;color:${C.ink};cursor:pointer;font-family:inherit;}
        button{-webkit-tap-highlight-color:transparent;}
        textarea.tf-input{resize:vertical;line-height:1.55;}
        select.tf-input{appearance:none;}
        *{box-sizing:border-box;}
      `}</style>

      <div style={{ width: "100%", maxWidth: 430, background: C.cream, minHeight: "100vh", position: "relative", paddingBottom: 86, color: C.ink }}>

        {/* ============ HOME ============ */}
        {tab === "home" && (
          <HomeTab
            settings={settings} students={studentsWithHours} lessons={lessons}
            todaysLessons={todaysLessons} unpaidByStudent={unpaidByStudent}
            setShowMenu={setShowMenu} setShowAdd={setShowAdd} setTab={setTab}
            setSelectedLessonId={setSelectedLessonId} sendLessonWA={sendLessonWA}
            requestToggle={requestToggle} setShowUnpaid={setShowUnpaid}
          />
        )}

        {/* ============ LESSONS ============ */}
        {tab === "lessons" && (
          <LessonsScreen
            lessons={lessons} students={studentsWithHours}
            anchor={anchorISO} setAnchor={setAnchorISO}
            view={lessonView} setView={setLessonView}
            onOpenLesson={(id) => setSelectedLessonId(id)}
            onAdd={() => setShowAdd(true)}
            onAll={() => setShowAllLessons(true)}
            onWA={sendLessonWA}
            onToggle={requestToggle}
            onEdit={(id) => setEditLessonId(id)}
            onSummary={(id) => setShowSummaryFor(id)}
            notify={notify}
          />
        )}

        {/* ============ STUDENTS ============ */}
        {tab === "students" && (() => {
          const activeCount = studentsWithHours.filter(s => getStudentActive(s)).length;
          const totalCount = studentsWithHours.length;
          return (
          <StudentsTab
            students={filteredStudents}
            lessons={lessons}
            activeCount={activeCount}
            totalCount={totalCount}
            getStudentActive={getStudentActive}
            search={search}
            setSearch={setSearch}
            onAdd={() => setShowAddStudent(true)}
            onExport={exportCSV}
            onOpenProfile={(id) => setSelectedStudentId(id)}
            onSummary={(studentId) => {
              const l = lessons.filter(x => x.studentId === studentId && x.notes?.trim()).sort((a,b) => b.date.localeCompare(a.date))[0];
              if (l) setShowSummaryFor(l.id);
              else { notify("אין סיכומים עדיין לתלמיד/ה זו"); }
            }}
            onWA={(student) => {
              const last = lessons.filter(l => l.studentId === student.id).sort((a,b) => b.date.localeCompare(a.date))[0];
              if (last) setTemplatePicker(last);
              else openWhatsApp(student.phone, `היי ${student.name}! `);
            }}
          />
          );
        })()}

        {/* ============ PAYMENTS ============ */}
        {tab === "payments" && (
          <PaymentsTab
            lessons={lessons}
            students={studentsWithHours}
            unpaidByStudent={unpaidByStudent}
            templates={templates}
            onOpenWhatsApp={openWhatsApp}
            onShowUnpaid={() => setShowUnpaid(true)}
            fillTemplate={fillTemplate}
            onToggle={toggleStatus}
          />
        )}

        {/* ============ MORE / SETTINGS ============ */}
        {tab === "more" && (
          <MessagesTab
            templates={templates}
            customTemplates={customTemplates}
            onChangeTemplate={handleChangeTemplate}
            onAddCustomTemplate={handleAddCustomTemplate}
            fillTemplate={fillTemplate}
          />
        )}

        {/* ============ BOTTOM NAV ============ */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.cream, borderTop: `1px solid ${C.hair}`, display: "flex", justifyContent: "space-around", padding: "10px 8px 18px", zIndex: 20 }}>
          {NAV.map((n) => {
            const on = tab === n.id;
            return (
              <button key={n.id} onClick={() => { setTab(n.id); setSelectedLessonId(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 11.5, fontFamily: "inherit", fontWeight: on ? 500 : 300, color: on ? "#6f7f75" : C.sub }}>
                <n.icon size={22} strokeWidth={STROKE} fill={on && n.id === "home" ? "#6f7f75" : "none"} />
                {n.label}
              </button>
            );
          })}
        </div>

        {/* ============ LESSON DETAIL OVERLAY ============ */}
        {selectedLesson && (
          <LessonDetail
            lesson={selectedLesson}
            student={studentsWithHours.find((s) => s.id === selectedLesson.studentId)}
            allLessons={lessons}
            onClose={() => setSelectedLessonId(null)}
            onToggle={() => requestToggle(selectedLesson.id)}
            onWA={() => sendLessonWA(selectedLesson)}
            onEdit={() => { setSelectedLessonId(null); setTimeout(() => setEditLessonId(selectedLesson.id), 60); }}
            onSaveSummary={(notes) => updateLesson(selectedLesson.id, { notes })}
            onDelete={() => setConfirmDelete(selectedLesson.id)}
            onShowUnpaid={(sid) => { setSelectedLessonId(null); setUnpaidFilter(sid); setTimeout(() => setShowUnpaid(true), 80); }}
          />
        )}

        {/* ============ STUDENT MODAL ============ */}
        {selectedStudent && (
          <StudentProfile
            student={selectedStudent}
            lessons={lessons}
            onClose={() => setSelectedStudentId(null)}
            onToggleLesson={requestToggle}
            onUpdate={updateStudent}
          />
        )}

        {/* ============ ADD STUDENT MODAL ============ */}
        {showAddStudent && <AddStudent onClose={() => setShowAddStudent(false)} onSubmit={addStudent} />}

        {/* ============ ADD LESSON MODAL ============ */}
        {showAdd && <AddLesson students={studentsWithHours} defaultDate={tab === "lessons" ? anchorISO : todayISO} onClose={() => setShowAdd(false)} onSubmit={addLesson} />}

        {/* ============ UNPAID DRAWER ============ */}
        {showUnpaid && (() => {
          const filtered = unpaidFilter
            ? lessons.filter(l => l.studentId === unpaidFilter && l.status === "unpaid")
                     .sort((a,b) => b.date.localeCompare(a.date))
            : lessons.filter(l => l.status === "unpaid")
                     .sort((a,b) => b.date.localeCompare(a.date));
          const title = unpaidFilter
            ? `חובות · ${studentsWithHours.find(s=>s.id===unpaidFilter)?.name}`
            : "ממתין לגבייה";
          return (
            <Sheet title={title} onClose={() => { setShowUnpaid(false); setUnpaidFilter(null); }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "18px 0", textAlign: "center", fontSize: 13.5, fontWeight: 300, color: C.sub }}>
                  אין חובות פתוחים. נהדר!
                </div>
              ) : (
                <div className="tf-card">
                  {filtered.map((l, i) => {
                    const st = studentsWithHours.find(s => s.id === l.studentId);
                    return (
                      <div key={l.id} className={i < filtered.length - 1 ? "tf-hair" : ""}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {!unpaidFilter && <div style={{ fontSize: 14, fontWeight: 500 }}>{l.studentName}</div>}
                          <div style={{ fontSize: 12.5, fontWeight: 300, color: C.sub }}>
                            {heDateShort(l.date)} · {l.time} · ₪{l.price}
                          </div>
                        </div>
                        <button className="tf-ghost" style={{ flex: "none", padding: "5px 11px", fontSize: 12 }}
                          onClick={() => st && openWhatsApp(st.phone,
                            fillTemplate(templates.payment, { studentName: l.studentName, date: l.date, time: l.time, price: l.price }))}>
                          תזכורת
                        </button>
                        <Badge status={l.status} onClick={() => requestToggle(l.id)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Sheet>
          );
        })()}

        {/* ============ EDIT LESSON ============ */}
        {editLesson && (
          <EditLesson lesson={editLesson} onClose={() => setEditLessonId(null)}
            onSave={updateLesson} onDelete={deleteLesson} />
        )}

        {/* ============ ALL LESSONS ============ */}
        {showAllLessons && (
          <AllLessons lessons={lessons} onClose={() => setShowAllLessons(false)}
            onPick={(id) => { setShowAllLessons(false); setEditLessonId(id); }} />
        )}

        {/* ============ CONFIRM TOGGLE ============ */}
        {confirmToggle !== null && (() => {
          const l = lessons.find(x => x.id === confirmToggle);
          const willBePaid = l?.status === "unpaid";
          return (
            <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
              <div onClick={() => setConfirmToggle(null)}
                style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.38)" }} />
              <div style={{ position: "relative", width: 310, background: C.card, borderRadius: 20, padding: "24px 22px 18px",
                boxShadow: "0 16px 40px rgba(38,37,31,.22)", fontFamily: "'Assistant',sans-serif", color: C.ink }}>
                <div style={{ fontSize: 16.5, fontWeight: 500, marginBottom: 8 }}>האם אתה בטוח?</div>
                <div style={{ fontSize: 13.5, fontWeight: 300, color: C.sub, lineHeight: 1.55, marginBottom: 18 }}>
                  {willBePaid
                    ? `לסמן את השיעור מ-${l ? heDateShort(l.date) : ""} כ"שולם"?`
                    : `לסמן את השיעור מ-${l ? heDateShort(l.date) : ""} כ"טרם שולם"?`}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmToggle(null)} className="tf-ghost" style={{ flex: 1, padding: "9px" }}>
                    ביטול
                  </button>
                  <button onClick={confirmToggleFn}
                    style={{ flex: 1, background: willBePaid ? C.green : "#c9a95c", color: willBePaid ? C.boardTx : "#3a2e0e",
                      border: "none", borderRadius: 12, padding: "9px", fontSize: 14.5, fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit" }}>
                    {willBePaid ? "סמן כשולם" : "סמן כטרם שולם"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ============ SUMMARY POPUP (from lessons screen) ============ */}
        {showSummaryFor !== null && (() => {
          const l = lessons.find(x => x.id === showSummaryFor);
          const studentLessons = lessons.filter(x => x.studentId === l?.studentId);
          const withNotes = studentLessons.filter(x => x.notes && x.notes.trim()).sort((a,b) => b.date.localeCompare(a.date));
          return (
            <Sheet title={`סיכומים · ${l?.studentName}`} onClose={() => setShowSummaryFor(null)}>
              {withNotes.length === 0 ? (
                <div style={{ fontSize: 13.5, fontWeight: 300, color: C.sub, fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
                  טרם נוסף סיכום לשיעורים של תלמיד/ה זו.
                </div>
              ) : withNotes.map((x, i) => (
                <div key={x.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < withNotes.length - 1 ? `1px solid ${C.hair}` : "none" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 300, color: C.sub, marginBottom: 4 }}>
                    {heDateShort(x.date)} · {x.time}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 300, color: C.ink, lineHeight: 1.6, background: "#f7f3ea", borderRadius: 10, padding: "9px 12px" }}>
                    {x.notes}
                  </div>
                </div>
              ))}
            </Sheet>
          );
        })()}

        {/* ============ CONFLICT WARNING ============ */}
        {conflictLesson && pendingLesson && (
          <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
            <div onClick={() => { setConflictLesson(null); setPendingLesson(null); }}
              style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.38)" }} />
            <div style={{ position: "relative", width: 320, background: "#fffdf8", borderRadius: 20, padding: "22px 20px 18px",
              boxShadow: "0 16px 40px rgba(38,37,31,.22)", fontFamily: "'Assistant',sans-serif", color: "#26251f" }}>
              <div style={{ fontSize: 16.5, fontWeight: 500, marginBottom: 8, color: "#c04040" }}>⚠️ חפיפה בזמנים</div>
              <div style={{ fontSize: 13.5, fontWeight: 300, color: "#5d574a", lineHeight: 1.55, marginBottom: 16 }}>
                קיים כבר שיעור עם <strong>{conflictLesson.studentName}</strong> בתאריך זה בין{" "}
                {conflictLesson.time} ל-
                {(() => {
                  const [h, m] = conflictLesson.time.split(":").map(Number);
                  const e = h * 60 + m + conflictLesson.duration;
                  return `${String(Math.floor(e / 60) % 24).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
                })()}.
                האם לקבוע את השיעור החדש בכל זאת?
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setConflictLesson(null); setPendingLesson(null); }}
                  className="tf-ghost" style={{ flex: 1, padding: "9px" }}>ביטול</button>
                <button onClick={() => doAddLesson(pendingLesson.form, pendingLesson.sendConfirm)}
                  style={{ flex: 1, background: "#c04040", color: "#fff", border: "none", borderRadius: 12,
                    padding: "9px", fontSize: 14.5, fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                  קבע בכל זאת
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ DELETE CONFIRM ============ */}
        {confirmDelete !== null && (() => {
          const l = lessons.find(x => x.id === confirmDelete);
          return (
            <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
              <div onClick={() => setConfirmDelete(null)}
                style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.38)" }} />
              <div style={{ position: "relative", width: 310, background: "#fffdf8", borderRadius: 20, padding: "22px 20px 18px",
                boxShadow: "0 16px 40px rgba(38,37,31,.22)", fontFamily: "'Assistant',sans-serif", color: "#26251f" }}>
                <div style={{ fontSize: 16.5, fontWeight: 500, marginBottom: 8 }}>מחיקת שיעור</div>
                <div style={{ fontSize: 13.5, fontWeight: 300, color: "#5d574a", lineHeight: 1.55, marginBottom: 16 }}>
                  האם למחוק את השיעור עם <strong>{l?.studentName}</strong> ב-{l ? heDateShort(l.date) : ""}?
                  פעולה זו אינה ניתנת לביטול.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmDelete(null)} className="tf-ghost" style={{ flex: 1, padding: "9px" }}>ביטול</button>
                  <button onClick={() => deleteLesson(confirmDelete)}
                    style={{ flex: 1, background: "#c04040", color: "#fff", border: "none", borderRadius: 12,
                      padding: "9px", fontSize: 14.5, fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                    מחיקה
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ============ CLEAR DATA CONFIRM ============ */}
        {showClearConfirm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 62, display: "flex", alignItems: "center", justifyContent: "center" }} dir="rtl">
            <div onClick={() => setShowClearConfirm(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.45)" }} />
            <div style={{ position: "relative", width: 320, background: "#fffdf8", borderRadius: 20, padding: "24px 22px 20px",
              boxShadow: "0 16px 40px rgba(38,37,31,.22)", fontFamily: "'Assistant',sans-serif" }}>
              <div style={{ fontSize: 17, fontWeight: 500, color: "#c04040", marginBottom: 10 }}>⚠️ מחיקת כל הנתונים</div>
              <div style={{ fontSize: 13.5, fontWeight: 300, color: C.sub, lineHeight: 1.6, marginBottom: 20 }}>
                פעולה זו תמחק את כל התלמידים, השיעורים והסיכומים לצמיתות. לא ניתן לבטל.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowClearConfirm(false)} className="tf-ghost" style={{ flex: 1, padding: "10px" }}>ביטול</button>
                <button onClick={async () => {
                    try {
                      await Promise.all([dbClearStudents(user.id), dbClearLessons(user.id)]);
                      setStudents([]); setLessons([]);
                      notify("כל הנתונים נמחקו");
                    } catch (e) {
                      console.error(e);
                      notify("שגיאה במחיקת הנתונים");
                    } finally {
                      setShowClearConfirm(false);
                    }
                  }}
                  style={{ flex: 1, background: "#c04040", color: "#fff", border: "none", borderRadius: 12,
                    padding: "10px", fontSize: 14.5, fontWeight: 400, cursor: "pointer", fontFamily: "inherit" }}>
                  מחק הכל
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ EXPORT MODAL ============ */}
        {showExport && (
          <ExportModal
            lessons={lessons}
            students={studentsWithHours}
            onClose={() => setShowExport(false)}
            notify={notify}
          />
        )}

        {/* ============ TEMPLATE PICKER ============ */}
        {templatePicker && (() => {
          const s = studentsWithHours.find(x => x.id === templatePicker.studentId);
          const send = (key) => {
            if (!s) return;
            openWhatsApp(s.phone, fillTemplate(templates[key], { studentName: templatePicker.studentName, date: templatePicker.date, time: templatePicker.time, price: templatePicker.price }));
            setTemplatePicker(null);
          };
          return (
            <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "flex-end", justifyContent: "center" }} dir="rtl">
              <div onClick={() => setTemplatePicker(null)} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.38)" }} />
              <div style={{ position: "relative", width: "100%", maxWidth: 430, background: C.card, borderRadius: "22px 22px 0 0", padding: "20px 20px 36px",
                boxShadow: "0 -8px 30px rgba(38,37,31,.15)", fontFamily: "'Assistant',sans-serif" }}>
                <div style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>שליחת הודעה</div>
                <div style={{ fontSize: 12.5, fontWeight: 300, color: C.sub, marginBottom: 16 }}>
                  {templatePicker.studentName} · {heDateShort(templatePicker.date)} · {templatePicker.time}
                </div>
                {[
                  { key: "reminder",     label: "תזכורת לשיעור",     icon: "📅" },
                  { key: "payment",      label: "תזכורת תשלום",       icon: "💰" },
                  { key: "confirmation", label: "אישור קביעת שיעור",  icon: "✅" },
                ].map(({ key, label, icon }) => (
                  <button key={key} onClick={() => send(key)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                      background: C.cream, border: `1px solid ${C.hair}`, borderRadius: 14,
                      padding: "12px 16px", marginBottom: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "right" }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{label}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 300, color: C.sub, marginTop: 2 }}>
                        {fillTemplate(templates[key], { studentName: templatePicker.studentName, date: templatePicker.date, time: templatePicker.time, price: templatePicker.price }).slice(0, 60)}…
                      </div>
                    </div>
                  </button>
                ))}
                <button onClick={() => setTemplatePicker(null)} className="tf-ghost" style={{ width: "100%", marginTop: 4 }}>ביטול</button>
              </div>
            </div>
          );
        })()}

        {/* ============ SETTINGS DRAWER ============ */}
        {showSettings && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} dir="rtl">
            <div onClick={() => setShowSettings(false)} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.35)" }} />
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "90%", maxWidth: 400,
              background: C.cream, overflowY: "auto", boxShadow: "-8px 0 30px rgba(38,37,31,.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 22px 14px", borderBottom: `1px solid ${C.hair}` }}>
                <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 0 }}>
                  <X size={22} strokeWidth={STROKE} />
                </button>
                <div style={{ fontSize: 22, fontWeight: 400 }}>הגדרות</div>
              </div>
              <SettingsTab
                settings={settings}
                onSave={async (s) => {
                  setSettings(s);
                  setShowSettings(false);
                  try {
                    await dbSaveSettings(user.id, s);
                    notify("ההגדרות נשמרו ✓");
                  } catch (e) {
                    console.error(e);
                    notify("שגיאה בשמירת ההגדרות");
                  }
                }}
                templates={templates}
                fillTemplate={fillTemplate}
                onLogout={onLogout}
              />
            </div>
          </div>
        )}

        {/* ============ SIDE MENU DRAWER ============ */}
        {showMenu && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} dir="rtl">
            <div onClick={() => setShowMenu(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.35)" }} />
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 270,
              background: C.cream, boxShadow: "-8px 0 30px rgba(38,37,31,.15)",
              display: "flex", flexDirection: "column", fontFamily: "'Assistant',sans-serif" }}>

              {/* Header */}
              <div style={{ padding: "52px 22px 20px", borderBottom: `1px solid ${C.hair}` }}>
                <div style={{ fontSize: 22, fontWeight: 400, color: C.ink }}>TutorFlow</div>
                <div style={{ fontSize: 12, fontWeight: 300, color: C.sub, marginTop: 2 }}>שלום, {settings.teacherName}</div>
              </div>

              {/* Nav items */}
              <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
                {[
                  { id: "settings_drawer", label: "הגדרות",  icon: Settings2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { if (id === 'settings_drawer') { setShowMenu(false); setShowSettings(true); } else { setTab(id); setShowMenu(false); } }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "13px 22px", background: tab === id ? "#f0ead8" : "none",
                      border: "none", cursor: "pointer", fontFamily: "inherit", color: C.ink,
                      textAlign: "right", borderRight: tab === id ? `3px solid ${C.green}` : "3px solid transparent" }}>
                    <Icon size={20} strokeWidth={STROKE} style={{ color: tab === id ? C.green : C.sub }} />
                    <span style={{ fontSize: 15, fontWeight: tab === id ? 500 : 300 }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Export button */}
              <div style={{ padding: "0 0 8px" }}>
                <button onClick={() => { setShowMenu(false); setShowExport(true); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 22px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", color: C.ink, textAlign: "right",
                    borderRight: "3px solid transparent" }}>
                  <Download size={20} strokeWidth={STROKE} style={{ color: C.sub }} />
                  <span style={{ fontSize: 15, fontWeight: 300 }}>ייצוא נתונים</span>
                </button>
                <button onClick={() => { setShowMenu(false); setShowClearConfirm(true); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 22px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", color: "#c04040", textAlign: "right",
                    borderRight: "3px solid transparent" }}>
                  <Trash2 size={20} strokeWidth={STROKE} style={{ color: "#c04040" }} />
                  <span style={{ fontSize: 15, fontWeight: 300 }}>מחיקת כל הנתונים</span>
                </button>
              </div>

              {/* Footer: logout */}
              <div style={{ padding: "16px 22px", borderTop: `1px solid ${C.hair}` }}>
                <button onClick={() => { setShowMenu(false); onLogout(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "none",
                    border: "none", cursor: "pointer", color: C.sub, fontFamily: "inherit", fontSize: 13, padding: 0 }}>
                  <LogOut size={18} strokeWidth={STROKE} />
                  התנתקות
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ TOAST ============ */}
        {toast && (
          <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", background: C.green, color: C.boardTx, fontSize: 13.5, fontWeight: 300, padding: "9px 20px", borderRadius: 99, zIndex: 60, boxShadow: "0 8px 20px rgba(52,64,50,.25)" }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
