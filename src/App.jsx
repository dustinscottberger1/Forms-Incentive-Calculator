import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from "recharts";
import { BASELINE, EMPLOYEES } from "./data.js";

const SC = {
  darkTeal: "#094550",
  slateTeal: "#005666",
  tidalBlue: "#0087A0",
  aquaGreen: "#00BFA5",
  paleBlue: "#B4D9E0",
  mist: "#E2F2F0",
  mountainFog: "#F3F8F9",
  white: "#FFFFFF",
  pewter: "#64747A",
  charcoal: "#1B1F1F",
  logoText: "#343333",
  bg: "#0a1214",
  card: "#0d1b1f",
  cardBorder: "#133038",
  cardHover: "#112428",
  textPrimary: "#E2F2F0",
  textSecondary: "#8ba8ae",
  gridLine: "#1a3038",
};

function normalPDF(x, mean, std) {
  if (std === 0) return x === mean ? 1 : 0;
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}
function normalCDF(x, mean, std) {
  if (std === 0) return x >= mean ? 1 : 0;
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const p = 0.3989422804 * Math.exp(-z * z / 2) * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

function Logo() {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="16" r="11" fill="none" stroke={SC.aquaGreen} strokeWidth="2.2"/>
      <path d="M12 13 C12 11, 16 11, 16 13 C16 15, 12 18, 12 20 C12 18, 16 15, 16 13 Z" fill={SC.aquaGreen} transform="translate(1,0) scale(0.9)"/>
      <line x1="21" y1="23" x2="26" y2="28" stroke={SC.aquaGreen} strokeWidth="2.2" strokeLinecap="round"/>
      <text x="32" y="22" fill={SC.paleBlue} fontFamily="system-ui, sans-serif" fontWeight="400" fontSize="19" letterSpacing="0.3">share<tspan fill={SC.aquaGreen}>care</tspan></text>
    </svg>
  );
}

