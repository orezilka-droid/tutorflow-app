import { heDateShort } from "./dates";
import { DOTS } from "./theme";

/* ================= Utilities ================= */
export const waPhone = (p) => "972" + p.replace(/\D/g, "").replace(/^0/, "");
export const fillTemplate = (tpl, { studentName, date, time, price }) =>
  (tpl || "").replaceAll("{student_name}", studentName ?? "")
     .replaceAll("{date}", date ? heDateShort(date) : "")
     .replaceAll("{time}", time ?? "")
     .replaceAll("{price}", price != null ? String(price) : "");
export const openWhatsApp = (phone, text) =>
  window.open(`https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(text)}`, "_blank");

export const dotFor = (subject) => {
  const map = {
    "מתמטיקה": DOTS[0], "אנגלית": DOTS[1], "פיזיקה": DOTS[2],
    "כימיה": DOTS[3], "ביולוגיה": "#8bc4a8", "היסטוריה": "#c4a45a",
    "ספרות": "#b47fcc", "עברית": "#d4824a", "גיאוגרפיה": "#7ab5c4",
  };
  return map[subject] || DOTS[4];
};

/* ================= Default templates (used to seed a new user's row in the `templates` table) ================= */
export const defaultTemplates = {
  reminder: "היי {student_name}! תזכורת לשיעור שלנו בתאריך {date} בשעה {time}. נתראה!",
  payment: "היי {student_name}, תזכורת קטנה לתשלום על השיעור מתאריך {date} בסך {price} ₪. תודה!",
  confirmation: "היי {student_name}! נקבע שיעור לתאריך {date} בשעה {time}. מחכה לראותך!",
};

/* ================= Default local-only settings (no settings table in the DB) ================= */
export const defaultSettings = {
  teacherName: "",
  defaultRate: 200,
  defaultDuration: 60,
  inactiveAfterDays: 60,
};
