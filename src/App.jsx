import { useState, useEffect } from "react";

const START_WEIGHT = 71;
const GOAL_WEIGHT = 78;
const START_DATE = new Date("2026-04-21"); // Monday
const END_DATE = new Date("2026-05-31");
const TOTAL_DAYS = Math.round((END_DATE - START_DATE) / (1000 * 60 * 60 * 24)) + 1;

const MEALS = [
  { id: "breakfast", emoji: "🌅", label: "Power Breakfast", desc: "Oats + TomBrown + Complan + Eggs", time: "7–8am", cal: 750 },
  { id: "lunch", emoji: "🍱", label: "Lunch", desc: "Rice or Yam + 3 Eggs", time: "12:30–1:30pm", cal: 725 },
  { id: "afternoon", emoji: "🥞", label: "Afternoon Fuel", desc: "Pancakes + Custard + Banana", time: "4–5pm", cal: 625 },
  { id: "dinner", emoji: "🌙", label: "Dinner", desc: "Rice or Yam + 3 Eggs", time: "8–9pm", cal: 700 },
];

const WORKOUT_PLAN = {
  1: { name: "Chest & Triceps", exercises: ["Bench Press 4×8", "Incline Dumbbell Press 3×10", "Cable Flyes 3×12", "Tricep Pushdown 3×12", "Skull Crushers 3×10"] },
  2: { name: "Back & Biceps", exercises: ["Deadlift 4×6", "Lat Pulldown 4×10", "Seated Cable Row 3×10", "Barbell Curl 3×12", "Hammer Curl 3×12"] },
  3: { name: "Rest / Active Recovery", exercises: ["Light walk", "Stretching", "Eat all 4 meals"] },
  4: { name: "Shoulders & Traps", exercises: ["Overhead Press 4×8", "Lateral Raises 3×15", "Front Raises 3×12", "Shrugs 4×12", "Face Pulls 3×15"] },
  5: { name: "Legs", exercises: ["Squats 4×8", "Leg Press 3×12", "Romanian Deadlift 3×10", "Leg Curl 3×12", "Calf Raises 4×20"] },
  6: { name: "Arms & Core", exercises: ["Barbell Curl 4×10", "Preacher Curl 3×12", "Tricep Dips 3×12", "Overhead Tricep Ext 3×10", "Plank 3×45s"] },
  0: { name: "Full Rest Day", exercises: ["Sleep 8hrs", "Eat all meals", "Hydrate well"] },
};

function getDayWorkout(dayNum) {
  const idx = ((dayNum - 1) % 7);
  return WORKOUT_PLAN[idx === 6 ? 0 : idx + 1];
}

