import { useState, useEffect, useRef } from "react";

/* ─── THEME ─────────────────────────────────────────────── */
const C = {
  bg: "#07090f",
  surface: "#0e1117",
  card: "#131820",
  border: "#1d2535",
  accent: "#f97316",
  accentDim: "#c2540a",
  accentGlow: "rgba(249,115,22,0.12)",
  accentGlow2: "rgba(249,115,22,0.06)",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  red: "#ef4444",
  yellow: "#eab308",
  text: "#f1f5f9",
  muted: "#64748b",
  subtle: "#1e293b",
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Outfit', sans-serif; }
  input, select, textarea { font-family: 'Outfit', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } 
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .fade-up { animation: fadeUp .4s ease forwards; }
  .fade-up-1 { animation: fadeUp .4s .05s ease both; }
  .fade-up-2 { animation: fadeUp .4s .1s ease both; }
  .fade-up-3 { animation: fadeUp .4s .15s ease both; }
  .fade-up-4 { animation: fadeUp .4s .2s ease both; }
  .spinner { animation: spin 1s linear infinite; }
`;

/* ─── CONSTANTS ──────────────────────────────────────────── */
const ALLERGIES = ["Dairy/Milk","Gluten","Tree Nuts","Eggs","Soy","Shellfish","Fish","Wheat","Peanuts","Sesame"];
const ACTIVITY = [
  { label: "Sedentary", desc: "Little / no exercise", mult: 1.2 },
  { label: "Lightly Active", desc: "1–3 days/week", mult: 1.375 },
  { label: "Moderately Active", desc: "3–5 days/week", mult: 1.55 },
  { label: "Very Active", desc: "6–7 days/week", mult: 1.725 },
  { label: "Athlete", desc: "2× training/day", mult: 1.9 },
];
const GOALS = [
  { id: "lose", label: "Lose Weight", icon: "🔥", adj: -500, color: C.red },
  { id: "maintain", label: "Maintain", icon: "⚖️", adj: 0, color: C.blue },
  { id: "gain", label: "Gain Muscle", icon: "💪", adj: +350, color: C.green },
];
const COMMON_FOODS = [
  { name: "Oats (100g)", cal: 389, p: 17, c: 66, f: 7 },
  { name: "Chicken Breast (100g)", cal: 165, p: 31, c: 0, f: 3.6 },
  { name: "Brown Rice (100g)", cal: 216, p: 4.5, c: 45, f: 1.8 },
  { name: { name: "Egg (1 whole)", cal: 78, p: 6, c: 0.6, f: 5 } },
  { name: "Banana (1 medium)", cal: 89, p: 1.1, c: 23, f: 0.3 },
  { name: "Greek Yogurt (100g)", cal: 59, p: 10, c: 3.6, f: 0.4 },
  { name: "Almonds (30g)", cal: 173, p: 6, c: 6, f: 15 },
  { name: "Salmon (100g)", cal: 208, p: 20, c: 0, f: 13 },
  { name: "Sweet Potato (100g)", cal: 86, p: 1.6, c: 20, f: 0.1 },
  { name: "Avocado (100g)", cal: 160, p: 2, c: 9, f: 15 },
  { name: "Whole Milk (200ml)", cal: 130, p: 6.4, c: 9.6, f: 7.2 },
  { name: "Protein Shake", cal: 120, p: 25, c: 3, f: 2 },
];
const WORKOUTS = {
  lose:     [["🚴 Cycling","45 min"],["🏃 HIIT Run","30 min"],["⚡ Jump Rope","20 min"],["🧘 Yoga Stretch","40 min"],["🏊 Swimming","45 min"]],
  maintain: [["🏋️ Full Body Lift","40 min"],["🏃 Easy Jog","30 min"],["🧘 Yoga","45 min"],["🚴 Cycling","35 min"],["🤸 Bodyweight","30 min"]],
  gain:     [["🏋️ Bench Press","4×10"],["🦵 Squats","4×12"],["⬆️ Deadlifts","3×8"],["💪 Pull-Ups","4×8"],["🏋️ Shoulder Press","3×10"]],
};

/* ─── HELPERS ────────────────────────────────────────────── */
const bmi = (w, h) => (w / ((h / 100) ** 2)).toFixed(1);
const bmr = (w, h, a, g) => g === "male" ? 10*w+6.25*h-5*a+5 : 10*w+6.25*h-5*a-161;
const bmiCat = (b) => b < 18.5 ? { label:"Underweight", color:C.blue, pct:15 }
  : b < 25 ? { label:"Normal", color:C.green, pct:40 }
  : b < 30 ? { label:"Overweight", color:C.yellow, pct:65 }
  : { label:"Obese", color:C.red, pct:88 };
const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => Number(n).toLocaleString();

/* ─── SUB-COMPONENTS ─────────────────────────────────────── */
const Pill = ({ children, color = C.accent, small }) => (
  <span style={{ display:"inline-block", background:`${color}22`, border:`1px solid ${color}44`,
    color, borderRadius:99, padding: small ? "2px 10px" : "4px 14px",
    fontSize: small ? ".7rem" : ".75rem", fontWeight:600, letterSpacing:.5 }}>
    {children}
  </span>
);

const Chip = ({ label, active, onClick, color = C.accent }) => (
  <div onClick={onClick} style={{ padding:"8px 12px", borderRadius:10,
    border:`1.5px solid ${active ? color : C.border}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : C.muted, cursor:"pointer", fontSize:".83rem",
    fontWeight: active ? 600 : 400, transition:"all .18s", userSelect:"none" }}>
    {label}
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:14 }}>
    {label && <div style={{ fontSize:".72rem", color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:.8 }}>{label}</div>}
    <input {...props} style={{ width:"100%", background:"#0a0d14", border:`1.5px solid ${C.border}`,
      borderRadius:10, padding:"11px 14px", color:C.text, fontSize:"1rem", outline:"none",
      transition:"border .2s", ...props.style }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);

