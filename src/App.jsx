import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart
} from "recharts";
import { Analytics } from "@vercel/analytics/react";
import { CONTENT as C_TEXT } from "./content.js";


// ============================================================
//  LAYER 1 — STATIC DATA STORE
// ============================================================

const STATIC_DATA = {
  income: [
    { year: 1967, black: 29340,  white: 49990  },
    { year: 1970, black: 32557,  white: 55185  },
    { year: 1975, black: 30736,  white: 52291  },
    { year: 1980, black: 30826,  white: 54437  },
    { year: 1985, black: 32020,  white: 58021  },
    { year: 1990, black: 34076,  white: 61594  },
    { year: 1995, black: 33988,  white: 62041  },
    { year: 2000, black: 40425,  white: 72081  },
    { year: 2005, black: 37860,  white: 69803  },
    { year: 2010, black: 35890,  white: 65282  },
    { year: 2015, black: 38555,  white: 71588  },
    { year: 2019, black: 46600,  white: 79423  },
    { year: 2021, black: 48297,  white: 77999  },
    { year: 2022, black: 52860,  white: 81060  },
  ],
  wealth: [
    { year: 1989, black: 12000,  white: 130000 },
    { year: 1992, black: 13000,  white: 130000 },
    { year: 1995, black: 12000,  white: 120000 },
    { year: 1998, black: 14000,  white: 145000 },
    { year: 2001, black: 17000,  white: 175000 },
    { year: 2004, black: 14000,  white: 165000 },
    { year: 2007, black: 17000,  white: 180000 },
    { year: 2010, black: 11000,  white: 135000 },
    { year: 2013, black: 9000,   white: 130000 },
    { year: 2016, black: 17000,  white: 171000 },
    { year: 2019, black: 24100,  white: 189100 },
    { year: 2022, black: 44900,  white: 285000 },
  ],
};

// ============================================================
//  LAYER 2 — DATA SERVICE
// ============================================================

async function fetchIncomeData() {
  return STATIC_DATA.income;
}

async function fetchWealthData() {
  return STATIC_DATA.wealth;
}

// ============================================================
//  LAYER 3 — DATA NORMALISATION
// ============================================================

const normalise = (d) => ({
  ...d,
  gap:   d.white - d.black,
  ratio: +(d.black / d.white * 100).toFixed(1),
});

// ============================================================
//  LAYER 4 — DATA HOOK
// ============================================================

function useInequalityData() {
  const [incomeData, setIncomeData] = useState([]);
  const [wealthData, setWealthData] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchIncomeData(), fetchWealthData()])
      .then(([income, wealth]) => {
        setIncomeData(income.map(normalise));
        setWealthData(wealth.map(normalise));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
  }, []);

  return { incomeData, wealthData, loading, error };
}

// ============================================================
//  LAYER 5 — DESIGN TOKENS & FORMATTING UTILITIES
// ============================================================

const C = {
  gold:      "#c9a84c",
  amber:     "#e8c97a",
  rust:      "#e07040",
  blue:      "#6688cc",
  bg:        "#0b0d14",
  surface:   "#0f1117",
  surface2:  "#13161f",
  grid:      "#1e2330",
  border:    "#2a2f3d",
  textMuted: "#7a8899",
  textDim:   "#556677",
  textFaint: "#3a4555",
  textGhost: "#2a3040",
};

const fmt  = (n) => "$" + (n || 0).toLocaleString();
const fmtK = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(0) + "k" : "$" + n;
const monoStyle  = { fontFamily: "'DM Mono', monospace" };
const serifStyle = { fontFamily: "'Playfair Display', Georgia, serif" };
const xTick = { ...monoStyle, fontSize: 11, fill: C.textDim };
const yTick = { ...monoStyle, fontSize: 11, fill: C.textDim };

// ============================================================
//  LAYER 6 — SHARED UI COMPONENTS
// ============================================================

const IncomeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.gold}`, padding: "14px 18px", ...monoStyle, fontSize: 13 }}>
      <div style={{ color: C.gold, fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{label}</div>
      <div style={{ color: C.amber, marginBottom: 3 }}>{C_TEXT.income.legendLabels.white}: <strong>{fmt(d?.white)}</strong></div>
      <div style={{ color: C.rust,  marginBottom: 3 }}>{C_TEXT.income.legendLabels.black}: <strong>{fmt(d?.black)}</strong></div>
      <div style={{ color: C.textMuted, marginTop: 8, borderTop: "1px solid #333", paddingTop: 8 }}>
        Gap: <strong style={{ color: "#fff" }}>{fmt(d?.gap)}</strong><br />
        Black income = <strong style={{ color: "#fff" }}>{d?.ratio}¢</strong> per white $1
      </div>
    </div>
  );
};

const WealthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.gold}`, padding: "14px 18px", ...monoStyle, fontSize: 13 }}>
      <div style={{ color: C.gold, fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{label}</div>
      <div style={{ color: C.amber, marginBottom: 3 }}>{C_TEXT.wealthBar.legendLabels.white}: <strong>{fmt(d?.white)}</strong></div>
      <div style={{ color: C.rust,  marginBottom: 3 }}>{C_TEXT.wealthBar.legendLabels.black}: <strong>{fmt(d?.black)}</strong></div>
      <div style={{ color: C.textMuted, marginTop: 8, borderTop: "1px solid #333", paddingTop: 8 }}>
        Gap: <strong style={{ color: "#fff" }}>{fmt(d?.gap)}</strong><br />
        Black wealth = <strong style={{ color: "#fff" }}>{d?.ratio}¢</strong> per white $1
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{ border: `1px solid ${(accent||C.gold)}33`, borderLeft: `3px solid ${accent||C.gold}`, padding: "20px 24px", background: C.surface2, flex: 1, minWidth: 180 }}>
    <div style={{ ...serifStyle, fontSize: 32, fontWeight: 700, color: accent||C.gold, lineHeight: 1 }}>{value}</div>
    <div style={{ ...monoStyle, fontSize: 11, color: C.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    {sub && <div style={{ ...monoStyle, fontSize: 11, color: C.textDim, marginTop: 4 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ num, sub, title }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ ...monoStyle, fontSize: 11, color: C.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
      {String(num).padStart(2,"0")} ── {sub}
    </div>
    <h2 style={{ ...serifStyle, fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, color: "#f0ece0", margin: 0, lineHeight: 1.1 }}>{title}</h2>
  </div>
);

const TabBar = ({ options, active, onChange }) => (
  <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
    {options.map(([key, label]) => (
      <button key={key} onClick={() => onChange(key)} style={{
        padding: "8px 18px", ...monoStyle, fontSize: 12, border: "1px solid",
        borderColor: active===key ? C.gold : C.border,
        background:  active===key ? `${C.gold}22` : "transparent",
        color:       active===key ? C.gold : C.textDim,
        cursor: "pointer", letterSpacing: "0.05em",
      }}>{label}</button>
    ))}
  </div>
);

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(60px,8vw,100px)" }}>
    <div style={{ flex: 1, height: 1, background: C.grid }} />
    <div style={{ ...monoStyle, fontSize: 11, color: "#334455" }}>◆</div>
    <div style={{ flex: 1, height: 1, background: C.grid }} />
  </div>
);

const DataNote = ({ children }) => (
  <div style={{ ...monoStyle, fontSize: 11, color: C.textFaint, marginTop: 12 }}>{children}</div>
);

// ============================================================
//  LAYER 7 — SECTION COMPONENTS
// ============================================================

function IncomeSection({ data }) {
  const [view, setView] = useState("gap");
  const tx = C_TEXT.income;

  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={1} sub={tx.sectionTag} title={tx.title} />
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 32, fontSize: 15 }}>
        {tx.body.split(tx.bodyAccentPhrase).map((part, i) =>
          i === 0
            ? <span key={i}>{part}<strong style={{ color: "#d4cfc4" }}>{tx.bodyAccentPhrase}</strong></span>
            : <span key={i}>{part}</span>
        )}
      </p>

      <TabBar options={tx.tabs} active={view} onChange={setView} />

      <div style={{ height: 360 }}>
        {view === "gap" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top:10, right:20, left:10, bottom:5 }}>
              <defs>
                <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.gold} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={C.gold} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="year" tick={xTick} axisLine={{ stroke: C.border }} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={yTick} axisLine={false} tickLine={false}/>
              <Tooltip content={<IncomeTooltip/>}/>
              <Area type="monotone" dataKey="gap" stroke={C.gold} strokeWidth={2} fill="url(#gapGrad)" name={tx.tabs[0][1]}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
        {view === "ratio" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top:10, right:20, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="year" tick={xTick} axisLine={{ stroke: C.border }} tickLine={false}/>
              <YAxis domain={[50,80]} tickFormatter={v => v+"¢"} tick={yTick} axisLine={false} tickLine={false}/>
              <Tooltip content={({ active, payload, label }) => {
                if (!active||!payload?.length) return null;
                return (
                  <div style={{ background: C.surface, border:`1px solid ${C.gold}`, padding:"12px 16px", ...monoStyle, fontSize:13 }}>
                    <div style={{ color: C.gold, fontWeight:700, marginBottom:6 }}>{label}</div>
                    <div style={{ color:"#fff" }}>{tx.ratioTooltipLabel(payload[0].value)}</div>
                  </div>
                );
              }}/>
              <ReferenceLine y={100} stroke="#334455" strokeDasharray="6 3"
                label={{ value: tx.referenceLineLabel, fill:"#334455", ...monoStyle, fontSize:11 }}/>
              <Line type="monotone" dataKey="ratio" stroke={C.gold} strokeWidth={2.5} dot={{ r:4, fill:C.gold, strokeWidth:0 }}/>
            </LineChart>
          </ResponsiveContainer>
        )}
        {view === "both" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top:10, right:20, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
              <XAxis dataKey="year" tick={xTick} axisLine={{ stroke: C.border }} tickLine={false}/>
              <YAxis tickFormatter={fmtK} tick={yTick} axisLine={false} tickLine={false}/>
              <Tooltip content={<IncomeTooltip/>}/>
              <Legend wrapperStyle={{ ...monoStyle, fontSize:12, color:C.textMuted, paddingTop:12 }}/>
              <Line type="monotone" dataKey="white" stroke={C.amber} strokeWidth={2.5} dot={false} name={tx.legendLabels.white}/>
              <Line type="monotone" dataKey="black" stroke={C.rust}  strokeWidth={2.5} dot={false} name={tx.legendLabels.black}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <DataNote>{tx.dataNote}</DataNote>
    </section>
  );
}

