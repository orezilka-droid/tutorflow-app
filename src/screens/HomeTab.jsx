import { Menu, CalendarPlus, MessageCircle } from "lucide-react";
import { C } from "../lib/theme";
import { Ic, Badge, SectionCard } from "../components/Small";
import { dotFor } from "../lib/utils";
import { endTime, greeting, isNight, isSunset } from "../lib/dates";
import { SCENE_IMG, BOARD_IMG, SUNSET_IMG, NIGHT_IMG } from "../assets/images";

export function HomeTab({
  settings, students, lessons, todaysLessons, unpaidByStudent,
  setShowMenu, setShowAdd, setTab, setSelectedLessonId, sendLessonWA, requestToggle, setShowUnpaid,
}) {
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
        <div style={{ position: "absolute", top: 48, right: 0, left: "45%", zIndex: 2, paddingRight: 34 }}>
          <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.1,
            color: (isNight || isSunset) ? "rgba(245,238,220,0.92)" : "rgba(44,52,44,0.85)",
            textShadow: (isNight || isSunset) ? "0 1px 6px rgba(0,0,0,.5)" : "0 1px 4px rgba(255,255,255,.7)" }}>{greeting}</div>
          <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: ".4px", lineHeight: 1.08,
            color: (isNight || isSunset) ? "#f0e9d4" : "rgba(44,52,44,0.88)",
            textShadow: (isNight || isSunset) ? "0 2px 8px rgba(0,0,0,.5)" : "0 1px 6px rgba(255,255,255,.8)" }}>{settings.teacherName}</div>
          <div style={{ fontSize: 12.5, fontWeight: 300, marginTop: 3,
            color: (isNight || isSunset) ? "rgba(245,235,210,0.85)" : "rgba(80,75,60,0.82)",
            textShadow: (isNight || isSunset) ? "0 1px 5px rgba(0,0,0,.5)" : "0 1px 3px rgba(255,255,255,.7)" }}>
            {todaysLessons.length} שיעורים היום · ₪{todaysLessons.reduce((s, l) => s + l.price, 0)} צפויים
          </div>
        </div>
        <div style={{ margin: "2px 14px 0", borderRadius: "18px 18px 18px 18px", overflow: "hidden" }}>
          {isNight
            ? <img src={NIGHT_IMG} alt="" style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }} />
            : isSunset
            ? <img src={SUNSET_IMG} alt="" style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }} />
            : <img src={SCENE_IMG} alt="" style={{ width: "95%", height: "auto", display: "block", pointerEvents: "none" }} />}
        </div>
      </div>

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
            <button onClick={(e) => { e.stopPropagation(); sendLessonWA(l); }}
              title="שליחת הודעת וואטסאפ"
              style={{ background: "none", border: "none", color: C.sub, cursor: "pointer", padding: 4 }}>
              <Ic icon={MessageCircle} size={19} />
            </button>
            <Badge status={l.status} onClick={(e) => { e.stopPropagation(); requestToggle(l.id); }} />
          </div>
        ))}
      </SectionCard>

      {/* New day-focused KPI cards */}
      {(() => {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
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

        return (
          <div style={{ margin: "16px 20px 8px" }}>
            {/* EOD message — above cards */}
            {(allDoneToday || noLessonsToday) && (
              <div style={{ textAlign: "center", fontSize: 15, fontWeight: 300, color: C.sub,
                margin: "0 0 10px", lineHeight: 1.5 }}>
                {noLessonsToday ? "😊 איזה כיף! אין שיעורים להיום" : "כל השיעורים להיום הושלמו! זמן לנוח"}
              </div>
            )}
            {/* KPI cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", gap: 7 }}>
              {/* Card 1: שיעורים היום */}
              <div style={{ flex: 1, background: C.card, border: "1.5px solid #8a8c4f", borderRadius: 18,
                boxShadow: "0 2px 8px rgba(80,65,40,.07)", overflow: "hidden" }}>
                <div style={{ padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 88, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Hina Mincho',serif",
                      color: C.ink, lineHeight: 1 }}>
                      {todayDone.length}<span style={{ fontSize: 14, fontWeight: 400, color: C.sub }}>/{todayAll.length}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: C.sub, lineHeight: 1.3 }}>שיעורים היום</div>
                </div>
              </div>

              {/* Card 2: הכנסה היום */}
              <div style={{ flex: 1, background: C.card, border: "1.5px solid #8a8c4f", borderRadius: 18,
                boxShadow: "0 2px 8px rgba(80,65,40,.07)", overflow: "hidden" }}>
                <div style={{ padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 88, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Hina Mincho',serif",
                      color: C.ink, lineHeight: 1 }}>
                      ₪{todayRevenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: C.sub, lineHeight: 1.3 }}>הכנסה היום</div>
                </div>
              </div>

              {/* Card 3: שעות שנותרו היום */}
              <div style={{ flex: 1, background: C.card, border: "1.5px solid #8a8c4f", borderRadius: 18,
                boxShadow: "0 2px 8px rgba(80,65,40,.07)", overflow: "hidden" }}>
                <div style={{ padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 88, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Hina Mincho',serif",
                      color: C.ink, lineHeight: 1 }}>
                      {todayRemainingHours}<span style={{ fontSize: 14, fontWeight: 400, color: C.sub }}>/{todayTotalHours}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: C.sub, lineHeight: 1.3 }}>שעות היום</div>
                </div>
              </div>

            </div>

            {/* Pending card — full width, separate row */}
            {unpaidCount > 0 && (() => {
              const todayUnpaid = lessons.filter(l => l.date === todayStr && l.status === "unpaid" && new Date(l.date + "T" + l.time) <= now);
              const todayUnpaidSum = todayUnpaid.reduce((s,l) => s+l.price, 0);
              return (
                <div onClick={() => setShowUnpaid(true)}
                  style={{ marginTop: 8, background: C.card, border: "1px solid #e8e0cc",
                    borderRadius: 18, boxShadow: "0 2px 8px rgba(80,65,40,.07)",
                    padding: "14px 18px", cursor: "pointer" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>ממתינים לתשלום</span>
                    <span style={{ fontSize: 12, fontWeight: 300, color: C.sub,
                      background: "#f4f0e6", borderRadius: 99, padding: "2px 10px" }}>↗ לחץ לפירוט</span>
                  </div>
                                          {/* Today row */}
                  {todayUnpaid.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: "1px solid #ede6d6" }}>
                      <div style={{ fontSize: 13, fontWeight: 400, color: C.ink, textAlign: "right" }}>
                        היום
                        <span style={{ fontSize: 12, fontWeight: 300, color: C.sub, marginRight: 6 }}> · {todayUnpaid.length} שיעורים</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Hina Mincho',serif", color: "#c04040" }}>
                        ₪{todayUnpaidSum.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {/* Total row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: C.sub, textAlign: "right" }}>
                      {"סה״כ"}
                      <span style={{ fontSize: 12, fontWeight: 300, color: C.sub, marginRight: 6 }}> · {unpaidCount} שיעורים</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Hina Mincho',serif", color: "#c04040" }}>
                      ₪{unpaidTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>{/* close flex-column */}
          </div>
        );
      })()}

      <div style={{
        margin: "16px 20px 8px", borderRadius: 18, position: "relative", overflow: "hidden",
        backgroundImage: `url(${BOARD_IMG})`, backgroundSize: "cover", backgroundPosition: "center",
        minHeight: 205, boxShadow: "0 4px 12px rgba(52,64,50,.14)",
      }}>
        <div style={{
          position: "absolute", right: 24, top: 48, width: "50%",
          fontSize: 17.5, fontFamily: "'Fredoka', sans-serif",
          fontWeight: 500, lineHeight: 1.6, letterSpacing: ".2px",
          color: "rgba(255,252,240,0.92)", textAlign: "right",
        }}>
          {"״"}מורה טוב הופך את הלמידה לפשוטה.
        </div>
      </div>
    </>
  );
}
