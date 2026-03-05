import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart
} from "recharts";
import { Analytics } from "@vercel/analytics/next"

// ============================================================
//  LAYER 1 — STATIC DATA STORE
//  These are the raw values used when live APIs are not wired in.
//  To update a dataset, edit only this section.
// ============================================================

const STATIC_DATA = {
  // Source: U.S. Census Bureau, Historical Income Table H-5 (2022 CPI-U-RS adjusted)
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
  // Source: Federal Reserve Survey of Consumer Finances (2022 dollars)
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
//  Each function is the single place to change when switching
//  a dataset from static to a live API.
//
//  Every function returns: Promise<{ year, black, white }[]>
//
//  To go live, replace the function body with a fetch() call.
//  The rest of the app is completely untouched.
//
//  Example swap-in for income data via FRED API:
//
//    async function fetchIncomeData() {
//      const FRED_KEY = "YOUR_API_KEY";
//      const [bRes, wRes] = await Promise.all([
//        fetch(`https://api.stlouisfed.org/fred/series/observations
//               ?series_id=MEHOINUSBIA672N&api_key=${FRED_KEY}&file_type=json`),
//        fetch(`https://api.stlouisfed.org/fred/series/observations
//               ?series_id=MEHOINUSWHA672N&api_key=${FRED_KEY}&file_type=json`),
//      ]);
//      const [bJson, wJson] = await Promise.all([bRes.json(), wRes.json()]);
//      // merge by year into { year, black, white } rows and return
//    }
// ============================================================

async function fetchIncomeData() {
  // ← replace this body with a fetch() call to go live
  return STATIC_DATA.income;
}

async function fetchWealthData() {
  // ← replace this body with a fetch() call to go live
  // Note: SCF is published every 3 years with no public REST API.
  // Update STATIC_DATA.wealth after each new SCF release (~2025).
  return STATIC_DATA.wealth;
}

// ============================================================
//  LAYER 3 — DATA NORMALISATION
//  Computes derived fields (gap, ratio) from whatever shape the
//  data source returns. Centralised here so API responses and
//  static data both flow through the same transform.
// ============================================================

const normalise = (d) => ({
  ...d,
  gap:   d.white - d.black,
  ratio: +(d.black / d.white * 100).toFixed(1),
});

// ============================================================
//  LAYER 4 — DATA HOOK
//  Manages loading / error state for all datasets.
//  Components consume this; they never touch the service layer.
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
const monoStyle = { fontFamily: "'DM Mono', monospace" };
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
      <div style={{ color: C.amber, marginBottom: 3 }}>White households: <strong>{fmt(d?.white)}</strong></div>
      <div style={{ color: C.rust,  marginBottom: 3 }}>Black households: <strong>{fmt(d?.black)}</strong></div>
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
      <div style={{ color: C.amber, marginBottom: 3 }}>White families: <strong>{fmt(d?.white)}</strong></div>
      <div style={{ color: C.rust,  marginBottom: 3 }}>Black families: <strong>{fmt(d?.black)}</strong></div>
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
//  Each receives only the data slice it needs as props.
//  Adding a new dataset = new fetch fn + new section component.
// ============================================================

function IncomeSection({ data }) {
  const [view, setView] = useState("gap");
  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={1} sub="U.S. Census Bureau, Table H-5" title="Median Household Income Has Stalled for Decades" />
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 32, fontSize: 15 }}>
        Adjusted for inflation, the income gap between Black and white households has remained stubbornly wide since 1967.
        Despite periods of progress, Black households earn roughly <strong style={{ color: "#d4cfc4" }}>65 cents</strong> for
        every dollar earned by white households — nearly unchanged from 55 years ago.
      </p>
      <TabBar options={[["gap","Dollar Gap"],["ratio","Earnings Ratio"],["both","Both Lines"]]} active={view} onChange={setView} />
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
              <Area type="monotone" dataKey="gap" stroke={C.gold} strokeWidth={2} fill="url(#gapGrad)" name="Income Gap"/>
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
                    <div style={{ color:"#fff" }}>Black earns <strong>{payload[0].value}¢</strong> per white $1</div>
                  </div>
                );
              }}/>
              <ReferenceLine y={100} stroke="#334455" strokeDasharray="6 3" label={{ value:"Equal pay", fill:"#334455", ...monoStyle, fontSize:11 }}/>
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
              <Line type="monotone" dataKey="white" stroke={C.amber} strokeWidth={2.5} dot={false} name="White households"/>
              <Line type="monotone" dataKey="black" stroke={C.rust}  strokeWidth={2.5} dot={false} name="Black households"/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <DataNote>Source: U.S. Census Bureau, Historical Income Tables: Households, Table H-5 — Adjusted to 2022 dollars (CPI-U-RS)</DataNote>
    </section>
  );
}

