import { supabase } from "./supabaseClient";
import { defaultTemplates } from "./utils";

/* =====================================================================
   Row <-> App-model mapping.

   NOTE on schema: the live Supabase project already has these tables
   (introspected via the REST API — no schema.sql is created/needed):
     students:  id, user_id, name, phone, grade, subject, hourly_rate,
                notes, active, created_at
                (NO location column, NO total_hours column)
     lessons:   id, user_id, student_id, student_name, date, time,
                duration, price, status, subject, notes, created_at
                (NO paid_at column)
     templates: id, user_id, key, body, label, created_at
                (row-per-template, not a single jsonb blob)
     settings:  user_id, teacher_name, default_rate, default_duration,
                inactive_days, updated_at
                (one row per user; user_id is the key, no separate id)
===================================================================== */

const studentFromRow = (r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  grade: r.grade,
  subject: r.subject,
  hourlyRate: r.hourly_rate,
  notes: r.notes,
  active: r.active, // null/undefined = "auto" (derived from recent lesson activity)
});

const studentToRow = (s, userId) => ({
  user_id: userId,
  name: s.name,
  phone: s.phone,
  grade: s.grade,
  subject: s.subject,
  hourly_rate: s.hourlyRate,
  notes: s.notes,
  active: s.active === undefined ? null : s.active,
});

const lessonFromRow = (r) => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name,
  date: r.date,
  time: r.time,
  duration: r.duration,
  price: r.price,
  status: r.status,
  subject: r.subject,
  notes: r.notes,
  attachmentUrl: r.attachment_url || null,
  paidAt: r.status === "paid" ? r.date : null, // derived locally; no paid_at column exists
});

const lessonToRow = (l, userId) => ({
  user_id: userId,
  student_id: l.studentId,
  student_name: l.studentName,
  date: l.date,
  time: l.time,
  duration: l.duration,
  price: l.price,
  status: l.status,
  subject: l.subject,
  notes: l.notes,
  attachment_url: l.attachmentUrl ?? null,
});

/* ================= Settings ================= */

const DEFAULT_SETTINGS = { teacherName: "מורה", defaultRate: 150, defaultDuration: 60, inactiveAfterDays: 60 };

const settingsFromRow = (r) => ({
  teacherName: r.teacher_name,
  defaultRate: r.default_rate,
  defaultDuration: r.default_duration,
  inactiveAfterDays: r.inactive_days,
});

const settingsToRow = (s, userId) => ({
  user_id: userId,
  teacher_name: s.teacherName,
  default_rate: s.defaultRate,
  default_duration: s.defaultDuration,
  inactive_days: s.inactiveAfterDays,
});

export async function dbSaveSettings(userId, settings) {
  const { error } = await supabase.from("settings").upsert(settingsToRow(settings, userId));
  if (error) throw error;
}

/* ================= Fetch all data for a user ================= */

export async function fetchAllData(userId) {
  const [studentsRes, lessonsRes, templatesRes, settingsRes] = await Promise.all([
    supabase.from("students").select("*").order("id", { ascending: true }),
    supabase.from("lessons").select("*").order("id", { ascending: true }),
    supabase.from("templates").select("*").order("id", { ascending: true }),
    supabase.from("settings").select("*").maybeSingle(),
  ]);

  if (studentsRes.error) throw studentsRes.error;
  if (lessonsRes.error) throw lessonsRes.error;
  if (templatesRes.error) throw templatesRes.error;
  if (settingsRes.error) throw settingsRes.error;

  const students = (studentsRes.data || []).map(studentFromRow);
  const lessons = (lessonsRes.data || []).map(lessonFromRow);

  let templateRows = templatesRes.data || [];
  if (templateRows.length === 0) {
    // First-time user: seed the three built-in templates.
    const seed = Object.entries(defaultTemplates).map(([key, body]) => ({
      user_id: userId, key, body, label: null,
    }));
    const { data: created, error } = await supabase.from("templates").insert(seed).select();
    if (error) throw error;
    templateRows = created || [];
  }

  let settings;
  if (settingsRes.data) {
    settings = settingsFromRow(settingsRes.data);
  } else {
    // First-time user: seed a default settings row.
    settings = DEFAULT_SETTINGS;
    await dbSaveSettings(userId, settings);
  }

  return { students, lessons, templateRows, settings };
}

/* ================= Students ================= */

export async function dbInsertStudent(userId, student) {
  const { data, error } = await supabase
    .from("students")
    .insert(studentToRow(student, userId))
    .select()
    .single();
  if (error) throw error;
  return studentFromRow(data);
}

export async function dbUpdateStudent(userId, id, patch) {
  const row = {};
  if ("name" in patch) row.name = patch.name;
  if ("phone" in patch) row.phone = patch.phone;
  if ("grade" in patch) row.grade = patch.grade;
  if ("subject" in patch) row.subject = patch.subject;
  if ("hourlyRate" in patch) row.hourly_rate = patch.hourlyRate;
  if ("notes" in patch) row.notes = patch.notes;
  if ("active" in patch) row.active = patch.active === undefined ? null : patch.active;
  const { error } = await supabase.from("students").update(row).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function dbDeleteStudent(userId, id) {
  const { error } = await supabase.from("students").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function dbClearStudents(userId) {
  const { error } = await supabase.from("students").delete().eq("user_id", userId);
  if (error) throw error;
}

/* ================= Lessons ================= */

export async function dbInsertLesson(userId, lesson) {
  const { data, error } = await supabase
    .from("lessons")
    .insert(lessonToRow(lesson, userId))
    .select()
    .single();
  if (error) throw error;
  return lessonFromRow(data);
}

export async function dbUpdateLesson(userId, id, patch) {
  const row = {};
  if ("studentId" in patch) row.student_id = patch.studentId;
  if ("studentName" in patch) row.student_name = patch.studentName;
  if ("date" in patch) row.date = patch.date;
  if ("time" in patch) row.time = patch.time;
  if ("duration" in patch) row.duration = patch.duration;
  if ("price" in patch) row.price = patch.price;
  if ("status" in patch) row.status = patch.status;
  if ("subject" in patch) row.subject = patch.subject;
  if ("notes" in patch) row.notes = patch.notes;
  if ("attachmentUrl" in patch) row.attachment_url = patch.attachmentUrl;
  // paidAt has no DB column — intentionally not persisted.
  const { error } = await supabase.from("lessons").update(row).eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function dbDeleteLesson(userId, id) {
  const { error } = await supabase.from("lessons").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function dbClearLessons(userId) {
  const { error } = await supabase.from("lessons").delete().eq("user_id", userId);
  if (error) throw error;
}

/* ================= Templates (row-per-template) ================= */

export async function dbUpdateTemplateBody(userId, rowId, body) {
  const { error } = await supabase.from("templates").update({ body }).eq("id", rowId).eq("user_id", userId);
  if (error) throw error;
}

export async function dbInsertTemplateRow(userId, key, label, body = "") {
  const { data, error } = await supabase
    .from("templates")
    .insert({ user_id: userId, key, label, body })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ================= Lesson summary attachments (Storage) ================= */
const ATTACHMENTS_BUCKET = "lesson-attachments";

export async function dbUploadLessonAttachment(userId, lessonId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${lessonId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