export default function App() {
  const baseline = BASELINE;
  const empSummaries = EMPLOYEES;

  const [sOmap, setSOmap] = useState(4.88);
  const [sRecords, setSRecords] = useState(BASELINE.adjustedRecords);
  const [sUtil, setSUtil] = useState(80);
  const [sWage, setSWage] = useState(18);
  const [sQualOmap, setSQualOmap] = useState(4.88);

  const calc = useMemo(() => {
    if (!baseline || empSummaries.length === 0) return null;
    const n = empSummaries.length;
    const blProdHrs = baseline.omap > 0 ? baseline.adjustedRecords / baseline.omap : baseline.productiveHours;
    const blTotalHrs = baseline.utilization > 0 ? blProdHrs / (baseline.utilization / 100) : baseline.totalHours;
    const tProdHrs = sOmap > 0 ? sRecords / sOmap : blProdHrs;
    const tTotalHrs = sUtil > 0 ? tProdHrs / (sUtil / 100) : tProdHrs;
    const qtrHrsSaved = (blTotalHrs - tTotalHrs) * 3;
    const qtrDollarsSaved = qtrHrsSaved * sWage;
    const pool = Math.max(0, qtrDollarsSaved);
    const omaps = empSummaries.map(e => e.blOmap).filter(v => v > 0);
    const mean = omaps.reduce((a, b) => a + b, 0) / omaps.length;
    const std = Math.sqrt(omaps.reduce((s, v) => s + (v - mean) ** 2, 0) / omaps.length) || 0.01;
    const probAbove = 1 - normalCDF(sQualOmap, mean, std);
    const estQual = Math.max(0, Math.round(probAbove * n));
    const actualQual = empSummaries.filter(e => e.hasRecent && e.recentOmap >= sQualOmap && e.recentUtil >= 80).length;
    const perEmp = actualQual > 0 ? pool / actualQual : 0;
    const lo = Math.max(0, mean - 3.5 * std), hi = mean + 3.5 * std;
    const step = (hi - lo) / 80;
    const distData = [];
    for (let x = lo; x <= hi; x += step) {
      distData.push({ omap: Math.round(x * 100) / 100, density: normalPDF(x, mean, std), qual: x >= sQualOmap ? normalPDF(x, mean, std) : 0 });
    }
    const empPerf = empSummaries.map(e => ({
      name: e.name, recentOmap: Math.round(e.recentOmap * 100) / 100, recentUtil: Math.round(e.recentUtil * 100) / 100,
      meetsOmap: e.recentOmap >= sQualOmap, meetsUtil: e.recentUtil >= 80,
      qualifies: e.hasRecent && e.recentOmap >= sQualOmap && e.recentUtil >= 80, hasRecent: e.hasRecent
    })).sort((a, b) => b.recentOmap - a.recentOmap);
    return { blTotalHrs, tTotalHrs, qtrHrsSaved, qtrDollarsSaved, pool, estQual, actualQual, perEmp, n, mean, std, distData, empPerf };
  }, [baseline, empSummaries, sOmap, sRecords, sUtil, sWage, sQualOmap]);

  const fmt = n => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  const fmtD = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const fmtP = n => isNaN(n) ? "—" : n.toFixed(1) + "%";
  const fmtO = n => isNaN(n) || n === 0 ? "—" : n.toFixed(2);

  const ttStyle = { background: SC.card, border: `1px solid ${SC.cardBorder}`, borderRadius: 8, color: SC.textPrimary };
  const ttItemStyle = { color: SC.mist };
  const ttLabelStyle = { color: SC.paleBlue };

  return (
    <div style={{ minHeight:"100vh", background:SC.bg, color:SC.textPrimary, padding:"20px 24px", fontFamily:"system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>

        <div style={{ borderBottom:`2px solid ${SC.cardBorder}`, paddingBottom:16, marginBottom:20 }}>
          <Logo />
          <h1 style={{ fontSize:22, fontWeight:300, color:SC.paleBlue, marginTop:10, fontFamily:"Georgia, 'Roboto Serif', serif", letterSpacing:0.3 }}>Disability Forms — Employee Incentive Calculator</h1>
          <p style={{ color:SC.textSecondary, fontSize:13, marginTop:4 }}>Self-funded quarterly incentive model — productivity (oMAP) &amp; utilization improvements fund employee payouts</p>
        </div>

        {baseline && calc && (
          <>
            <div style={{ background:`linear-gradient(135deg, ${SC.slateTeal}, ${SC.darkTeal})`, borderRadius:12, padding:"18px 22px", marginBottom:20 }}>
              <h3 style={{ fontSize:11, fontWeight:600, color:SC.aquaGreen, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>
                2025 Baseline · Q4 (Oct – Dec 2025) · {baseline.numEmployees} employees
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:16 }}>
                {[["oMAP", baseline.omap.toFixed(2)], ["Utilization", fmtP(baseline.utilization)], ["Monthly adj records", fmt(baseline.adjustedRecords)], ["Monthly prod hours", fmt(baseline.productiveHours)], ["Monthly total hours", fmt(baseline.totalHours)]].map(([l,v]) => (
                  <div key={l}><div style={{ fontSize:11, color:SC.paleBlue, opacity:0.7, marginBottom:2 }}>{l}</div><div style={{ fontSize:22, fontWeight:700, color:SC.white }}>{v}</div></div>
                ))}
              </div>
            </div>

            <div style={{ background:SC.card, border:`1px solid ${SC.cardBorder}`, borderRadius:12, padding:"18px 22px", marginBottom:20 }}>
              <h3 style={{ fontSize:11, fontWeight:600, color:SC.textSecondary, textTransform:"uppercase", letterSpacing:1.5, marginBottom:16 }}>Scenario inputs</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:"16px 24px" }}>
                <Slider label="Target oMAP (Productivity)" value={sOmap} min={Math.max(0.5, baseline.omap - 1)} max={baseline.omap + 4} step={0.01} set={setSOmap} fmt={v => v.toFixed(2)} />
                <Slider label="Monthly adjusted records (Units)" value={sRecords} min={Math.max(100, baseline.adjustedRecords - 5000)} max={baseline.adjustedRecords + 15000} step={100} set={setSRecords} fmt={fmt} />
                <Slider label="Target utilization %" value={sUtil} min={50} max={100} step={0.01} set={setSUtil} fmt={v => v.toFixed(1) + "%"} note="Standard: 80%" />
                <Slider label="Wage rate ($/hr)" value={sWage} min={15} max={50} step={0.01} set={setSWage} fmt={v => "$" + v.toFixed(2)} />
                <Slider label="Qualifying oMAP minimum" value={sQualOmap} min={Math.max(0.5, baseline.omap - 1)} max={baseline.omap + 4} step={0.01} set={setSQualOmap} fmt={v => v.toFixed(2)} accent />
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginBottom:20 }}>
              <KPI label="Qtr hours reduced" value={fmt(Math.abs(calc.qtrHrsSaved))} sub={calc.qtrHrsSaved >= 0 ? "hours saved" : "hours added"} color={calc.qtrHrsSaved >= 0 ? SC.aquaGreen : "#e74c3c"} />
              <KPI label="Qtr dollars saved" value={fmtD(Math.abs(calc.qtrDollarsSaved))} sub="labor savings" color={calc.qtrDollarsSaved >= 0 ? SC.aquaGreen : "#e74c3c"} />
              <KPI label="Qtr incentive pool" value={fmtD(calc.pool)} sub="self-funded" color={SC.tidalBlue} />
              <KPI label="Est. qualifying" value={calc.actualQual + " / " + calc.n} sub={`normal dist est: ${calc.estQual}`} color={SC.paleBlue} />
              <KPI label="Per-employee incentive" value={fmtD(calc.perEmp)} sub="quarterly payout" color={SC.aquaGreen} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))", gap:16, marginBottom:20 }}>
              <div style={{ background:SC.card, border:`1px solid ${SC.cardBorder}`, borderRadius:12, padding:16 }}>
                <h3 style={{ fontSize:11, fontWeight:600, color:SC.textSecondary, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Quarterly total hours: baseline vs target</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={[{ name: "Baseline", hours: Math.round(calc.blTotalHrs * 3) }, { name: "Target", hours: Math.round(calc.tTotalHrs * 3) }]} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke={SC.gridLine} />
                    <XAxis dataKey="name" stroke={SC.textSecondary} fontSize={12} />
                    <YAxis stroke={SC.textSecondary} fontSize={11} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={ttStyle} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} formatter={v => [fmt(v) + " hrs", "Hours"]} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} label={{ position: "top", fill: SC.mist, fontSize: 13, fontWeight: 600, formatter: v => fmt(v) }}><Cell fill={SC.slateTeal} /><Cell fill={SC.aquaGreen} /></Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", gap:16, fontSize:11, color:SC.textSecondary, marginTop:6, paddingLeft:8 }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"inline-block", width:12, height:12, borderRadius:3, background:SC.slateTeal }} /> Baseline</span>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"inline-block", width:12, height:12, borderRadius:3, background:SC.aquaGreen }} /> Target</span>
                </div>
              </div>

              <div style={{ background:SC.card, border:`1px solid ${SC.cardBorder}`, borderRadius:12, padding:16 }}>
                <h3 style={{ fontSize:11, fontWeight:600, color:SC.textSecondary, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>oMAP distribution &amp; qualifying threshold</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={calc.distData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={SC.gridLine} />
                    <XAxis dataKey="omap" stroke={SC.textSecondary} fontSize={11} />
                    <YAxis hide />
                    <Tooltip contentStyle={ttStyle} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} formatter={v => v.toFixed(4)} />
                    <Area type="monotone" dataKey="density" stroke={SC.slateTeal} fill={SC.slateTeal} fillOpacity={0.3} name="All employees" />
                    <Area type="monotone" dataKey="qual" stroke={SC.aquaGreen} fill={SC.aquaGreen} fillOpacity={0.35} name="Qualifying" />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", gap:16, fontSize:11, color:SC.textSecondary, marginTop:6, paddingLeft:8 }}>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"inline-block", width:12, height:12, borderRadius:3, background:SC.slateTeal }} /> All (μ={calc.mean.toFixed(2)}, σ={calc.std.toFixed(2)})</span>
                  <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"inline-block", width:12, height:12, borderRadius:3, background:SC.aquaGreen }} /> Qualifying ≥ {sQualOmap.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ background:SC.card, border:`1px solid ${SC.cardBorder}`, borderRadius:12, padding:16, marginBottom:20 }}>
              <h3 style={{ fontSize:11, fontWeight:600, color:SC.textSecondary, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Incentive funding flow (quarterly)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: "Labor $ saved", value: calc.pool },
                  { name: "→ Incentive pool", value: calc.pool },
                  { name: `→ Per employee (×${calc.actualQual})`, value: calc.perEmp }
                ]} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke={SC.gridLine} />
                  <XAxis dataKey="name" stroke={SC.textSecondary} fontSize={11} />
                  <YAxis stroke={SC.textSecondary} fontSize={11} tickFormatter={v => "$" + fmt(v)} domain={[0, 40000]} ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000, 35000]} />
                  <Tooltip contentStyle={ttStyle} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} formatter={v => fmtD(v)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: "top", fill: SC.mist, fontSize: 13, fontWeight: 600, formatter: v => fmtD(v) }}><Cell fill={SC.aquaGreen} /><Cell fill={SC.tidalBlue} /><Cell fill={SC.slateTeal} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:SC.card, border:`1px solid ${SC.cardBorder}`, borderRadius:12, padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <h3 style={{ fontSize:11, fontWeight:600, color:SC.textSecondary, textTransform:"uppercase", letterSpacing:1.2 }}>Estimated qualifying — Jan–Mar 2026 performance</h3>
                <span style={{ fontSize:12, color:SC.aquaGreen, fontWeight:600 }}>{calc.empPerf.filter(e => e.qualifies).length} of {calc.empPerf.length} qualifying</span>
              </div>
              <p style={{ fontSize:12, color:SC.textSecondary, marginBottom:12 }}>Must meet both: oMAP ≥ {sQualOmap.toFixed(2)} AND utilization ≥ 80%</p>
              <div style={{ overflowX:"auto", maxHeight:400, overflowY:"auto" }}>
                <table style={{ width:"100%", fontSize:13, borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`2px solid ${SC.cardBorder}`, textAlign:"left", color:SC.textSecondary, fontSize:11, textTransform:"uppercase" }}>
                      <th style={{ padding:"8px 8px 8px 0", width:32 }}>#</th>
                      <th style={{ padding:"8px 8px 8px 0" }}>Payroll name</th>
                      <th style={{ padding:"8px 8px 8px 0", textAlign:"right" }}>oMAP</th>
                      <th style={{ padding:"8px 8px 8px 0", textAlign:"center", width:40 }}>Pass</th>
                      <th style={{ padding:"8px 8px 8px 0", textAlign:"right" }}>Util %</th>
                      <th style={{ padding:"8px 8px 8px 0", textAlign:"center", width:40 }}>Pass</th>
                      <th style={{ padding:"8px 0", textAlign:"center", width:80 }}>Qualifies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.empPerf.map((e, i) => (
                      <tr key={e.name} style={{ borderBottom:`1px solid ${SC.cardBorder}`, background: e.qualifies ? "rgba(0,191,165,0.07)" : "transparent" }}>
                        <td style={{ padding:"8px 8px 8px 0", color:SC.textSecondary }}>{i + 1}</td>
                        <td style={{ padding:"8px 8px 8px 0", color:SC.textPrimary, fontWeight:500 }}>{e.name}</td>
                        <td style={{ padding:"8px 8px 8px 0", textAlign:"right", fontFamily:"monospace", color: e.meetsOmap ? SC.aquaGreen : SC.textSecondary }}>{fmtO(e.recentOmap)}</td>
                        <td style={{ padding:"8px 8px 8px 0", textAlign:"center" }}>{e.hasRecent ? (e.meetsOmap ? <span style={{color:SC.aquaGreen}}>✓</span> : <span style={{color:"#e74c3c",fontSize:11}}>✗</span>) : "—"}</td>
                        <td style={{ padding:"8px 8px 8px 0", textAlign:"right", fontFamily:"monospace", color: e.meetsUtil ? SC.aquaGreen : SC.textSecondary }}>{fmtP(e.recentUtil)}</td>
                        <td style={{ padding:"8px 8px 8px 0", textAlign:"center" }}>{e.hasRecent ? (e.meetsUtil ? <span style={{color:SC.aquaGreen}}>✓</span> : <span style={{color:"#e74c3c",fontSize:11}}>✗</span>) : "—"}</td>
                        <td style={{ padding:"8px 0", textAlign:"center" }}>{e.qualifies ? <span style={{ color:SC.aquaGreen, fontWeight:700 }}>✓ YES</span> : <span style={{color:SC.cardBorder}}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, set, fmt, accent, note }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const c = accent ? SC.tidalBlue : SC.aquaGreen;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
        <label style={{ fontSize:12, color:SC.textSecondary }}>{label}{note && <span style={{ color:SC.slateTeal, marginLeft:4 }}>({note})</span>}</label>
        <span style={{ fontSize:13, fontWeight:700, color: accent ? SC.tidalBlue : SC.textPrimary }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(parseFloat(e.target.value))}
        style={{ width:"100%", height:6, borderRadius:4, appearance:"none", cursor:"pointer",
          background: `linear-gradient(to right, ${c} 0%, ${c} ${pct}%, ${SC.cardBorder} ${pct}%, ${SC.cardBorder} 100%)` }} />
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:SC.slateTeal, marginTop:2 }}><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
    </div>
  );
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={{ background:SC.card, border:`1px solid ${SC.cardBorder}`, borderRadius:12, padding:"12px 14px" }}>
      <div style={{ fontSize:11, color:SC.textSecondary, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:SC.slateTeal, marginTop:2 }}>{sub}</div>}
    </div>
  );
}