function WealthBarSection({ data }) {
  const last  = data[data.length-1] || {};
  const first = data[0] || {};
  const m2022 = last.white  && last.black  ? (last.white  / last.black ).toFixed(1) : "—";
  const m1989 = first.white && first.black ? (first.white / first.black).toFixed(1) : "—";

  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={2} sub="Federal Reserve Survey of Consumer Finances" title="The Wealth Gap Is Even Starker — and Growing"/>
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 32, fontSize: 15 }}>
        Wealth — not income — determines financial security across generations. In 2022, the median white family held{" "}
        <strong style={{ color:"#d4cfc4" }}>{fmt(last.white)}</strong> in wealth. The median Black family held{" "}
        <strong style={{ color: C.rust }}>{fmt(last.black)}</strong> — just{" "}
        <strong style={{ color: C.rust }}>{last.ratio}¢</strong> per white dollar.
        The white-to-Black multiplier in 2022 is <strong style={{ color:"#d4cfc4" }}>{m2022}×</strong>,
        barely improved from <strong style={{ color:"#d4cfc4" }}>{m1989}×</strong> in 1989.
      </p>
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top:10, right:20, left:10, bottom:5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
            <XAxis dataKey="year" tick={xTick} axisLine={{ stroke: C.border }} tickLine={false}/>
            <YAxis tickFormatter={fmtK} tick={yTick} axisLine={false} tickLine={false}/>
            <Tooltip content={<WealthTooltip/>}/>
            <Legend wrapperStyle={{ ...monoStyle, fontSize:12, color:C.textMuted, paddingTop:12 }}/>
            <Bar dataKey="white" fill={C.amber} fillOpacity={0.85} radius={[2,2,0,0]} name="White families"/>
            <Bar dataKey="black" fill={C.rust}  fillOpacity={0.9}  radius={[2,2,0,0]} name="Black families"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataNote>Source: Federal Reserve Board, Survey of Consumer Finances (SCF) — Median family net worth, 2022 dollars</DataNote>
    </section>
  );
}

function WealthRatioSection({ data }) {
  return (
    <section style={{ marginBottom: "clamp(60px,8vw,100px)" }}>
      <SectionHeader num={3} sub="Derived from Federal Reserve SCF" title="The Ratio Has Barely Moved"/>
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 32, fontSize: 15 }}>
        Even as absolute wealth has grown for both groups, Black families' share of white wealth has changed little.
        The 2008 financial crisis — which hit Black homeowners hardest — erased gains made in the early 2000s.
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
                  <div style={{ color:"#fff" }}>Black wealth = <strong>{payload[0].value}¢</strong> per white $1</div>
                </div>
              );
            }}/>
            <ReferenceLine y={100} stroke="#334455" strokeDasharray="6 3"/>
            <Area type="monotone" dataKey="ratio" stroke={C.blue} strokeWidth={2.5} fill="url(#ratioGrad)" dot={{ r:5, fill:C.blue, strokeWidth:0 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <DataNote>Black wealth as cents per dollar of white wealth — 100¢ would represent full equality</DataNote>
    </section>
  );
}