function WealthBarSection({ data }) {
  const tx    = C_TEXT.wealthBar;
  const last  = data[data.length-1] || {};
  const first = data[0] || {};
  const m2022 = last.white  && last.black  ? (last.white  / last.black ).toFixed(1) : "—";
  const m1989 = first.white && first.black ? (first.white / first.black).toFixed(1) : "—";

  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={2} sub={tx.sectionTag} title={tx.title}/>
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 32, fontSize: 15 }}
        dangerouslySetInnerHTML={{ __html:
          tx.body(
            `<strong style="color:#d4cfc4">${fmt(last.white)}</strong>`,
            `<strong style="color:${C.rust}">${fmt(last.black)}</strong>`,
            `<strong style="color:${C.rust}">${last.ratio}</strong>`,
            `<strong style="color:#d4cfc4">${m2022}</strong>`,
            `<strong style="color:#d4cfc4">${m1989}</strong>`,
          )
        }}
      />
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top:10, right:20, left:10, bottom:5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
            <XAxis dataKey="year" tick={xTick} axisLine={{ stroke: C.border }} tickLine={false}/>
            <YAxis tickFormatter={fmtK} tick={yTick} axisLine={false} tickLine={false}/>
            <Tooltip content={<WealthTooltip/>}/>
            <Legend wrapperStyle={{ ...monoStyle, fontSize:12, color:C.textMuted, paddingTop:12 }}/>
            <Bar dataKey="white" fill={C.amber} fillOpacity={0.85} radius={[2,2,0,0]} name={tx.legendLabels.white}/>
            <Bar dataKey="black" fill={C.rust}  fillOpacity={0.9}  radius={[2,2,0,0]} name={tx.legendLabels.black}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataNote>{tx.dataNote}</DataNote>
    </section>
  );
}

