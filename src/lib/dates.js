/* ================= Date helpers ================= */
// Local-time ISO date string (yyyy-mm-dd) — NOT toISOString(), which converts
// to UTC and silently shifts the date by a day in timezones ahead of UTC
// (e.g. Israel) whenever local time is close to midnight.
export const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const today = new Date();
export const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };
export const todayISO = iso(today);
export const currentHour = today.getHours();
export const isSunset = currentHour >= 17 && (currentHour < 19 || (currentHour === 19 && new Date().getMinutes() <= 30));
export const isNight = !isSunset && (currentHour >= 19 || currentHour < 4);
export const greeting = currentHour >= 4 && currentHour < 12 ? "בוקר טוב,"
  : currentHour >= 12 && currentHour < 17 ? "צהריים טובים,"
  : isSunset ? "ערב טוב,"
  : isNight ? "לילה טוב,"
  : "ערב טוב,";
export const heDate = (s) => new Date(s + "T00:00:00").toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
export const heDateShort = (s) => new Date(s + "T00:00:00").toLocaleDateString("he-IL", { day: "numeric", month: "long" });
export const heWeekday = new Date().toLocaleDateString("he-IL", { weekday: "long" });
export const endTime = (t, dur) => {
  const [h, m] = t.split(":").map(Number);
  const e = h * 60 + m + dur;
  return `${String(Math.floor(e / 60) % 24).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
};

export const HE_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
export const addDaysISO = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); };

export const HE_MONTHS_SHORT = ["ינו׳","פבר׳","מרץ","אפר׳","מאי","יונ׳","יול׳","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳"];
export const HE_MONTHS_FULL  = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