function WhyItPersists() {
  const items = [
    ["Historical exclusion",     "Redlining, GI Bill exclusions, and wealth-stripping policies in the 20th century blocked Black families from building intergenerational wealth."],
    ["Compounding disadvantage", "Wealth grows on itself. Families with more assets accumulate more through investment returns, inheritance, and home equity."],
    ["Income ceiling",           "Even with better income today, earning less for decades means less saved, invested, and passed down — the gap compounds over generations."],
  ];
  return (
    <section style={{ border:`1px solid ${C.gold}33`, borderLeft:`4px solid ${C.gold}`, padding:"clamp(24px,4vw,48px)", background: C.surface, marginBottom:"clamp(60px,8vw,100px)" }}>
      <div style={{ ...monoStyle, fontSize:11, color: C.gold, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>Why the gap persists</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:24 }}>
        {items.map(([title, body]) => (
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
  const [raw, setRaw]         = useState("");
  const [submitted, setSubmit] = useState(false);
  const [error, setError]     = useState(null);

  const latest = wealthData[wealthData.length - 1] || { black: 44900, white: 285000, year: 2022 };

  // Parse and validate the raw input
  const validate = (value) => {
    const trimmed = value.trim();
    if (trimmed === "") return { ok: false, msg: "Please enter a net worth value." };
    if (/[a-zA-Z]/.test(trimmed)) return { ok: false, msg: "Net worth must be a number — no letters allowed." };
    const n = parseFloat(trimmed.replace(/[^0-9.-]/g, ""));
    if (isNaN(n)) return { ok: false, msg: "That doesn't look like a valid number. Try something like 50000 or $50,000." };
    if (n < 0) return { ok: false, msg: "Negative net worth is valid in real life, but this calculator only supports values of $0 or more." };
    if (n > 5_000_000_000_000) return { ok: false, msg: "Please enter a value under $5 trillion." };
    return { ok: true, value: n };
  };

  const parsed   = validate(raw);
  const userVal  = parsed.ok ? parsed.value : 0;

  const pctOfWhite = latest.white ? +((userVal / latest.white) * 100).toFixed(1) : 0;
  const pctOfBlack = latest.black ? +((userVal / latest.black) * 100).toFixed(1) : 0;
  const aboveWhite = userVal >= latest.white;
  const aboveBlack = userVal >= latest.black;

  // bar chart data — cap display at a reasonable ceiling for readability
  const ceiling   = Math.max(userVal, latest.white) * 1.15;
  const chartData = [
    { label: "You",          value: userVal,       fill: "#a0c4ff" },
    { label: "Median Black", value: latest.black,  fill: C.rust   },
    { label: "Median White", value: latest.white,  fill: C.amber  },
  ];

  const handleInput = (e) => {
    setRaw(e.target.value);
    setSubmit(false);
    setError(null);
  };

  const handleSubmit = () => {
    const result = validate(raw);
    if (!result.ok) {
      setError(result.msg);
      setSubmit(false);
    } else {
      setError(null);
      setSubmit(true);
    }
  };

  // contextual message
  const getMessage = () => {
    if (userVal === 0) return null;
    if (aboveWhite)
      return { color: C.amber, text: `Your net worth exceeds the median white family's wealth of ${fmt(latest.white)}. You are in a position of significant financial advantage relative to both medians.` };
    if (aboveBlack)
      return { color: "#a0c4ff", text: `Your net worth is above the median Black family (${fmt(latest.black)}) but below the median white family (${fmt(latest.white)}). The gap between those two medians is ${fmt(latest.white - latest.black)}.` };
    return { color: C.rust, text: `Your net worth is below both medians. The median Black family holds ${fmt(latest.black)} and the median white family holds ${fmt(latest.white)} — a gap of ${fmt(latest.white - latest.black)}.` };
  };

  const msg = submitted ? getMessage() : null;

  // Custom bar label
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
      <SectionHeader num={4} sub="Personal Calculator" title="Where Do You Stand?" />
      <p style={{ color: C.textMuted, lineHeight: 1.7, maxWidth: 680, marginBottom: 36, fontSize: 15 }}>
        Enter your estimated net worth — assets minus debts — to see how you compare to the
        median Black and white family in {latest.year}.
      </p>

      {/* Input row */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 380 }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              ...monoStyle, fontSize: 15, color: C.textDim, pointerEvents: "none",
            }}>$</span>
            <input
              type="text"
              placeholder="0"
              value={raw.replace(/^\$/, "")}
              onChange={handleInput}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%",
                padding: "14px 14px 14px 28px",
                background: C.surface2,
                border: `1px solid ${error ? C.rust : submitted ? C.gold : C.border}`,
                color: "#f0ece0",
                ...monoStyle, fontSize: 18,
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{
              padding: "14px 28px",
              background: C.gold,
              color: "#0b0d14",
              border: "none",
              ...monoStyle, fontSize: 13, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Compare
          </button>
        </div>
        {error && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            marginTop: 10, padding: "10px 14px",
            background: `${C.rust}11`,
            border: `1px solid ${C.rust}44`,
            borderLeft: `3px solid ${C.rust}`,
          }}>
            <span style={{ color: C.rust, fontSize: 14, lineHeight: 1, marginTop: 1 }}>⚠</span>
            <span style={{ ...monoStyle, fontSize: 12, color: C.rust, lineHeight: 1.5 }}>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {submitted && userVal >= 0 && (
        <>
          {/* Stat pills */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
            <div style={{ border: `1px solid #a0c4ff33`, borderLeft: `3px solid #a0c4ff`, padding: "16px 22px", background: C.surface2, flex: 1, minWidth: 160 }}>
              <div style={{ ...serifStyle, fontSize: 28, fontWeight: 700, color: "#a0c4ff", lineHeight: 1 }}>
                {pctOfBlack > 999 ? (pctOfBlack / 100).toFixed(1) + "×" : pctOfBlack + "%"}
              </div>
              <div style={{ ...monoStyle, fontSize: 11, color: C.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {pctOfBlack > 100 ? "above" : "of"} median Black wealth
              </div>
            </div>
            <div style={{ border: `1px solid ${C.gold}33`, borderLeft: `3px solid ${C.gold}`, padding: "16px 22px", background: C.surface2, flex: 1, minWidth: 160 }}>
              <div style={{ ...serifStyle, fontSize: 28, fontWeight: 700, color: C.gold, lineHeight: 1 }}>
                {pctOfWhite > 999 ? (pctOfWhite / 100).toFixed(1) + "×" : pctOfWhite + "%"}
              </div>
              <div style={{ ...monoStyle, fontSize: 11, color: C.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {pctOfWhite > 100 ? "above" : "of"} median white wealth
              </div>
            </div>
            <div style={{ border: `1px solid ${C.rust}33`, borderLeft: `3px solid ${C.rust}`, padding: "16px 22px", background: C.surface2, flex: 1, minWidth: 160 }}>
              <div style={{ ...serifStyle, fontSize: 28, fontWeight: 700, color: C.rust, lineHeight: 1 }}>
                {fmt(latest.white - latest.black)}
              </div>
              <div style={{ ...monoStyle, fontSize: 11, color: C.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>racial wealth gap ({latest.year})</div>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ height: 300, marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 20, left: 10, bottom: 5 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ ...monoStyle, fontSize: 12, fill: C.textDim }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tickFormatter={fmtK} tick={yTick} axisLine={false} tickLine={false} domain={[0, ceiling]} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: C.surface, border: `1px solid ${payload[0]?.payload?.fill}`, padding: "12px 16px", ...monoStyle, fontSize: 13 }}>
                      <div style={{ color: payload[0]?.payload?.fill, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                      <div style={{ color: "#fff" }}>{fmt(payload[0].value)}</div>
                    </div>
                  );
                }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]} label={<CustomBarLabel />} isAnimationActive={true}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Contextual message */}
          {msg && (
            <div style={{ border: `1px solid ${msg.color}33`, borderLeft: `3px solid ${msg.color}`, padding: "18px 24px", background: C.surface, fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>
              {msg.text}
            </div>
          )}

          <DataNote style={{ marginTop: 16 }}>
            Comparison uses {latest.year} SCF median net worth — Black families: {fmt(latest.black)} · White families: {fmt(latest.white)}
          </DataNote>
        </>
      )}
    </section>
  );
}

// ============================================================
//  LAYER 8 — ROOT APP
//  Wires the data hook to the page layout.
//  To add a new dataset: add a fetch fn, add it to useInequalityData,
//  create a section component, drop it here between the dividers.
// ============================================================

export default function App() {
  const { incomeData, wealthData, loading, error } = useInequalityData();

  const lastIncome  = incomeData[incomeData.length-1] || {};
  const lastWealth  = wealthData[wealthData.length-1] || {};
  const firstWealth = wealthData[0] || {};

  const wm2022 = lastWealth.white  && lastWealth.black  ? (lastWealth.white  / lastWealth.black ).toFixed(1) : "—";
  const wm1989 = firstWealth.white && firstWealth.black ? (firstWealth.white / firstWealth.black).toFixed(1) : "—";

  return (
    <div style={{ minHeight:"100vh", background: C.bg, color:"#d4cfc4", fontFamily:"'Georgia', serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
          <div style={{ ...monoStyle, fontSize:11, color: C.gold, letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:20 }}>
            Data Investigation · U.S. Economic Inequality
          </div>
          <h1 style={{ ...serifStyle, fontSize:"clamp(36px,7vw,80px)", fontWeight:900, color:"#f5f0e6", lineHeight:1.0, marginBottom:24, letterSpacing:"-0.02em" }}>
            The Persistent<br /><span style={{ color: C.gold }}>Gap</span>
          </h1>
          <p style={{ fontSize:"clamp(15px,2vw,19px)", color: C.textMuted, lineHeight:1.65, maxWidth:640, marginBottom:36 }}>
            Six decades after the Civil Rights Act, Black Americans earn significantly less and hold a fraction
            of the wealth of white Americans. This is what the data shows.
          </p>
          {!loading && !error && (
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <StatCard label="Black-to-white income ratio (2022)" value={`${lastIncome.ratio}¢`}       sub="per $1 earned by white households"/>
              <StatCard label="Median wealth gap (2022)"           value={`${wm2022}×`}                 sub={`White families hold ${wm2022}× more wealth`}     accent={C.rust}/>
              <StatCard label="Wealth ratio change since 1989"     value={`${wm1989}× → ${wm2022}×`}   sub="The gap has barely moved in 33 years"              accent={C.blue}/>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding:"clamp(40px,6vw,80px) clamp(24px,8vw,100px)", maxWidth:1100, margin:"0 auto" }}>
        {loading && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", ...monoStyle, fontSize:13, color: C.textMuted }}>
            Loading data…
          </div>
        )}
        {error && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", ...monoStyle, fontSize:13, color: C.rust }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <IncomeSection         data={incomeData}/>
            <Divider/>
            <WealthBarSection      data={wealthData}/>
            <Divider/>
            <WealthRatioSection    data={wealthData}/>
            <Divider/>
            <PersonalComparison    wealthData={wealthData}/>
            <WhyItPersists/>
          </>
        )}

        <footer style={{ borderTop:`1px solid ${C.grid}`, paddingTop:28, ...monoStyle, fontSize:11, color: C.textFaint, lineHeight:1.8 }}>
          <div style={{ color: C.textDim, marginBottom:4 }}>Data Sources</div>
          <div>U.S. Census Bureau — Historical Income Tables (Table H-5), 1967–2022, CPI-U-RS adjusted</div>
          <div>Federal Reserve Board — Survey of Consumer Finances (SCF), 1989–2022, median family net worth</div>
          <div style={{ marginTop:12, color: C.textGhost }}>Derenoncourt et al. (2022), "Wealth of Two Nations: The U.S. Racial Wealth Gap, 1860–2020"</div>
        </footer>
      </div>
    </div>
  );
}