function getDayOfWeek(dayNum) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function BulkTracker() {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem("bulk_v2"); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [selectedDay, setSelectedDay] = useState(1);
  const [weightInput, setWeightInput] = useState("");
  const [view, setView] = useState("today");
  const [showWorkout, setShowWorkout] = useState(false);

  const dayKey = `d${selectedDay}`;
  const dayData = data[dayKey] || { meals: {}, weight: null, workout: false, water: 0 };

  useEffect(() => {
    try { localStorage.setItem("bulk_v2", JSON.stringify(data)); } catch {}
  }, [data]);

  const updateDay = (updates) => setData(p => ({ ...p, [dayKey]: { ...dayData, ...updates } }));
  const toggleMeal = (id) => updateDay({ meals: { ...dayData.meals, [id]: !dayData.meals[id] } });

  const mealsEaten = MEALS.filter(m => dayData.meals[m.id]).length;
  const totalCalsToday = MEALS.filter(m => dayData.meals[m.id]).reduce((a, m) => a + m.cal, 0);

  const daysWithWeight = Object.entries(data)
    .filter(([, d]) => d.weight)
    .map(([k, d]) => ({ day: parseInt(k.slice(1)), weight: parseFloat(d.weight) }))
    .sort((a, b) => a.day - b.day);

  const latestWeight = daysWithWeight.length > 0 ? daysWithWeight[daysWithWeight.length - 1].weight : START_WEIGHT;
  const gained = (latestWeight - START_WEIGHT).toFixed(1);
  const remaining = Math.max(0, GOAL_WEIGHT - latestWeight).toFixed(1);
  const progress = Math.min(100, Math.max(0, ((latestWeight - START_WEIGHT) / (GOAL_WEIGHT - START_WEIGHT)) * 100));
  const totalWorkouts = Object.values(data).filter(d => d.workout).length;
  const workout = getDayWorkout(selectedDay);

  const cs = {
    page: { minHeight: "100vh", background: "#0d0d0d", color: "#f0ebe0", fontFamily: "'Georgia', 'Times New Roman', serif", paddingBottom: 80 },
    header: { padding: "24px 20px 0", background: "linear-gradient(180deg, #161616 0%, transparent 100%)" },
    badge: { display: "inline-block", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#c8a84b", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 20, padding: "4px 12px", marginBottom: 12 },
    title: { fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, margin: "0 0 4px" },
    gold: { color: "#c8a84b" },
    subtitle: { fontSize: 13, color: "#555", marginBottom: 16 },
    progressWrap: { background: "rgba(255,255,255,0.05)", borderRadius: 100, height: 6, overflow: "hidden", marginBottom: 6 },
    progressBar: (pct) => ({ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #c8a84b, #e8c86a)", borderRadius: 100, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }),
    progressLabels: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444" },
    nav: { display: "flex", background: "#111", borderBottom: "1px solid #1e1e1e", marginTop: 20 },
    navBtn: (active) => ({ flex: 1, padding: "14px 0", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", border: "none", cursor: "pointer", background: active ? "rgba(200,168,75,0.08)" : "transparent", color: active ? "#c8a84b" : "#333", borderBottom: active ? "2px solid #c8a84b" : "2px solid transparent", transition: "all 0.2s" }),
    body: { padding: "20px 16px", maxWidth: 500, margin: "0 auto" },
    card: { background: "#141414", border: "1px solid #1e1e1e", borderRadius: 16, padding: 20, marginBottom: 14 },
    cardTitle: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#c8a84b", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
    dayNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    dayBtn: { background: "#1a1a1a", border: "1px solid #252525", color: "#888", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 16, transition: "all 0.15s" },
    dayCenter: { textAlign: "center" },
    dayNum: { fontSize: 32, fontWeight: 900, color: "#c8a84b", lineHeight: 1 },
    dayDate: { fontSize: 11, color: "#444", marginTop: 4 },
    mealRow: (checked) => ({ display: "flex", alignItems: "center", gap: 14, padding: "13px 14px", borderRadius: 12, marginBottom: 8, cursor: "pointer", background: checked ? "rgba(200,168,75,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${checked ? "rgba(200,168,75,0.25)" : "#1e1e1e"}`, transition: "all 0.2s" }),
    checkbox: (checked) => ({ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? "#c8a84b" : "#2a2a2a"}`, background: checked ? "#c8a84b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }),
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 },
    miniCard: (accent) => ({ background: "#141414", border: `1px solid ${accent ? "rgba(200,168,75,0.2)" : "#1e1e1e"}`, borderRadius: 14, padding: 18, textAlign: "center", cursor: "pointer", transition: "all 0.2s" }),
    statNum: (color) => ({ fontSize: 30, fontWeight: 900, color: color || "#f0ebe0", lineHeight: 1, margin: "6px 0 4px" }),
    statLabel: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#444" },
    statSub: { fontSize: 11, color: "#333", marginTop: 2 },
    input: { background: "rgba(255,255,255,0.05)", border: "1px solid #252525", borderRadius: 8, padding: "6px 10px", color: "#c8a84b", fontSize: 18, fontWeight: 700, textAlign: "center", outline: "none", width: "80%", marginTop: 8 },
    waterDot: (filled) => ({ flex: 1, height: 28, borderRadius: 6, cursor: "pointer", background: filled ? "rgba(96,165,250,0.5)" : "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", transition: "all 0.2s" }),
    exerciseItem: { padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontSize: 14, color: "#888", display: "flex", alignItems: "center", gap: 10 },
    calBadge: { background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#c8a84b", fontWeight: 700 },
    bottomBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,10,0.97)", borderTop: "1px solid #1e1e1e", padding: "12px 20px", textAlign: "center", fontSize: 12, color: "#333", backdropFilter: "blur(10px)" },
  };

  return (
    <div style={cs.page}>
      {/* HEADER */}
      <div style={cs.header}>
        <div style={cs.badge}>🔥 Bulk Challenge · Apr 21 – May 31</div>
        <div style={cs.title}>
          71 <span style={{ color: "#333", fontSize: 24 }}>→</span> <span style={cs.gold}>78</span>
          <span style={{ fontSize: 18, color: "#444", fontWeight: 400 }}> kg</span>
        </div>
        <div style={cs.subtitle}>
          {remaining > 0 ? `${remaining}kg remaining · Currently ${latestWeight}kg (+${gained}kg)` : "🏆 Goal achieved!"}
        </div>
        <div style={cs.progressWrap}>
          <div style={cs.progressBar(progress)} />
        </div>
        <div style={cs.progressLabels}>
          <span>71kg</span>
          <span style={{ color: "#c8a84b" }}>{Math.round(progress)}% there</span>
          <span>78kg</span>
        </div>
      </div>

      {/* NAV */}
      <div style={cs.nav}>
        {[["today", "📋 Today"], ["workout", "🏋🏾 Workout"], ["progress", "📈 Progress"], ["calendar", "🗓 Days"]].map(([v, l]) => (
          <button key={v} style={cs.navBtn(view === v)} onClick={() => setView(v)}>{l}</button>
        ))}
      </div>

      <div style={cs.body}>

        {/* TODAY */}
        {view === "today" && <>
          <div style={cs.dayNav}>
            <button style={cs.dayBtn} onClick={() => setSelectedDay(d => Math.max(1, d - 1))}>←</button>
            <div style={cs.dayCenter}>
              <div style={cs.dayNum}>Day {selectedDay}</div>
              <div style={cs.dayDate}>{getDayOfWeek(selectedDay)}</div>
            </div>
            <button style={cs.dayBtn} onClick={() => setSelectedDay(d => Math.min(TOTAL_DAYS, d + 1))}>→</button>
          </div>

          {/* Meals */}
          <div style={cs.card}>
            <div style={cs.cardTitle}>
              <span>Meals · {mealsEaten}/4 eaten</span>
              <span style={cs.calBadge}>~{totalCalsToday} kcal</span>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 100, height: 3, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(mealsEaten / 4) * 100}%`, background: "#c8a84b", borderRadius: 100, transition: "width 0.4s" }} />
            </div>
            {MEALS.map(m => (
              <div key={m.id} style={cs.mealRow(dayData.meals[m.id])} onClick={() => toggleMeal(m.id)}>
                <div style={cs.checkbox(dayData.meals[m.id])}>
                  {dayData.meals[m.id] && <span style={{ fontSize: 11, color: "#000", fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: dayData.meals[m.id] ? "#f0ebe0" : "#555" }}>{m.emoji} {m.label}</div>
                  <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>{m.desc} · {m.time}</div>
                </div>
                <div style={{ fontSize: 11, color: "#3a3a3a" }}>~{m.cal}</div>
              </div>
            ))}
          </div>

          {/* Weight + Workout */}
          <div style={cs.grid2}>
            <div style={{ ...cs.miniCard(dayData.workout), background: dayData.workout ? "rgba(34,197,94,0.06)" : "#141414", border: `1px solid ${dayData.workout ? "rgba(34,197,94,0.25)" : "#1e1e1e"}` }}
              onClick={() => updateDay({ workout: !dayData.workout })}>
              <div style={{ fontSize: 30 }}>{dayData.workout ? "🔥" : "🏋🏾"}</div>
              <div style={{ ...cs.statLabel, color: dayData.workout ? "#22c55e" : "#444", marginTop: 8 }}>
                {dayData.workout ? "TRAINED ✓" : "WORKOUT"}
              </div>
              <div style={{ fontSize: 10, color: "#2a2a2a", marginTop: 4 }}>tap to toggle</div>
            </div>

            <div style={cs.miniCard(false)}>
              <div style={{ fontSize: 30 }}>⚖️</div>
              <div style={cs.statLabel}>WEIGHT (KG)</div>
              <input
                type="number" step="0.1"
                placeholder={dayData.weight ? String(dayData.weight) : "log kg"}
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                onBlur={() => { if (weightInput) { updateDay({ weight: parseFloat(weightInput) }); setWeightInput(""); } }}
                style={cs.input}
              />
              {dayData.weight && <div style={{ fontSize: 11, color: "#c8a84b", marginTop: 4 }}>{dayData.weight}kg ✓</div>}
            </div>
          </div>

          {/* Water */}
          <div style={cs.card}>
            <div style={cs.cardTitle}>
              <span>💧 Water intake</span>
              <span style={{ color: "#60a5fa", fontSize: 12 }}>{dayData.water || 0} / 8 glasses</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={cs.waterDot(i < (dayData.water || 0))}
                  onClick={() => updateDay({ water: i < (dayData.water || 0) ? i : i + 1 })} />
              ))}
            </div>
          </div>
        </>}

        {/* WORKOUT */}
        {view === "workout" && <>
          <div style={cs.dayNav}>
            <button style={cs.dayBtn} onClick={() => setSelectedDay(d => Math.max(1, d - 1))}>←</button>
            <div style={cs.dayCenter}>
              <div style={cs.dayNum}>Day {selectedDay}</div>
              <div style={cs.dayDate}>{getDayOfWeek(selectedDay)}</div>
            </div>
            <button style={cs.dayBtn} onClick={() => setSelectedDay(d => Math.min(TOTAL_DAYS, d + 1))}>→</button>
          </div>

          <div style={cs.card}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#c8a84b", marginBottom: 8 }}>Today's Session</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{workout.name}</div>
            {workout.exercises.map((ex, i) => (
              <div key={i} style={cs.exerciseItem}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#c8a84b", fontWeight: 700 }}>{i + 1}</div>
                {ex}
              </div>
            ))}
          </div>

          <div style={{ ...cs.card, background: "rgba(200,168,75,0.05)", border: "1px solid rgba(200,168,75,0.15)" }}>
            <div style={{ fontSize: 11, color: "#c8a84b", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Bulking Tips for Gym</div>
            {["Lift heavy — aim for progressive overload every week", "Rest 90s–2min between sets for compound lifts", "Eat within 30 mins after training", "Don't do excessive cardio — it burns the calories you need"].map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: "#555", padding: "6px 0", borderBottom: "1px solid #1a1a1a" }}>• {tip}</div>
            ))}
          </div>

          <div style={{ ...cs.card, textAlign: "center" }} onClick={() => { updateDay({ workout: !dayData.workout }); }}>
            <div style={{ fontSize: 36 }}>{dayData.workout ? "🔥" : "🏋🏾"}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: dayData.workout ? "#22c55e" : "#c8a84b", marginTop: 8 }}>
              {dayData.workout ? "Workout logged ✓ — Beast mode!" : "Tap to mark workout done"}
            </div>
          </div>
        </>}

        {/* PROGRESS */}
        {view === "progress" && <>
          <div style={cs.grid2}>
            {[
              { label: "Weight Gained", val: `+${gained}kg`, sub: `${remaining}kg to goal`, color: "#c8a84b" },
              { label: "Current Weight", val: `${latestWeight}kg`, sub: "Goal: 78kg", color: "#22c55e" },
              { label: "Workouts Done", val: totalWorkouts, sub: `of ${TOTAL_DAYS} days`, color: "#a78bfa" },
              { label: "Days Tracked", val: Object.keys(data).length, sub: `of ${TOTAL_DAYS} total`, color: "#60a5fa" },
            ].map(({ label, val, sub, color }) => (
              <div key={label} style={cs.card}>
                <div style={cs.statLabel}>{label}</div>
                <div style={cs.statNum(color)}>{val}</div>
                <div style={cs.statSub}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={cs.card}>
            <div style={cs.cardTitle}><span>Weight History</span></div>
            {daysWithWeight.length === 0
              ? <div style={{ textAlign: "center", color: "#333", padding: "24px 0", fontSize: 14 }}>No weight logged yet.<br />Start from Day 1!</div>
              : daysWithWeight.map(({ day, weight }, i) => {
                const prev = daysWithWeight[i - 1];
                const diff = prev ? (weight - prev.weight).toFixed(1) : null;
                const up = diff && parseFloat(diff) > 0;
                return (
                  <div key={day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <div style={{ fontSize: 12, color: "#444" }}>Day {day}</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{weight}kg</div>
                    {diff && <div style={{ fontSize: 12, color: up ? "#22c55e" : "#ef4444" }}>{up ? "+" : ""}{diff}kg</div>}
                    {!diff && <div style={{ fontSize: 11, color: "#333" }}>start</div>}
                  </div>
                );
              })}
          </div>
        </>}

        {/* CALENDAR */}
        {view === "calendar" && <>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#c8a84b", marginBottom: 16 }}>All {TOTAL_DAYS} Days</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 10, color: "#333", paddingBottom: 6 }}>{d}</div>
            ))}
            {Array.from({ length: TOTAL_DAYS }, (_, i) => {
              const day = i + 1;
              const d = data[`d${day}`] || {};
              const meals = Object.values(d.meals || {}).filter(Boolean).length;
              const full = meals === 4 && d.workout;
              const partial = meals > 0 || d.workout;
              const active = selectedDay === day;
              return (
                <div key={day} onClick={() => { setSelectedDay(day); setView("today"); }}
                  style={{ background: active ? "rgba(200,168,75,0.2)" : full ? "rgba(200,168,75,0.1)" : partial ? "rgba(34,197,94,0.06)" : "#141414", border: `1px solid ${active ? "#c8a84b" : full ? "rgba(200,168,75,0.3)" : partial ? "rgba(34,197,94,0.15)" : "#1e1e1e"}`, borderRadius: 8, padding: "8px 4px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ fontSize: 12, fontWeight: active ? 900 : 400, color: active ? "#c8a84b" : full ? "#c8a84b" : partial ? "#22c55e" : "#333" }}>{day}</div>
                  {d.weight && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c8a84b", margin: "3px auto 0" }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 11, color: "#444", flexWrap: "wrap" }}>
            <span>🟡 Full day</span><span>🟢 Partial</span><span>· dot = weight logged</span>
          </div>
        </>}
      </div>

      {/* Bottom bar */}
      <div style={cs.bottomBar}>
        {progress >= 100 ? "🏆 78KG UNLOCKED. YOU DID IT." :
          progress > 60 ? "💪 Almost there. Stay consistent." :
          progress > 0 ? "🔥 Every meal counts. Don't skip." :
          "⚡ Monday is Day 1. No excuses."}
      </div>
    </div>
  );
}
export default BulkTracker;
