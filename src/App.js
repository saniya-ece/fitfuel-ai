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
              padding:"10px 12px", background:C.subtle, borderRadius:9, marginBottom:6 }}