function WealthRatioSection({ data }) {
  const tx = C_TEXT.wealthRatio;
  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={3} sub={tx.sectionTag} title={tx.title}/>
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 32, fontSize: 15 }}>
        {tx.body}
      </p>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top:10, right:20, left:10, bottom:5 }}>
            <defs>
              <linearGradient id="ratioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.blue} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
            <XAxis dataKey="year" tick={xTick} axisLine={{ stroke: C.border }} tickLine={false}/>
            <YAxis domain={[0,30]} tickFormatter={v => v+"¢"} tick={yTick} axisLine={false} tickLine={false}/>
            <Tooltip content={({ active, payload, label }) => {
              if (!active||!payload?.length) return null;
              return (
                <div style={{ background: C.surface, border:`1px solid ${C.blue}`, padding:"12px 16px", ...monoStyle, fontSize:13 }}>
                  <div style={{ color: C.blue, fontWeight:700, marginBottom:6 }}>{label}</div>
                  <div style={{ color:"#fff" }}>{tx.tooltipLabel(payload[0].value)}</div>
                </div>
              );
            }}/>
            <ReferenceLine y={100} stroke="#334455" strokeDasharray="6 3"/>
            <Area type="monotone" dataKey="ratio" stroke={C.blue} strokeWidth={2.5} fill="url(#ratioGrad)" dot={{ r:5, fill:C.blue, strokeWidth:0 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <DataNote>{tx.dataNote}</DataNote>
    </section>
  );
}