const Card = ({ children, style, className }) => (
  <div className={className} style={{ background:C.card, border:`1px solid ${C.border}`,
    borderRadius:18, padding:22, marginBottom:16, ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <div style={{ fontSize:".75rem", fontWeight:700, color:C.accent, textTransform:"uppercase",
    letterSpacing:1.5, marginBottom:16, display:"flex", alignItems:"center", gap:7 }}>
    {icon} {children}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style: s }) => (
  <button onClick={onClick} style={{
    background: variant === "primary" ? `linear-gradient(135deg,${C.accent},${C.accentDim})` : C.subtle,
    color: variant === "primary" ? "#000" : C.muted,
    border: "none", borderRadius:12, padding:"13px 20px", fontSize:".93rem",
    fontWeight:700, cursor:"pointer", transition:"opacity .2s", ...s }}
    onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
    {children}
  </button>
);

const MacroBar = ({ label, val, max, color }) => (
  <div style={{ marginBottom:10 }}>
    <div style={{ display:"flex", justifyContent:"space-between", fontSize:".78rem", marginBottom:4 }}>
      <span style={{ color:C.muted }}>{label}</span>
      <span style={{ color, fontWeight:600 }}>{val}g</span>
    </div>
    <div style={{ height:6, borderRadius:99, background:C.subtle }}>
      <div style={{ height:6, borderRadius:99, background:color,
        width:`${Math.min((val/max)*100, 100)}%`, transition:"width .6s ease" }} />
    </div>
  </div>
);

const StatBox = ({ label, value, unit, color = C.accent, icon }) => (
  <div style={{ background:"#0a0d14", border:`1px solid ${color}33`, borderRadius:14,
    padding:16, textAlign:"center" }}>
    {icon && <div style={{ fontSize:"1.4rem", marginBottom:4 }}>{icon}</div>}
    <div style={{ fontSize:"1.9rem", fontWeight:800, color, fontFamily:"'Syne',sans-serif",
      lineHeight:1 }}>{fmt(value)}</div>
    {unit && <div style={{ fontSize:".7rem", color:C.muted, marginTop:2 }}>{unit}</div>}
    <div style={{ fontSize:".68rem", color:C.muted, marginTop:4, textTransform:"uppercase", letterSpacing:.8 }}>{label}</div>
  </div>
);

/* ─── AI RECIPE GENERATOR ────────────────────────────────── */
function AIRecipes({ profile, calories, allergies }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [pref, setPref] = useState("");

  const generate = async () => {
    setLoading(true);
    setRecipes([]);
    try {
      const allergyStr = allergies.length ? `Allergies to avoid: ${allergies.join(", ")}.` : "No allergies.";
      const prompt = `You are a professional nutritionist AI. Generate 4 healthy meal recipes for someone with these details:
Goal: ${profile.goal}, Daily calories: ${calories} kcal, Age: ${profile.age}, Weight: ${profile.weight}kg.
${allergyStr} ${pref ? `Preference: ${pref}.` : ""}

Return ONLY valid JSON array (no markdown, no backticks) with this exact structure:
[{"name":"...","emoji":"...","calories":123,"protein":12,"carbs":30,"fat":8,"time":"20 min","difficulty":"Easy","ingredients":["item1","item2","item3","item4"],"steps":["step1","step2","step3"]}]

Make recipes realistic, delicious, and allergy-safe. Use varied meal types.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRecipes(parsed);
      setGenerated(true);
    } catch (e) {
      setRecipes([{ name: "Generation failed", emoji: "❌", calories: 0, protein: 0, carbs: 0, fat: 0, time: "-", difficulty: "-", ingredients: ["Please try again"], steps: ["API error"] }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <Card className="fade-up">
        <SectionTitle icon="🤖">AI Recipe Generator</SectionTitle>
        <p style={{ color:C.muted, fontSize:".85rem", marginBottom:14 }}>
          Our AI creates personalized recipes based on your health profile, calorie target & allergies.
        </p>
        <Input label="Optional preference (e.g. vegetarian, Indian, quick meals)"
          placeholder="e.g. high protein vegetarian..."
          value={pref} onChange={e => setPref(e.target.value)} />
        <Btn onClick={generate} style={{ width:"100%" }}>
          {loading ? "✨ Generating..." : generated ? "🔄 Generate New Recipes" : "✨ Generate AI Recipes"}
        </Btn>
      </Card>

      {loading && (
        <div style={{ textAlign:"center", padding:"40px 0", color:C.muted }}>
          <div style={{ width:40, height:40, border:`3px solid ${C.border}`,
            borderTop:`3px solid ${C.accent}`, borderRadius:"50%", margin:"0 auto 14px",
            animation:"spin 1s linear infinite" }} />
          <div style={{ fontSize:".9rem" }}>AI is crafting your personalized recipes...</div>
        </div>
      )}

      {recipes.map((r, i) => (
        <Card key={i} className={`fade-up-${(i%4)+1}`}
          style={{ borderLeft:`3px solid ${C.accent}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:"1.15rem", fontWeight:700 }}>{r.emoji} {r.name}</div>
              <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                <Pill small color={C.accent}>⏱ {r.time}</Pill>
                <Pill small color={C.blue}>{r.difficulty}</Pill>
                <Pill small color={C.green}>{r.calories} kcal</Pill>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            {[["Protein",r.protein,"g",C.red],["Carbs",r.carbs,"g",C.yellow],["Fat",r.fat,"g",C.blue]].map(([l,v,u,c]) => (
              <div key={l} style={{ background:"#0a0d14", borderRadius:9, padding:"9px 12px", textAlign:"center" }}>
                <div style={{ fontSize:"1rem", fontWeight:700, color:c }}>{v}{u}</div>
                <div style={{ fontSize:".68rem", color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:".72rem", color:C.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:7 }}>Ingredients</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {r.ingredients?.map((ing, j) => (
                <span key={j} style={{ background:C.subtle, borderRadius:6, padding:"4px 10px", fontSize:".8rem" }}>{ing}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:".72rem", color:C.muted, textTransform:"uppercase", letterSpacing:.8, marginBottom:7 }}>Steps</div>
            {r.steps?.map((s, j) => (
              <div key={j} style={{ display:"flex", gap:10, marginBottom:7, alignItems:"flex-start" }}>
                <span style={{ background:C.accentGlow, color:C.accent, borderRadius:"50%",
                  width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:".7rem", fontWeight:700, flexShrink:0, marginTop:1 }}>{j+1}</span>
                <span style={{ fontSize:".84rem", color:C.text, lineHeight:1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ─── FOOD LOG ───────────────────────────────────────────── */
function FoodLog({ targetCalories, targetProtein }) {
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ff_foodlog") || "{}"); } catch { return {}; }
  });
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState({ name:"", cal:"", p:"", c:"", f:"" });
  const [tab, setTab] = useState("quick");

  const saveLog = (newLog) => {
    setLog(newLog);
    try { localStorage.setItem("ff_foodlog", JSON.stringify(newLog)); } catch {}
  };

  const todayKey = today();
  const todayLog = log[todayKey] || [];
  const totals = todayLog.reduce((a, f) => ({ cal: a.cal+(f.cal||0), p: a.p+(f.p||0), c: a.c+(f.c||0), f: a.f+(f.f||0) }), { cal:0, p:0, c:0, f:0 });

  const addFood = (food) => {
    const entry = { ...food, id: Date.now(), time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) };
    const updated = { ...log, [todayKey]: [...todayLog, entry] };
    saveLog(updated);
  };

  const removeFood = (id) => {
    const updated = { ...log, [todayKey]: todayLog.filter(f => f.id !== id) };
    saveLog(updated);
  };

  const addCustom = () => {
    if (!custom.name || !custom.cal) return;
    addFood({ name: custom.name, cal: +custom.cal, p: +custom.p||0, c: +custom.c||0, f: +custom.f||0 });
    setCustom({ name:"", cal:"", p:"", c:"", f:"" });
  };

  const filtered = COMMON_FOODS.filter(f => f.name && typeof f.name === "string" && f.name.toLowerCase().includes(search.toLowerCase()));
  const calPct = Math.min((totals.cal / targetCalories) * 100, 100);
  const remaining = targetCalories - totals.cal;

  return (
    <div>
      {/* Daily Summary */}
      <Card className="fade-up">
        <SectionTitle icon="📋">Today's Summary</SectionTitle>
        <div style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:".85rem", color:C.muted }}>Calories</span>
            <span style={{ fontSize:".85rem", fontWeight:600 }}>
              <span style={{ color: totals.cal > targetCalories ? C.red : C.accent }}>{fmt(totals.cal)}</span>
              <span style={{ color:C.muted }}> / {fmt(targetCalories)}</span>
            </span>
          </div>
          <div style={{ height:10, borderRadius:99, background:C.subtle }}>
            <div style={{ height:10, borderRadius:99,
              background: calPct > 95 ? C.red : calPct > 80 ? C.yellow : C.accent,
              width:`${calPct}%`, transition:"width .5s ease" }} />
          </div>
          <div style={{ fontSize:".78rem", color:C.muted, marginTop:6 }}>
            {remaining > 0 ? `${fmt(remaining)} kcal remaining` : `${fmt(-remaining)} kcal over target`}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          <MacroBar label="Protein" val={Math.round(totals.p)} max={targetProtein} color={C.red} />
          <MacroBar label="Carbs" val={Math.round(totals.c)} max={targetCalories*0.45/4} color={C.yellow} />
          <MacroBar label="Fat" val={Math.round(totals.f)} max={targetCalories*0.25/9} color={C.blue} />
        </div>
      </Card>

      {/* Add Food */}
      <Card className="fade-up-1">
        <SectionTitle icon="➕">Add Food</SectionTitle>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {["quick","custom"].map(t => (
            <Chip key={t} label={t === "quick" ? "🔍 Quick Add" : "✏️ Custom"} active={tab===t} onClick={() => setTab(t)} />
          ))}
        </div>

        {tab === "quick" && <>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search foods..."
            style={{ width:"100%", background:"#0a0d14", border:`1.5px solid ${C.border}`,
              borderRadius:10, padding:"10px 14px", color:C.text, fontSize:".9rem",
              outline:"none", marginBottom:10 }} />
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            {filtered.map((f, i) => f.name && typeof f.name === "string" && (
              <div key={i} onClick={() => addFood(f)}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 12px", borderRadius:9, cursor:"pointer", marginBottom:4,
                  background:C.subtle, transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.accent}18`}
                onMouseLeave={e => e.currentTarget.style.background = C.subtle}>
                <span style={{ fontSize:".87rem" }}>{f.name}</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <Pill small>{f.cal} kcal</Pill>
                  <span style={{ color:C.accent, fontWeight:700, fontSize:"1.1rem" }}>+</span>
                </div>
              </div>
            ))}
          </div>
        </>}

        {tab === "custom" && <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Food Name" placeholder="e.g. Dal Rice" value={custom.name} onChange={e => setCustom(p => ({...p, name:e.target.value}))} />
            <Input label="Calories" type="number" placeholder="kcal" value={custom.cal} onChange={e => setCustom(p => ({...p, cal:e.target.value}))} />
            <Input label="Protein (g)" type="number" placeholder="g" value={custom.p} onChange={e => setCustom(p => ({...p, p:e.target.value}))} />
            <Input label="Carbs (g)" type="number" placeholder="g" value={custom.c} onChange={e => setCustom(p => ({...p, c:e.target.value}))} />
          </div>
          <Btn onClick={addCustom} style={{ width:"100%", marginTop:4 }}>Add Custom Food</Btn>
        </>}
      </Card>

      {/* Today's Log */}
      <Card className="fade-up-2">
        <SectionTitle icon="🍽️">Today's Log</SectionTitle>
        {todayLog.length === 0
          ? <div style={{ color:C.muted, fontSize:".88rem", textAlign:"center", padding:"20px 0" }}>No food logged yet. Start adding meals above!</div>
          : todayLog.map(f => (
            <div key={f.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 12px", background:C.subtle, borderRadius:9, marginBottom:6 }}>
              <div>
                <div style={{ fontSize:".88rem", fontWeight:500 }}>{f.name}</div>
                <div style={{ fontSize:".73rem", color:C.muted }}>{f.time} · P:{f.p}g C:{f.c}g F:{f.f}g</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Pill small>{f.cal} kcal</Pill>
                <span onClick={() => removeFood(f.id)}
                  style={{ color:C.red, cursor:"pointer", fontSize:"1rem", opacity:.7 }}>✕</span>
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
}

/* ─── PROGRESS TRACKER ───────────────────────────────────── */
function Progress({ profile }) {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ff_progress") || "[]"); } catch { return []; }
  });
  const [newW, setNewW] = useState("");
  const [newNote, setNewNote] = useState("");

  const save = (e) => {
    try { localStorage.setItem("ff_progress", JSON.stringify(e)); } catch {}
  };

  const addEntry = () => {
    if (!newW) return;
    const e = [...entries, { date: today(), weight: +newW, note: newNote, id: Date.now() }];
    setEntries(e); save(e); setNewW(""); setNewNote("");
  };

  const removeEntry = (id) => {
    const e = entries.filter(x => x.id !== id);
    setEntries(e); save(e);
  };

  const sorted = [...entries].sort((a,b) => new Date(a.date)-new Date(b.date));
  const startW = sorted[0]?.weight || +profile.weight;
  const latestW = sorted[sorted.length-1]?.weight || +profile.weight;
  const change = (latestW - startW).toFixed(1);
  const goal = GOALS.find(g => g.id === profile.goal) || GOALS[0];

  /* mini SVG chart */
  const chartData = sorted.slice(-12);
  const minW = Math.min(...chartData.map(e => e.weight)) - 2;
  const maxW = Math.max(...chartData.map(e => e.weight)) + 2;
  const W = 320, H = 100;
  const px = (i) => (i / (chartData.length - 1 || 1)) * (W - 20) + 10;
  const py = (w) => H - ((w - minW) / (maxW - minW || 1)) * (H - 20) - 10;
  const points = chartData.map((e, i) => `${px(i)},${py(e.weight)}`).join(" ");

  return (
    <div>
      <Card className="fade-up">
        <SectionTitle icon="📈">Weight Progress</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          <StatBox label="Start" value={startW} unit="kg" color={C.blue} />
          <StatBox label="Current" value={latestW} unit="kg" color={C.accent} />
          <StatBox label="Change" value={`${change > 0 ? "+" : ""}${change}`} unit="kg"
            color={change < 0 && profile.goal === "lose" ? C.green : change > 0 && profile.goal === "gain" ? C.green : C.muted} />
        </div>

        {chartData.length > 1 && (
          <div style={{ overflowX:"auto" }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:100 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity=".3" />
                  <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke={C.accent} strokeWidth="2.5"
                strokeLinejoin="round" strokeLinecap="round" points={points} />
              {chartData.map((e, i) => (
                <circle key={i} cx={px(i)} cy={py(e.weight)} r="4"
                  fill={C.accent} stroke={C.card} strokeWidth="2" />
              ))}
            </svg>
          </div>
        )}
        {chartData.length <= 1 && (
          <div style={{ color:C.muted, fontSize:".85rem", textAlign:"center", padding:"16px 0" }}>
            Log at least 2 entries to see your progress chart.
          </div>
        )}
      </Card>

      <Card className="fade-up-1">
        <SectionTitle icon="➕">Log Today's Weight</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Input label="Weight (kg)" type="number" placeholder={profile.weight}
            value={newW} onChange={e => setNewW(e.target.value)} />
          <Input label="Note (optional)" placeholder="e.g. after gym"
            value={newNote} onChange={e => setNewNote(e.target.value)} />
        </div>
        <Btn onClick={addEntry} style={{ width:"100%" }}>Log Weight</Btn>
      </Card>

      <Card className="fade-up-2">
        <SectionTitle icon="📅">History</SectionTitle>
        {entries.length === 0
          ? <div style={{ color:C.muted, fontSize:".88rem", textAlign:"center", padding:"16px 0" }}>No entries yet. Start logging!</div>
          : [...entries].reverse().map(e => (
            <div key={e.id} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"10px 12px", background:C.subtle,
              borderRadius:9, marginBottom:6 }}>
              <div>
                <div style={{ fontSize:".88rem", fontWeight:600 }}>{e.weight} kg</div>
                <div style={{ fontSize:".73rem", color:C.muted }}>{e.date}{e.note ? ` · ${e.note}` : ""}</div>
              </div>
              <span onClick={() => removeEntry(e.id)}
                style={{ color:C.red, cursor:"pointer", opacity:.7 }}>✕</span>
            </div>
          ))}
      </Card>
    </div>
  );
}

/* ─── WORKOUT PLAN ───────────────────────────────────────── */
function WorkoutPlan({ goal, calories }) {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ff_workouts") || "{}"); } catch { return {}; }
  });
  const workouts = WORKOUTS[goal] || WORKOUTS.maintain;
  const todayKey = today();
  const todayDone = completed[todayKey] || [];

  const toggle = (i) => {
    const updated = { ...completed };
    if (!updated[todayKey]) updated[todayKey] = [];
    if (updated[todayKey].includes(i)) {
      updated[todayKey] = updated[todayKey].filter(x => x !== i);
    } else {
      updated[todayKey] = [...updated[todayKey], i];
    }
    setCompleted(updated);
    try { localStorage.setItem("ff_workouts", JSON.stringify(updated)); } catch {}
  };

  const donePct = Math.round((todayDone.length / workouts.length) * 100);

  return (
    <div>
      <Card className="fade-up">
        <SectionTitle icon="🏋️">Today's Workout</SectionTitle>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ flex:1, height:8, borderRadius:99, background:C.subtle }}>
            <div style={{ height:8, borderRadius:99, background:C.green,
              width:`${donePct}%`, transition:"width .5s" }} />
          </div>
          <span style={{ color:C.green, fontWeight:700, fontSize:".88rem" }}>{donePct}%</span>
        </div>
        {workouts.map(([name, detail], i) => (
          <div key={i} onClick={() => toggle(i)}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
              background: todayDone.includes(i) ? `${C.green}18` : C.subtle,
              border:`1px solid ${todayDone.includes(i) ? C.green+"44" : C.border}`,
              borderRadius:12, marginBottom:8, cursor:"pointer", transition:"all .2s" }}>
            <div style={{ width:22, height:22, borderRadius:"50%",
              background: todayDone.includes(i) ? C.green : "transparent",
              border:`2px solid ${todayDone.includes(i) ? C.green : C.muted}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, fontSize:".7rem", color:"#000" }}>
              {todayDone.includes(i) ? "✓" : ""}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:".9rem", fontWeight:600,
                textDecoration: todayDone.includes(i) ? "line-through" : "none",
                color: todayDone.includes(i) ? C.muted : C.text }}>{name}</div>
              <div style={{ fontSize:".75rem", color:C.muted, marginTop:2 }}>{detail}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card className="fade-up-1">
        <SectionTitle icon="💡">Tips for {goal === "lose" ? "Fat Loss" : goal === "gain" ? "Muscle Gain" : "Maintenance"}</SectionTitle>
        {(goal === "lose"
          ? ["🕐 Train in a fasted state for better fat burn","💧 Drink 500ml water before each workout","🛌 7-8h sleep boosts fat-burning hormones","🔁 Aim for 3-4 sessions/week + daily walks"]
          : goal === "gain"
          ? ["🥩 Eat protein within 30 min post-workout","📈 Progressive overload every 2 weeks","🛌 Muscles grow during sleep — prioritize rest","💊 Creatine can boost strength by 10-15%"]
          : ["🧘 Balance cardio and strength training","⚖️ Consistency beats intensity every time","📊 Track weekly not daily — weight fluctuates","🎯 Set a new performance goal each month"]
        ).map((tip, i) => (
          <div key={i} style={{ padding:"10px 14px", background:C.subtle, borderRadius:9, marginBottom:7,
            fontSize:".84rem", color:C.text }}>{tip}</div>
        ))}
      </Card>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────── */
export default function FitFuelAI() {
  const [screen, setScreen] = useState("splash");
  const [authMode, setAuthMode] = useState("login");
  const [users, setUsers] = useState(() => { try { return JSON.parse(localStorage.getItem("ff_users")||"{}"); } catch { return {}; } });
  const [currentUser, setCurrentUser] = useState(() => { try { return localStorage.getItem("ff_currentuser")||null; } catch { return null; } });
  const [authForm, setAuthForm] = useState({ name:"", email:"", password:"" });
  const [authErr, setAuthErr] = useState("");
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [form, setForm] = useState({ name:"", age:"", weight:"", height:"", gender:"male", activity:1, goal:"lose", allergies:[] });
  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    setTimeout(() => setScreen(currentUser ? "app" : "auth"), 1800);
    if (currentUser) {
      try {
        const u = JSON.parse(localStorage.getItem("ff_users")||"{}");
        if (u[currentUser]?.profile) { setProfile(u[currentUser].profile); calcResults(u[currentUser].profile); }
        else setScreen("onboard");
      } catch {}
    }
  }, []);

  const saveUsers = (u) => { setUsers(u); try { localStorage.setItem("ff_users", JSON.stringify(u)); } catch {} };

  const login = () => {
    setAuthErr("");
    if (!users[authForm.email]) { setAuthErr("No account found. Please sign up."); return; }
    if (users[authForm.email].password !== authForm.password) { setAuthErr("Incorrect password."); return; }
    setCurrentUser(authForm.email);
    try { localStorage.setItem("ff_currentuser", authForm.email); } catch {}
    const u = users[authForm.email];
    if (u.profile) { setProfile(u.profile); calcResults(u.profile); setScreen("app"); }
    else setScreen("onboard");
  };

  const signup = () => {
    setAuthErr("");
    if (!authForm.name || !authForm.email || !authForm.password) { setAuthErr("Please fill all fields."); return; }
    if (authForm.password.length < 6) { setAuthErr("Password must be 6+ characters."); return; }
    if (users[authForm.email]) { setAuthErr("Account already exists. Please login."); return; }
    const newUsers = { ...users, [authForm.email]: { name: authForm.name, password: authForm.password, email: authForm.email } };
    saveUsers(newUsers);
    setCurrentUser(authForm.email);
    try { localStorage.setItem("ff_currentuser", authForm.email); } catch {}
    setScreen("onboard");
  };

  const logout = () => {
    setCurrentUser(null); setProfile(null); setResults(null);
    try { localStorage.removeItem("ff_currentuser"); } catch {}
    setScreen("auth");
  };

  const calcResults = (p) => {
    const w = +p.weight, h = +p.height, a = +p.age;
    const bmiVal = bmi(w, h);
    const bmrVal = bmr(w, h, a, p.gender);
    const tdeeVal = Math.round(bmrVal * ACTIVITY[p.activity].mult);
    const goalObj = GOALS.find(g => g.id === p.goal);
    const target = Math.max(1200, tdeeVal + (goalObj?.adj || 0));
    const protein = Math.round(w * 2.0);
    setResults({
      bmi: bmiVal, bmiCat: bmiCat(bmiVal), bmr: Math.round(bmrVal),
      tdee: tdeeVal, target, protein,
      carbs: Math.round((target * 0.45) / 4),
      fats: Math.round((target * 0.25) / 9),
      goalObj,
    });
  };

  const submitProfile = () => {
    if (!form.age || !form.weight || !form.height) return;
    const p = { ...form };
    setProfile(p); calcResults(p);
    const newUsers = { ...users, [currentUser]: { ...users[currentUser], profile: p } };
    saveUsers(newUsers);
    setScreen("app");
    setActiveNav("dashboard");
  };

  const toggleAllergy = (a) => setForm(f => ({
    ...f, allergies: f.allergies.includes(a) ? f.allergies.filter(x => x !== a) : [...f.allergies, a]
  }));

  /* ── SPLASH ── */
  if (screen === "splash") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", background:C.bg,
      backgroundImage:`radial-gradient(ellipse at 50% 0%, ${C.accentGlow} 0%, transparent 55%)` }}>
      <style>{globalCSS}</style>
      <div style={{ fontSize:"3.5rem", marginBottom:16 }}>⚡</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2.4rem", fontWeight:800,
        color:C.accent, letterSpacing:-1 }}>FitFuel AI</div>
      <div style={{ color:C.muted, marginTop:8, fontSize:".9rem" }}>Loading your health companion...</div>
      <div style={{ marginTop:24, width:40, height:40, border:`3px solid ${C.border}`,
        borderTop:`3px solid ${C.accent}`, borderRadius:"50%",
        animation:"spin 1s linear infinite" }} />
    </div>
  );

  /* ── AUTH ── */
  if (screen === "auth") return (
    <div style={{ minHeight:"100vh", background:C.bg,
      backgroundImage:`radial-gradient(ellipse at 50% 0%, ${C.accentGlow} 0%, transparent 55%)`,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <style>{globalCSS}</style>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }} className="fade-up">
          <div style={{ fontSize:"2.5rem", marginBottom:8 }}>⚡</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, color:C.accent }}>FitFuel AI</div>
          <div style={{ color:C.muted, fontSize:".88rem", marginTop:4 }}>Your personal AI nutritionist</div>
        </div>

        <Card className="fade-up-1">
          <div style={{ display:"flex", gap:8, marginBottom:22 }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthErr(""); }}
                style={{ flex:1, padding:"10px", borderRadius:10, border:"none",
                  background: authMode===m ? C.accent : C.subtle,
                  color: authMode===m ? "#000" : C.muted,
                  fontWeight:700, cursor:"pointer", fontSize:".88rem", fontFamily:"'Outfit',sans-serif" }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {authMode === "signup" && (
            <Input label="Full Name" placeholder="Your name" value={authForm.name}
              onChange={e => setAuthForm(p => ({...p, name:e.target.value}))} />
          )}
          <Input label="Email" type="email" placeholder="you@example.com" value={authForm.email}
            onChange={e => setAuthForm(p => ({...p, email:e.target.value}))} />
          <Input label="Password" type="password" placeholder="••••••" value={authForm.password}
            onChange={e => setAuthForm(p => ({...p, password:e.target.value}))} />

          {authErr && <div style={{ background:`${C.red}18`, border:`1px solid ${C.red}44`,
            borderRadius:9, padding:"10px 14px", color:C.red, fontSize:".83rem", marginBottom:12 }}>
            {authErr}
          </div>}

          <Btn onClick={authMode === "login" ? login : signup} style={{ width:"100%" }}>
            {authMode === "login" ? "Log In →" : "Create Account →"}
          </Btn>

          <div style={{ textAlign:"center", marginTop:12, fontSize:".78rem", color:C.muted }}>
            🔒 Your data is stored locally on your device
          </div>
        </Card>
      </div>
    </div>
  );

  /* ── ONBOARD ── */
  if (screen === "onboard") {
    const steps = ["Body Stats", "Activity & Goal", "Allergies"];
    return (
      <div style={{ minHeight:"100vh", background:C.bg,
        backgroundImage:`radial-gradient(ellipse at 50% 0%, ${C.accentGlow} 0%, transparent 55%)`,
        padding:"24px 16px 60px" }}>
        <style>{globalCSS}</style>
        <div style={{ maxWidth:500, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:28 }} className="fade-up">
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.8rem", fontWeight:800, color:C.accent }}>
              ⚡ FitFuel AI
            </div>
            <div style={{ color:C.muted, fontSize:".88rem", marginTop:4 }}>
              Welcome! Let's set up your profile.
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display:"flex", gap:8, marginBottom:24, justifyContent:"center" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:28, height:28, borderRadius:"50%",
                  background: formStep > i+1 ? C.green : formStep === i+1 ? C.accent : C.subtle,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:".75rem", fontWeight:700, color: formStep >= i+1 ? "#000" : C.muted }}>
                  {formStep > i+1 ? "✓" : i+1}
                </div>
                {i < steps.length-1 && <div style={{ width:24, height:2, borderRadius:1,
                  background: formStep > i+1 ? C.green : C.border }} />}
              </div>
            ))}
          </div>

          {formStep === 1 && (
            <Card className="fade-up">
              <SectionTitle icon="👤">Body Stats</SectionTitle>
              <Input label="Age (years)" type="number" placeholder="e.g. 25"
                value={form.age} onChange={e => setForm(f=>({...f,age:e.target.value}))} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Input label="Weight (kg)" type="number" placeholder="e.g. 75"
                  value={form.weight} onChange={e => setForm(f=>({...f,weight:e.target.value}))} />
                <Input label="Height (cm)" type="number" placeholder="e.g. 170"
                  value={form.height} onChange={e => setForm(f=>({...f,height:e.target.value}))} />
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:".72rem", color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:.8 }}>Gender</div>
                <div style={{ display:"flex", gap:8 }}>
                  {["male","female"].map(g => (
                    <Chip key={g} label={g === "male" ? "♂ Male" : "♀ Female"}
                      active={form.gender===g} onClick={() => setForm(f=>({...f,gender:g}))} />
                  ))}
                </div>
              </div>
              <Btn onClick={() => form.age && form.weight && form.height && setFormStep(2)}
                style={{ width:"100%" }}>Next →</Btn>
            </Card>
          )}

          {formStep === 2 && (
            <Card className="fade-up">
              <SectionTitle icon="⚡">Activity Level</SectionTitle>
              {ACTIVITY.map((a, i) => (
                <div key={i} onClick={() => setForm(f=>({...f,activity:i}))}
                  style={{ padding:"11px 14px", borderRadius:10, marginBottom:7, cursor:"pointer",
                    border:`1.5px solid ${form.activity===i ? C.accent : C.border}`,
                    background: form.activity===i ? C.accentGlow : "transparent", transition:"all .18s" }}>
                  <span style={{ fontWeight:600, color: form.activity===i ? C.accent : C.text }}>{a.label}</span>
                  <span style={{ color:C.muted, fontSize:".8rem", marginLeft:8 }}>{a.desc}</span>
                </div>
              ))}
              <div style={{ marginTop:16, marginBottom:16 }}>
                <SectionTitle icon="🎯">Your Goal</SectionTitle>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {GOALS.map(g => (
                    <div key={g.id} onClick={() => setForm(f=>({...f,goal:g.id}))}
                      style={{ padding:"14px 8px", borderRadius:12, textAlign:"center", cursor:"pointer",
                        border:`1.5px solid ${form.goal===g.id ? g.color : C.border}`,
                        background: form.goal===g.id ? `${g.color}18` : "transparent", transition:"all .18s" }}>
                      <div style={{ fontSize:"1.6rem" }}>{g.icon}</div>
                      <div style={{ fontSize:".75rem", fontWeight:600,
                        color: form.goal===g.id ? g.color : C.muted, marginTop:4 }}>{g.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="ghost" onClick={() => setFormStep(1)} style={{ flex:1 }}>← Back</Btn>
                <Btn onClick={() => setFormStep(3)} style={{ flex:2 }}>Next →</Btn>
              </div>
            </Card>
          )}

          {formStep === 3 && (
            <Card className="fade-up">
              <SectionTitle icon="🚫">Food Allergies</SectionTitle>
              <p style={{ color:C.muted, fontSize:".84rem", marginBottom:14 }}>
                Select any allergies so we can personalize your meal plans.
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
                {ALLERGIES.map(a => (
                  <Chip key={a} label={a} active={form.allergies.includes(a)} onClick={() => toggleAllergy(a)} />
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="ghost" onClick={() => setFormStep(2)} style={{ flex:1 }}>← Back</Btn>
                <Btn onClick={submitProfile} style={{ flex:2 }}>Let's Go! 🚀</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  /* ── MAIN APP ── */
  if (screen === "app" && profile && results) {
    const userName = users[currentUser]?.name || "User";
    const goal = GOALS.find(g => g.id === profile.goal) || GOALS[0];
    const navItems = [
      { id:"dashboard", icon:"📊", label:"Dashboard" },
      { id:"foodlog", icon:"🍽️", label:"Food Log" },
      { id:"progress", icon:"📈", label:"Progress" },
      { id:"workout", icon:"🏋️", label:"Workout" },
      { id:"recipes", icon:"🤖", label:"AI Recipes" },
    ];

    return (
      <div style={{ minHeight:"100vh", background:C.bg, paddingBottom:80 }}>
        <style>{globalCSS}</style>

        {/* Header */}
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
          padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center",
          position:"sticky", top:0, zIndex:100, backdropFilter:"blur(10px)" }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.2rem", fontWeight:800, color:C.accent }}>⚡ FitFuel AI</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:".8rem", fontWeight:600 }}>{userName}</div>
              <div style={{ fontSize:".68rem", color:C.muted }}>{goal.icon} {goal.label}</div>
            </div>
            <button onClick={logout} style={{ background:C.subtle, border:"none", borderRadius:8,
              padding:"6px 12px", color:C.muted, cursor:"pointer", fontSize:".75rem", fontFamily:"'Outfit',sans-serif" }}>
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:600, margin:"0 auto", padding:"20px 14px" }}>

          {/* DASHBOARD */}
          {activeNav === "dashboard" && (
            <div>
              <div className="fade-up" style={{ marginBottom:20 }}>
                <div style={{ fontSize:"1.4rem", fontWeight:700 }}>Hey, {userName.split(" ")[0]}! 👋</div>
                <div style={{ color:C.muted, fontSize:".87rem", marginTop:3 }}>Here's your health snapshot</div>
              </div>

              {/* BMI Banner */}
              <div className="fade-up-1" style={{ background:`linear-gradient(135deg, ${results.bmiCat.color}22, ${results.bmiCat.color}08)`,
                border:`1px solid ${results.bmiCat.color}44`, borderRadius:18, padding:20, marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:".72rem", color:C.muted, textTransform:"uppercase", letterSpacing:.8 }}>BMI Status</div>
                    <div style={{ fontSize:"2.2rem", fontWeight:800, color:results.bmiCat.color,
                      fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{results.bmi}</div>
                    <Pill color={results.bmiCat.color}>{results.bmiCat.label}</Pill>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:".72rem", color:C.muted, textTransform:"uppercase", letterSpacing:.8 }}>Daily Target</div>
                    <div style={{ fontSize:"2rem", fontWeight:800, color:C.accent,
                      fontFamily:"'Syne',sans-serif" }}>{fmt(results.target)}</div>
                    <div style={{ fontSize:".75rem", color:C.muted }}>kcal / day</div>
                  </div>
                </div>
                {/* BMI bar */}
                <div style={{ marginTop:14 }}>
                  <div style={{ height:6, borderRadius:99,
                    background:`linear-gradient(90deg, ${C.blue}, ${C.green}, ${C.yellow}, ${C.red})` }}>
                  </div>
                  <div style={{ position:"relative", height:0 }}>
                    <div style={{ position:"absolute",
                      left:`${results.bmiCat.pct}%`, top:-10, transform:"translateX(-50%)",
                      width:16, height:16, borderRadius:"50%", background:"#fff",
                      border:`2.5px solid ${results.bmiCat.color}`,
                      boxShadow:`0 0 8px ${results.bmiCat.color}` }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    marginTop:12, fontSize:".68rem", color:C.muted }}>
                    <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="fade-up-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <StatBox label="BMR" value={results.bmr} unit="kcal/day" icon="🔥" />
                <StatBox label="TDEE" value={results.tdee} unit="kcal/day" icon="⚡" color={C.blue} />
                <StatBox label="Protein Goal" value={results.protein} unit="g/day" icon="🥩" color={C.red} />
                <StatBox label="Fat Goal" value={results.fats} unit="g/day" icon="🫒" color={C.yellow} />
              </div>

              {/* Macros */}
              <Card className="fade-up-3">
                <SectionTitle icon="⚖️">Daily Macros</SectionTitle>
                <MacroBar label="Protein" val={results.protein} max={results.protein} color={C.red} />
                <MacroBar label="Carbohydrates" val={results.carbs} max={results.carbs} color={C.yellow} />
                <MacroBar label="Fats" val={results.fats} max={results.fats} color={C.blue} />
                <div style={{ fontSize:".78rem", color:C.muted, marginTop:10 }}>
                  💡 Split across 3 meals + 1-2 snacks for best results
                </div>
              </Card>

              {/* Allergies */}
              {profile.allergies?.length > 0 && (
                <Card className="fade-up-4">
                  <SectionTitle icon="🚫">Your Allergies on File</SectionTitle>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {profile.allergies.map(a => <Pill key={a} color={C.red}>{a}</Pill>)}
                  </div>
                  <div style={{ fontSize:".78rem", color:C.muted, marginTop:10 }}>
                    All AI recipes will automatically avoid these ingredients.
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeNav === "foodlog" && <FoodLog targetCalories={results.target} targetProtein={results.protein} />}
          {activeNav === "progress" && <Progress profile={profile} />}
          {activeNav === "workout" && <WorkoutPlan goal={profile.goal} calories={results.target} />}
          {activeNav === "recipes" && <AIRecipes profile={profile} calories={results.target} allergies={profile.allergies || []} />}
        </div>

        {/* Bottom Nav */}
        <div style={{ position:"fixed", bottom:0, left:0, right:0,
          background:C.surface, borderTop:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-around", padding:"8px 0 12px",
          zIndex:100 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setActiveNav(n.id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center",
                gap:3, cursor:"pointer", padding:"4px 10px", borderRadius:10,
                background: activeNav===n.id ? C.accentGlow : "transparent",
                transition:"all .18s" }}>
              <span style={{ fontSize:"1.2rem" }}>{n.icon}</span>
              <span style={{ fontSize:".6rem", color: activeNav===n.id ? C.accent : C.muted,
                fontWeight: activeNav===n.id ? 700 : 400, textTransform:"uppercase", letterSpacing:.5 }}>
                {n.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
