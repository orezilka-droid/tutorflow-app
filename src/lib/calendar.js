import { endTime } from "./dates";

const icsDate = (dateStr, timeStr) => dateStr.replace(/-/g, "") + "T" + timeStr.replace(":", "") + "00";

export function googleCalendarUrl(lesson) {
  const start = icsDate(lesson.date, lesson.time);
  const end = icsDate(lesson.date, endTime(lesson.time, lesson.duration));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `שיעור ${lesson.subject || ""} - ${lesson.studentName}`.trim(),
    dates: `${start}/${end}`,
    details: lesson.notes || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICS(lesson) {
  const start = icsDate(lesson.date, lesson.time);
  const end = icsDate(lesson.date, endTime(lesson.time, lesson.duration));
  const stamp = icsDate(new Date().toISOString().slice(0, 10), "000000".slice(0, 5));
  const escapeText = (s) => (s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TutorFlow//HE",
    "BEGIN:VEVENT",
    `UID:${lesson.id}-${Date.now()}@tutorflow`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(`שיעור ${lesson.subject || ""} - ${lesson.studentName}`.trim())}`,
    `DESCRIPTION:${escapeText(lesson.notes)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shiur.ics";
  a.click();
  URL.revokeObjectURL(url);
}