function WhyItPersists() {
  const tx = C_TEXT.whyItPersists;
  return (
    <section style={{ border:`1px solid ${C.gold}33`, borderLeft:`4px solid ${C.gold}`, padding:"clamp(24px,4vw,48px)", background: C.surface, marginBottom:"clamp(60px,8vw,100px)" }}>
      <div style={{ ...monoStyle, fontSize:11, color: C.gold, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>
        {tx.eyebrow}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:24 }}>
        {tx.items.map(({ title, body }) => (
          <div key={title}>
            <div style={{ ...serifStyle, fontSize:17, fontWeight:700, color:"#d4cfc4", marginBottom:8 }}>{title}</div>
            <div style={{ fontSize:14, color: C.textMuted, lineHeight:1.65 }}>{body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PersonalComparison({ wealthData }) {
  const [raw, setRaw]          = useState("");
  const [submitted, setSubmit] = useState(false);
  const [error, setError]      = useState(null);

  const tx     = C_TEXT.personalComparison;
  const latest = wealthData[wealthData.length - 1] || { black: 44900, white: 285000, year: 2022 };

  const validate = (value) => {
    const trimmed = value.trim();
    if (trimmed === "")            return { ok: false, msg: tx.validation.empty };
    if (/[a-zA-Z]/.test(trimmed)) return { ok: false, msg: tx.validation.hasLetters };
    const n = parseFloat(trimmed.replace(/[^0-9.-]/g, ""));
    if (isNaN(n))  return { ok: false, msg: tx.validation.invalid };
    if (n < 0)     return { ok: false, msg: tx.validation.negative };
    if (n > 5e12)  return { ok: false, msg: tx.validation.tooLarge };
    return { ok: true, value: n };
  };

  const parsed  = validate(raw);
  const userVal = parsed.ok ? parsed.value : 0;

  const pctOfWhite = latest.white ? +((userVal / latest.white) * 100).toFixed(1) : 0;
  const pctOfBlack = latest.black ? +((userVal / latest.black) * 100).toFixed(1) : 0;
  const aboveWhite = userVal >= latest.white;
  const aboveBlack = userVal >= latest.black;

  const ceiling   = Math.max(userVal, latest.white) * 1.15;
  const chartData = [
    { label: tx.chartLabels.you,         value: userVal,      fill: "#a0c4ff" },
    { label: tx.chartLabels.medianBlack, value: latest.black, fill: C.rust   },
    { label: tx.chartLabels.medianWhite, value: latest.white, fill: C.amber  },
  ];

  const handleInput = (e) => { setRaw(e.target.value); setSubmit(false); setError(null); };
  const handleSubmit = () => {
    const result = validate(raw);
    if (!result.ok) { setError(result.msg); setSubmit(false); }
    else            { setError(null);        setSubmit(true);  }
  };

  const getMessage = () => {
    if (userVal === 0) return null;
    if (aboveWhite) return { color: C.amber,    text: tx.contextMessages.aboveWhite(fmt(latest.white)) };
    if (aboveBlack) return { color: "#a0c4ff",  text: tx.contextMessages.aboveBlack(fmt(latest.black), fmt(latest.white), fmt(latest.white - latest.black)) };
    return           { color: C.rust,           text: tx.contextMessages.belowBoth(fmt(latest.black), fmt(latest.white), fmt(latest.white - latest.black)) };
  };

  const msg = submitted ? getMessage() : null;

  const CustomBarLabel = ({ x, y, width, value, fill }) => {
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 8} textAnchor="middle" fill={fill}
        style={{ ...monoStyle, fontSize: 12, fontWeight: 600 }}>
        {fmtK(value)}
      </text>
    );
  };

  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={4} sub={tx.sectionTag} title={tx.title} />
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 36, fontSize: 15 }}>
        {tx.body(latest.year)}
      </p>

      {/* Input */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 380 }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", ...monoStyle, fontSize:15, color:C.textDim, pointerEvents:"none" }}>$</span>
            <input
              type="text"
              placeholder={tx.inputPlaceholder}
              value={raw.replace(/^\$/, "")}
              onChange={handleInput}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width:"100%", padding:"14px 14px 14px 28px",
                background: C.surface2,
                border: `1px solid ${error ? C.rust : submitted ? C.gold : C.border}`,
                color:"#f0ece0", ...monoStyle, fontSize:18,
                outline:"none", transition:"border-color 0.2s",
              }}
            />
          </div>
          <button onClick={handleSubmit} style={{
            padding:"14px 28px", background:C.gold, color:"#0b0d14", border:"none",
            ...monoStyle, fontSize:13, fontWeight:600, letterSpacing:"0.08em",
            textTransform:"uppercase", cursor:"pointer",
          }}>
            {tx.compareButton}
          </button>
        </div>
        {error && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginTop:10, padding:"10px 14px",
            background:`${C.rust}11`, border:`1px solid ${C.rust}44`, borderLeft:`3px solid ${C.rust}` }}>
            <span style={{ color:C.rust, fontSize:14, lineHeight:1, marginTop:1 }}>⚠</span>
            <span style={{ ...monoStyle, fontSize:12, color:C.rust, lineHeight:1.5 }}>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {submitted && userVal >= 0 && (
        <>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:36 }}>
            <div style={{ border:`1px solid #a0c4ff33`, borderLeft:`3px solid #a0c4ff`, padding:"16px 22px", background:C.surface2, flex:1, minWidth:160 }}>
              <div style={{ ...serifStyle, fontSize:28, fontWeight:700, color:"#a0c4ff", lineHeight:1 }}>
                {pctOfBlack > 999 ? (pctOfBlack / 100).toFixed(1) + "×" : pctOfBlack + "%"}
              </div>
              <div style={{ ...monoStyle, fontSize:11, color:C.textMuted, marginTop:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {tx.statLabels.black(pctOfBlack > 100)}
              </div>
            </div>
            <div style={{ border:`1px solid ${C.gold}33`, borderLeft:`3px solid ${C.gold}`, padding:"16px 22px", background:C.surface2, flex:1, minWidth:160 }}>
              <div style={{ ...serifStyle, fontSize:28, fontWeight:700, color:C.gold, lineHeight:1 }}>
                {pctOfWhite > 999 ? (pctOfWhite / 100).toFixed(1) + "×" : pctOfWhite + "%"}
              </div>
              <div style={{ ...monoStyle, fontSize:11, color:C.textMuted, marginTop:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {tx.statLabels.white(pctOfWhite > 100)}
              </div>
            </div>
            <div style={{ border:`1px solid ${C.rust}33`, borderLeft:`3px solid ${C.rust}`, padding:"16px 22px", background:C.surface2, flex:1, minWidth:160 }}>
              <div style={{ ...serifStyle, fontSize:28, fontWeight:700, color:C.rust, lineHeight:1 }}>
                {fmt(latest.white - latest.black)}
              </div>
              <div style={{ ...monoStyle, fontSize:11, color:C.textMuted, marginTop:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {tx.statLabels.gapLabel(latest.year)}
              </div>
            </div>
          </div>

          <div style={{ height:300, marginBottom:24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top:30, right:20, left:10, bottom:5 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
                <XAxis dataKey="label" tick={{ ...monoStyle, fontSize:12, fill:C.textDim }} axisLine={{ stroke:C.border }} tickLine={false}/>
                <YAxis tickFormatter={fmtK} tick={yTick} axisLine={false} tickLine={false} domain={[0, ceiling]}/>
                <Tooltip content={({ active, payload, label }) => {
                  if (!active||!payload?.length) return null;
                  return (
                    <div style={{ background:C.surface, border:`1px solid ${payload[0]?.payload?.fill}`, padding:"12px 16px", ...monoStyle, fontSize:13 }}>
                      <div style={{ color:payload[0]?.payload?.fill, fontWeight:700, marginBottom:4 }}>{label}</div>
                      <div style={{ color:"#fff" }}>{fmt(payload[0].value)}</div>
                    </div>
                  );
                }}/>
                <Bar dataKey="value" radius={[3,3,0,0]} label={<CustomBarLabel/>} isAnimationActive={true}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {msg && (
            <div style={{ border:`1px solid ${msg.color}33`, borderLeft:`3px solid ${msg.color}`, padding:"18px 24px", background:C.surface, fontSize:14, color:C.textMuted, lineHeight:1.7 }}>
              {msg.text}
            </div>
          )}

          <DataNote>{tx.dataNote(latest.year, fmt(latest.black), fmt(latest.white))}</DataNote>
        </>
      )}
    </section>
  );
}

function AboutContact() {
  const ab = C_TEXT.about;
  const co = C_TEXT.contact;
  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:24 }}>

        {/* About */}
        <div style={{ border:`1px solid ${C.gold}33`, borderLeft:`3px solid ${C.gold}`, padding:"clamp(24px,4vw,40px)", background:C.surface }}>
          <div style={{ ...monoStyle, fontSize:11, color:C.gold, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>{ab.eyebrow}</div>
          <div style={{ ...serifStyle, fontSize:22, fontWeight:700, color:"#f0ece0", marginBottom:4 }}>{ab.name}</div>
          <div style={{ ...monoStyle, fontSize:11, color:C.textDim, marginBottom:20, letterSpacing:"0.05em" }}>{ab.tagline}</div>
          <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.75 }}>{ab.body1}</p>
          <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.75, marginTop:14 }}>{ab.body2}</p>
        </div>

        {/* Contact */}
        <div style={{ border:`1px solid ${C.blue}33`, borderLeft:`3px solid ${C.blue}`, padding:"clamp(24px,4vw,40px)", background:C.surface }}>
          <div style={{ ...monoStyle, fontSize:11, color:C.blue, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>{co.eyebrow}</div>
          <div style={{ ...serifStyle, fontSize:22, fontWeight:700, color:"#f0ece0", marginBottom:20 }}>{co.title}</div>
          <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.75, marginBottom:28 }}>{co.body}</p>
          <a
            href={`mailto:${co.email}`}
            style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"12px 22px",
              background:`${C.blue}18`, border:`1px solid ${C.blue}55`, color:C.blue,
              ...monoStyle, fontSize:13, textDecoration:"none", letterSpacing:"0.04em", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background=`${C.blue}30`; e.currentTarget.style.borderColor=C.blue; }}
            onMouseLeave={e => { e.currentTarget.style.background=`${C.blue}18`; e.currentTarget.style.borderColor=`${C.blue}55`; }}
          >
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="14" height="11" rx="1.5" stroke={C.blue}/>
              <path d="M1 1L7.5 7L14 1" stroke={C.blue} strokeLinecap="round"/>
            </svg>
            {co.emailLabel}
          </a>
        </div>

      </div>
    </section>
  );
}

