import { Menu, CalendarPlus } from "lucide-react";
import { C } from "../lib/theme";
import { Ic, Badge, SectionCard } from "../components/Small";
import { dotFor } from "../lib/utils";
import { endTime, greeting, isNight, isSunset, iso } from "../lib/dates";
import { SCENE_IMG, BOARD_IMG, SUNSET_IMG, NIGHT_IMG, DONE_TODAY_IMG, IDEA_IMG } from "../assets/images";

function ProgressBar({ percent, color }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div style={{ width: "100%", height: 5, borderRadius: 99, background: "#ede6d6", overflow: "hidden" }}>
      <div style={{ width: `${clamped}%`, height: "100%", borderRadius: 99, background: color, transition: "width .3s" }} />
    </div>
  );
}

export function HomeTab({
  settings, students, lessons, todaysLessons, unpaidByStudent,
  setShowMenu, setShowAdd, setTab, setSelectedLessonId, sendLessonWA, requestToggle, setShowUnpaid,
}) {
  const now = new Date();
  const todayDoneList = todaysLessons.filter(l => new Date(l.date + "T" + l.time) <= now);
  const allDoneToday = todaysLessons.length > 0 && todayDoneList.length === todaysLessons.length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px 0" }}>
        <button onClick={() => setShowMenu(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 0 }}>
          <Ic icon={Menu} size={24} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 25, fontWeight: 300, letterSpacing: ".4px" }}>TutorFlow</div>
          <div style={{ fontSize: 12, fontWeight: 300, color: C.sub, letterSpacing: ".5px", lineHeight: 1 }}>לתכנן. ללמד. להשפיע.</div>
        </div>
        <button onClick={() => setShowAdd(true)} title="שיבוץ שיעור חדש"
          style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 0 }}>
          <Ic icon={CalendarPlus} size={24} />
        </button>
      </div>
      <div style={{ height: 1, background: C.hair, margin: "14px 0 0" }} />

      <div style={{ position: "relative", padding: "10px 0 0" }}>
        {/* greeting v2 */}
        <div style={{ position: "absolute", top: 26, right: 0, left: "45%", zIndex: 2, paddingRight: 34 }}>
          <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1,
            color: (isNight || isSunset) ? "rgba(245,238,220,0.92)" : "rgba(44,52,44,0.85)",
            textShadow: (isNight || isSunset) ? "0 1px 6px rgba(0,0,0,.5)" : "0 1px 4px rgba(255,255,255,.7)" }}>{greeting}</div>
          <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: ".4px", lineHeight: 1, marginTop: 2,
            color: (isNight || isSunset) ? "#f0e9d4" : "rgba(44,52,44,0.88)",
            textShadow: (isNight || isSunset) ? "0 2px 8px rgba(0,0,0,.5)" : "0 1px 6px rgba(255,255,255,.8)" }}>{settings.teacherName}</div>
          <div style={{ fontSize: 12.5, fontWeight: 300, marginTop: 3,
            color: (isNight || isSunset) ? "rgba(245,235,210,0.85)" : "rgba(80,75,60,0.82)",
            textShadow: (isNight || isSunset) ? "0 1px 5px rgba(0,0,0,.5)" : "0 1px 3px rgba(255,255,255,.7)" }}>
            {todaysLessons.length} שיעורים היום · ₪{todaysLessons.reduce((s, l) => s + l.price, 0)} צפויים
          </div>
        </div>
        <div style={{ margin: (isNight || isSunset) ? "0 14px 0" : "22px 14px 0", borderRadius: "18px 18px 18px 18px", overflow: "hidden" }}>
          {isNight
            ? <img src={NIGHT_IMG} alt="" style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }} />
            : isSunset
            ? <img src={SUNSET_IMG} alt="" style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }} />
            : <img src={SCENE_IMG} alt="" style={{ width: "95%", height: "auto", display: "block", pointerEvents: "none" }} />}
        </div>
      </div>

      {allDoneToday ? (
        <div style={{ margin: "16px 20px 8px", position: "relative" }}>
          <img src={DONE_TODAY_IMG} alt="" style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>אין יותר שיעורים להיום.</div>
            <div style={{ fontSize: 13, fontWeight: 300, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>
              כל הכבוד! עבדת קשה ועכשיו זמן לנוח
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 22px 8px" }}>
            <div style={{ fontSize: 17, fontWeight: 400 }}>
              המערכת של היום
            </div>
            <button onClick={() => setTab("lessons")} style={{ fontSize: 12.5, fontWeight: 300, color: C.sub, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>הצג הכל</button>
          </div>

          <SectionCard style={{ margin: "0 20px" }}>
            {todaysLessons.length === 0 ? (
              <div style={{ padding: "22px 18px", fontSize: 13.5, fontWeight: 300, color: C.sub, textAlign: "center" }}>
                אין שיעורים היום. אפשר לשבץ שיעור חדש מהאייקון שלמעלה.
              </div>
            ) : todaysLessons.map((l, i) => (
              <div key={l.id} onClick={() => setSelectedLessonId(l.id)}
                className={i < todaysLessons.length - 1 ? "tf-hair" : ""}
                style={{ display: "flex", alignItems: "center", gap: 13, padding: "8px 18px", cursor: "pointer" }}>
                <div style={{ width: 44, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{l.time}</div>
                  <div style={{ fontSize: 12, fontWeight: 300, color: C.sub, lineHeight: 1.25 }}>{endTime(l.time, l.duration)}</div>
                </div>
                <span style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0, background: dotFor(students.find((s) => s.id === l.studentId)?.subject) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.3 }}>{students.find((s) => s.id === l.studentId)?.subject}</div>
                  <div style={{ fontSize: 12, fontWeight: 300, color: C.sub, lineHeight: 1.3 }}>{l.studentName}</div>
                </div>
                <Badge status={l.status} onClick={(e) => { e.stopPropagation(); requestToggle(l.id); }} />
              </div>
            ))}
          </SectionCard>
        </>
      )}

      {/* New day-focused KPI cards */}
      {(() => {
        const now = new Date();
        const todayStr = iso(now);
        const todayAll = lessons.filter(l => l.date === todayStr);
        const todayDone = todayAll.filter(l => new Date(l.date + "T" + l.time) <= now);
        const todayHours = +(todayDone.reduce((s, l) => s + l.duration / 60, 0)).toFixed(1);
        const todayTotalHours = +(todayAll.reduce((s, l) => s + l.duration / 60, 0)).toFixed(1);
        const todayRemainingHours = +(todayAll.filter(l => new Date(l.date + "T" + l.time) > now).reduce((s, l) => s + l.duration / 60, 0)).toFixed(1);
        const todayRevenue = todayAll.reduce((s, l) => s + l.price, 0);
        const allUnpaid = lessons.filter(l => l.status === "unpaid" && new Date(l.date + "T" + l.time) <= now);
        const unpaidTotal = allUnpaid.reduce((s, l) => s + l.price, 0);
        const unpaidCount = allUnpaid.length;

        // End-of-day check
        const allDoneToday = todayAll.length > 0 && todayDone.length === todayAll.length;
        const noLessonsToday = todayAll.length === 0;

        const todayUnpaid = lessons.filter(l => l.date === todayStr && l.status === "unpaid" && new Date(l.date + "T" + l.time) <= now);
        const todayUnpaidSum = todayUnpaid.reduce((s, l) => s + l.price, 0);

        const doneRevenue = todayDone.reduce((s, l) => s + l.price, 0);
        const pctLessons = todayAll.length ? (todayDone.length / todayAll.length) * 100 : 0;
        const pctRevenue = todayRevenue > 0 ? (doneRevenue / todayRevenue) * 100 : 0;
        const pctHours = todayTotalHours > 0 ? (todayHours / todayTotalHours) * 100 : 0;
        const kpiCards = [
          { title: "שיעורים היום", value: String(todayDone.length), goal: `מתוך ${todayAll.length}`, pct: pctLessons, color: "#35493e", showBar: true },
          { title: "שעות היום", value: String(todayHours), goal: `מתוך ${todayTotalHours}`, pct: pctHours, color: "#c39089", showBar: true },
          { title: "הכנסה היום", value: `₪${doneRevenue.toLocaleString()}`, goal: `מתוך ₪${todayRevenue.toLocaleString()}`, pct: pctRevenue, color: "#c9a95c", showBar: true },
        ];

        return (
          <div style={{ margin: "16px 20px 8px" }}>
            {/* EOD message — above cards */}
            {noLessonsToday && (
              <div style={{ textAlign: "center", fontSize: 15, fontWeight: 300, color: C.sub,
                margin: "0 0 10px", lineHeight: 1.5 }}>
                😊 איזה כיף! אין שיעורים להיום
              </div>
            )}

            {/* KPI cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", gap: 7 }}>
                {kpiCards.map(({ title, value, goal, pct, color, showBar }) => (
                  <div key={title} style={{ flex: 1, background: `${color}33`, border: `1px solid ${color}66`, borderRadius: 18,
                    boxShadow: "0 2px 8px rgba(80,65,40,.07)", overflow: "hidden" }}>
                    <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minHeight: 88 }}>
                      <div style={{ textAlign: "center", minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 400, color: C.sub, lineHeight: 1.3, marginBottom: 4 }}>{title}</div>
                        <div style={{ fontSize: 21, fontWeight: 700, fontFamily: "'Google Sans Flex',sans-serif", color: C.ink, lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: 10, fontWeight: 300, color: C.sub, marginTop: 3 }}>{goal}</div>
                      </div>
                      {showBar && <ProgressBar percent={pct} color={color} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending card — full width, separate row */}
              {unpaidCount > 0 && (
                <div onClick={() => setShowUnpaid(true)}
                  style={{ marginTop: 8, background: C.card, border: "1px solid #e8e0cc",
                    borderRadius: 18, boxShadow: "0 2px 8px rgba(80,65,40,.07)",
                    padding: "14px 18px", cursor: "pointer" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={IDEA_IMG} alt="" style={{ width: 26, height: "auto", pointerEvents: "none", flexShrink: 0 }} />
                      <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>ממתינים לתשלום</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 300, color: C.sub,
                      background: "#f4f0e6", borderRadius: 99, padding: "2px 10px" }}>↗ לחץ לפירוט</span>
                  </div>
                  {/* Today row */}
                  {todayUnpaid.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "4px 0", borderBottom: "1px solid #ede6d6" }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "#c04040", textAlign: "right" }}>
                        היום
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#c04040", marginRight: 6 }}> · {todayUnpaid.length} שיעורים</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Google Sans Flex',sans-serif", color: "#c04040" }}>
                        ₪{todayUnpaidSum.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {/* Total row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#c04040", textAlign: "right" }}>
                      {"סה״כ"}
                      <span style={{ fontSize: 13, fontWeight: 400, color: "#c04040", marginRight: 6 }}> · {unpaidCount} שיעורים</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Google Sans Flex',sans-serif", color: "#c04040" }}>
                      ₪{unpaidTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div style={{
        margin: "16px 20px 8px", borderRadius: 18, position: "relative", overflow: "hidden",
        boxShadow: "0 4px 12px rgba(52,64,50,.14)",
      }}>
        <img src={BOARD_IMG} alt="" style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }} />
        <div style={{
          position: "absolute", right: 24, top: "18%", width: "50%",
          fontSize: 17.5, fontFamily: "'Fredoka', sans-serif",
          fontWeight: 400, lineHeight: 1.6, letterSpacing: ".2px",
          color: "rgba(255,252,240,0.92)", textAlign: "right",
        }}>
          {"״"}מורה טוב הופך את הלמידה לפשוטה.
        </div>
      </div>
    </>
  );
}