// ============================================================
//  LAYER 8 — ROOT APP
// ============================================================

export default function App() {
  const { incomeData, wealthData, loading, error } = useInequalityData();

  const lastIncome  = incomeData[incomeData.length-1] || {};
  const lastWealth  = wealthData[wealthData.length-1] || {};
  const firstWealth = wealthData[0] || {};

  const wm2022 = lastWealth.white  && lastWealth.black  ? (lastWealth.white  / lastWealth.black ).toFixed(1) : "—";
  const wm1989 = firstWealth.white && firstWealth.black ? (firstWealth.white / firstWealth.black).toFixed(1) : "—";

  const hero = C_TEXT.hero;
  const sc   = C_TEXT.statCards;
  const ft   = C_TEXT.footer;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:"#d4cfc4", fontFamily:"'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0b0d14;}
        ::-webkit-scrollbar{width:6px;background:#0b0d14;}
        ::-webkit-scrollbar-thumb{background:#c9a84c44;border-radius:3px;}
        button{transition:all 0.2s;}
        button:hover{opacity:0.85;}
      `}</style>

      {/* HERO */}
      <div style={{ padding:"clamp(40px,8vw,100px) clamp(24px,8vw,100px) clamp(40px,6vw,72px)", borderBottom:`1px solid ${C.grid}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0, background:"radial-gradient(ellipse 80% 60% at 70% 50%, #1a1206 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", maxWidth:900 }}>
          <div style={{ ...monoStyle, fontSize:11, color:C.gold, letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:20 }}>
            {hero.eyebrow}
          </div>
          <h1 style={{ ...serifStyle, fontSize:"clamp(36px,7vw,80px)", fontWeight:900, color:"#f5f0e6", lineHeight:1.0, marginBottom:24, letterSpacing:"-0.02em" }}>
            {hero.headline}<br /><span style={{ color:C.gold }}>{hero.headlineAccent}</span>
          </h1>
          <p style={{ fontSize:"clamp(15px,2vw,19px)", color:C.textMuted, lineHeight:1.65, maxWidth:640, marginBottom:36 }}>
            {hero.subheading}
          </p>
          {!loading && !error && (
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <StatCard
                label={sc.incomeRatio.label}
                value={`${lastIncome.ratio}¢`}
                sub={sc.incomeRatio.sub}
              />
              <StatCard
                label={sc.wealthGap.cardLabel}
                value={`${wm2022}×`}
                sub={sc.wealthGap.label(wm2022)}
                accent={C.rust}
              />
              <StatCard
                label={sc.wealthChange.label}
                value={`${wm1989}× → ${wm2022}×`}
                sub={sc.wealthChange.sub}
                accent={C.blue}
              />
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding:"clamp(40px,6vw,80px) clamp(24px,8vw,100px)", maxWidth:1100, margin:"0 auto" }}>
        {loading && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", ...monoStyle, fontSize:13, color:C.textMuted }}>
            {C_TEXT.loading}
          </div>
        )}
        {error && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", ...monoStyle, fontSize:13, color:C.rust }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <IncomeSection      data={incomeData}/>
            <Divider/>
            <WealthBarSection   data={wealthData}/>
            <Divider/>
            <WealthRatioSection data={wealthData}/>
            <Divider/>
            <PersonalComparison wealthData={wealthData}/>
            <WhyItPersists/>
            <Divider/>
            <AboutContact/>
          </>
        )}

        <footer style={{ borderTop:`1px solid ${C.grid}`, paddingTop:28, ...monoStyle, fontSize:11, color:C.textFaint, lineHeight:1.8 }}>
          <div style={{ color:C.textDim, marginBottom:4 }}>{ft.sourcesLabel}</div>
          {ft.sources.map((s, i) => <div key={i}>{s}</div>)}
          <div style={{ marginTop:12, color:C.textGhost }}>{ft.citation}</div>
        </footer>
      </div>
      <Analytics />
    </div>
  );
}