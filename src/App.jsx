import { useState, useEffect, useCallback } from "react";

/* ─── OD lookup table ────────────────────────────────────────── */
const OD_TABLE = [
  { od:0.500, nominal:'⅜"',   material:"Copper / PEX" },
  { od:0.625, nominal:'½"',   material:"Copper / PEX / CPVC" },
  { od:0.840, nominal:'½"',   material:"PVC / Galvanized / Steel" },
  { od:0.875, nominal:'¾"',   material:"Copper / PEX / CPVC" },
  { od:1.050, nominal:'¾"',   material:"PVC / Galvanized / Steel" },
  { od:1.125, nominal:'1"',   material:"Copper / PEX / CPVC" },
  { od:1.315, nominal:'1"',   material:"PVC / Galvanized / Steel" },
  { od:1.375, nominal:'1¼"',  material:"Copper" },
  { od:1.625, nominal:'1½"',  material:"Copper" },
  { od:1.660, nominal:'1¼"',  material:"PVC / ABS / Galvanized" },
  { od:1.900, nominal:'1½"',  material:"PVC / ABS / Galvanized" },
  { od:2.125, nominal:'2"',   material:"Copper" },
  { od:2.300, nominal:'2"',   material:"Cast Iron" },
  { od:2.375, nominal:'2"',   material:"PVC / ABS" },
  { od:3.300, nominal:'3"',   material:"Cast Iron" },
  { od:3.500, nominal:'3"',   material:"PVC / ABS" },
  { od:4.300, nominal:'4"',   material:"Cast Iron" },
  { od:4.500, nominal:'4"',   material:"PVC / ABS" },
  { od:4.800, nominal:'4"',   material:"AC Pipe / Ductile Iron", hazmat:true },
  { od:5.250, nominal:'4"',   material:"Terra Cotta" },
  { od:4.960, nominal:'4"',   material:"Vitrified Clay (ASTM C700)" },
  { od:4.960, nominal:'4"',   material:"West Coast Clay / VCP" },
  { od:4.375, nominal:'4"',   material:"Orangeburg (approx)" },
  { od:6.400, nominal:'6"',   material:"Orangeburg (approx)" },
  { od:6.900, nominal:'6"',   material:"Ductile Iron" },
  { od:7.100, nominal:'6"',   material:"AC Pipe", hazmat:true },
  { od:7.500, nominal:'6"',   material:"Terra Cotta" },
  { od:7.400, nominal:'6"',   material:"Vitrified Clay (ASTM C700)" },
  { od:7.375, nominal:'6"',   material:"West Coast Clay / VCP" },
  { od:8.500, nominal:'8"',   material:"Orangeburg (approx)" },
  { od:9.050, nominal:'8"',   material:"AC Pipe / Ductile Iron", hazmat:true },
  { od:9.700, nominal:'8"',   material:"Vitrified Clay (ASTM C700)" },
  { od:9.625, nominal:'8"',   material:"West Coast Clay / VCP" },
  { od:11.350, nominal:'10"', material:"AC Pipe / Ductile Iron", hazmat:true },
  { od:12.080, nominal:'10"',  material:"Vitrified Clay (ASTM C700)" },
  { od:11.500, nominal:'10"',  material:"West Coast Clay / VCP" },
  { od:14.560, nominal:'12"',  material:"Vitrified Clay (ASTM C700)" },
  { od:13.500, nominal:'12"', material:"AC Pipe / Ductile Iron", hazmat:true },
  { od:4.215,  nominal:'4"',   material:"SDR 35 Sewer" },
  { od:6.275,  nominal:'6"',   material:"SDR 35 Sewer" },
  { od:8.400,  nominal:'8"',   material:"SDR 35 Sewer" },
  { od:10.500, nominal:'10"',  material:"SDR 35 Sewer" },
  { od:12.500, nominal:'12"',  material:"SDR 35 Sewer" },
  { od:15.300, nominal:'15"',  material:"SDR 35 Sewer" },
  { od:16.00,  nominal:'12"',  material:"Concrete RCP" },
];

function lookupOD(measIn) {
  return [...OD_TABLE]
    .sort((a,b) => Math.abs(a.od-measIn) - Math.abs(b.od-measIn))
    .slice(0,2);
}
/* ─── Danger pipe database ───────────────────────────────────── */
const DANGER_LEVEL = {
  HAZMAT:      { color:"#ef4444", bg:"rgba(239,68,68,.12)",   border:"rgba(239,68,68,.4)",   label:"HAZMAT",       icon:"☢️" },
  GAS:         { color:"#ef4444", bg:"rgba(239,68,68,.12)",   border:"rgba(239,68,68,.4)",   label:"GAS — DANGER", icon:"🔥" },
  RECALLED:    { color:"#f59e0b", bg:"rgba(245,158,11,.12)", border:"rgba(245,158,11,.4)", label:"RECALLED",     icon:"⚠️" },
  LEAD:        { color:"#ef4444", bg:"rgba(239,68,68,.12)",   border:"rgba(239,68,68,.4)",   label:"HEALTH HAZARD",icon:"☠️" },
  DISCONTINUED:{ color:"#f97316", bg:"rgba(249,115,22,.12)", border:"rgba(249,115,22,.4)", label:"DISCONTINUED", icon:"⚠️" },
};

const DANGER_DB = [
  {
    id:"kitec", material:"Kitec / PEX-AL-PEX",
    aka:"IPEX, Plomberie Kitec, WarmRite, Kitec XPA",
    level:"RECALLED", color:"#f97316",
    visual:"Orange (hot) or blue (cold) flexible layered plastic pipe with aluminum core. Brass fittings. Used 1995–2007 in North American condos and townhomes.",
    id_tips:"Orange or blue layered flexible pipe. Brass fittings stamped Kitec, IPEX, or XPA. Often in manifold systems behind access panels.",
    why_dangerous:"Brass fittings have high zinc content — dezincify internally. Fitting crumbles from the inside causing catastrophic sudden failure and flooding. Failure rate accelerates after 15–20 years.",
    status:"Class action settlement 2011 Canada/US. Settlement fund closed. Millions of homes still have Kitec.",
    action:[
      "Do NOT cut, disturb, or add to Kitec system",
      "Inspect all visible brass fittings for white powder (dezincification)",
      "Advise homeowner of recall and failure risk — put it in writing",
      "Document all visible Kitec with photographs",
      "Recommend full replacement by licensed plumber",
      "Replacement options: PEX-A, copper, or CPVC",
    ],
    professional_required:true,
    notify:"Homeowner / property manager must be notified in writing",
  },
  {
    id:"polybutylene", material:"Polybutylene (PB / Quest Pipe)",
    aka:"Quest pipe, PB2110, Shell Chemical poly pipe",
    level:"RECALLED", color:"#8b5cf6",
    visual:"Grey, blue, or black flexible plastic pipe. Stamped PB2110 or Quest. Acetal plastic fittings — grey or white. Used 1978–1995.",
    id_tips:"Grey/blue flexible plastic — softer than PVC. Stamped PB2110 or Quest. Grey acetal fittings — not brass. Common in manufactured homes and residential from late 1970s to mid-1990s.",
    why_dangerous:"Chlorine and oxidants in municipal water cause micro-fractures from the inside. Pipe fails suddenly — no visible warning. Fittings crack under pressure.",
    status:"Cox v. Shell Oil settlement 1995 — $950M fund now closed. Estimated 6–10 million US homes still have polybutylene.",
    action:[
      "Do NOT repair with additional polybutylene",
      "Do NOT use copper fittings — incompatible, accelerates failure",
      "Advise client of failure risk and discontinued status immediately",
      "Document all visible polybutylene with photographs",
      "Recommend full re-pipe — typical cost $4,000–$10,000",
      "Re-pipe options: PEX-A or copper",
    ],
    professional_required:true,
    notify:"Homeowner must be informed in writing — affects insurability and home resale",
  },
  {
    id:"yellow_pvc_gas", material:"Yellow PVC Gas Distribution Pipe",
    aka:"IPS Yellow PVC, Schedule 40 Yellow Gas Pipe",
    level:"GAS", color:"#f5c518",
    visual:"Bright yellow PVC pipe — identical to white PVC in form. Stamped GAS and ASTM D2513. Used for natural gas and propane underground distribution.",
    id_tips:"Bright yellow color is the primary identifier. Same size and form as white PVC. Often found buried or in gas meter rooms.",
    why_dangerous:"Carries natural gas or propane under pressure. Any incorrect connection, damage, or improper repair creates explosion and fire risk. Requires gas certification and calibrated pressure testing equipment.",
    status:"Active in service. Approved for gas per ASTM D2513. NOT approved for water, drainage, or any other application.",
    action:[
      "STOP WORK immediately if this pipe is cut or damaged",
      "Do NOT attempt repair without gas contractor certification",
      "If gas odor detected — evacuate immediately and call 911",
      "Call 811 (USA) before any digging near yellow pipe",
      "Only licensed gas contractors may work on this system",
      "Pressure test required after any work",
    ],
    professional_required:true,
    notify:"Gas utility company must be notified of any damage or work",
    emergency:"Gas smell: evacuate immediately · Call 911 · Call gas company emergency line",
  },
  {
    id:"yellow_pe_gas", material:"Yellow PE Gas Pipe (HDPE/MDPE)",
    aka:"Poly gas pipe, yellow polyethylene, medium density PE gas",
    level:"GAS", color:"#f5c518",
    visual:"Yellow flexible polyethylene pipe, often coiled. Found buried underground as gas service lines from main to meter. May appear as yellow stripe on black HDPE.",
    id_tips:"Yellow flexible plastic — coiled or straight. Stamped GAS and ASTM D2513 or D3035. Softer than PVC. Typically enters building at gas meter.",
    why_dangerous:"Natural gas distribution line. Requires fusion welding or approved mechanical fittings — no solvent cement. Specialized equipment and gas certification required. Improper connection causes gas leak.",
    status:"Standard for underground gas distribution. Active service nationwide.",
    action:[
      "STOP WORK — do not cut or connect without gas certification",
      "Call 811 before any excavation near this pipe",
      "Only gas-certified contractors may make connections",
      "Connections require butt fusion or electrofusion equipment",
      "If damaged underground — call gas company immediately",
      "Never attempt threaded connection on PE gas pipe",
    ],
    professional_required:true,
    notify:"Gas utility must be contacted before any work",
    emergency:"Gas smell: evacuate · Call 911 · Call gas company emergency",
  },
  {
    id:"csst", material:"CSST — Corrugated Stainless Steel Tubing",
    aka:"TracPipe, CounterStrike, Gastite, FlexPipe",
    level:"GAS", color:"#d4af37",
    visual:"Flexible corrugated stainless steel with plastic jacket — gold or black. Runs from gas manifold to appliances inside building. Typically ½\" to 1\" diameter.",
    id_tips:"Corrugated flexible metallic pipe with plastic jacket. Yellow/gold or black. Runs through walls and floors to gas appliances. Much smaller diameter than black steel.",
    why_dangerous:"Lightning strikes can arc through CSST burning a pinhole — causes gas leak and fire. Must be bonded and grounded per NFPA 54. Older installations often lack required bonding.",
    status:"Active and code-compliant when properly installed. Black-jacketed CounterStrike is arc-resistant. Pre-2006 yellow CSST requires bonding at every connection point.",
    action:[
      "Verify bonding conductor is installed — required by NFPA 54",
      "Only licensed gas contractors may modify CSST runs",
      "Do not kink, crush, or penetrate jacket",
      "Maintain minimum bend radius — no tight corners",
      "Check all fittings with gas detector or soap solution",
      "Pre-2006 installation: advise bonding inspection by gas contractor",
    ],
    professional_required:true,
    notify:"Homeowner — verify bonding was installed, especially pre-2006",
  },
  {
    id:"lead", material:"Lead Pipe / Lead Service Line",
    aka:"Lead supply pipe, lead service line, galena pipe",
    level:"LEAD", color:"#6b7280",
    visual:"Dull grey soft metal. Scratching surface reveals bright silver underneath. Slightly flexible. Bulges at swaged joints. Found as service line from street or as small branch lines in pre-1930 homes.",
    id_tips:"Very soft grey metal — scratch with key to confirm bright silver. Slightly flexible. Swaged bulge joints. Often near water meter or as small diameter supply pipes in very old homes.",
    why_dangerous:"Lead leaches into drinking water continuously. No safe level of exposure. Causes irreversible developmental damage in children and cardiovascular disease in adults.",
    status:"Banned for new installation in USA since 1986. EPA Lead and Copper Rule requires utility notification and service line replacement programs.",
    action:[
      "Do NOT disturb — disturbance spikes lead levels in water",
      "Advise NO use of tap water for drinking or cooking until tested",
      "Run cold water 2–3 min before any use — do not use first-draw water",
      "Do NOT use hot water from tap for food or drink",
      "Notify homeowner in writing — immediate health concern",
      "Contact local water utility — many offer free testing and replacement",
      "NSF/ANSI 53 certified filter required in the interim",
      "Replacement by licensed plumber — utility may fund service line portion",
    ],
    professional_required:true,
    notify:"Homeowner in writing · Water utility · Local health department if children present",
    health_note:"If children or pregnant women in the home — advise immediate blood lead level testing through healthcare provider",
  },
  {
    id:"orangeburg", material:"Orangeburg Pipe (Bituminous Fiber)",
    aka:"No-corrode pipe, fiber conduit, bituminous fiber sewer pipe",
    level:"DISCONTINUED", color:"#78350f",
    visual:"Dark brown/black layered fibrous pipe. Lightweight. Often oval or egg-shaped from ground pressure. Soft — dents with fingernail. Resembles compressed cardboard.",
    id_tips:"Dark brown layered fibrous texture — like compressed cardboard or paper. Very light. Oval shape from soil pressure. Common in post-WWII housing 1945–1972.",
    why_dangerous:"No remaining serviceable life. Ground pressure deforms pipe oval — reduces flow and causes collapse. Water absorption destroys material. Patches and couplings fail quickly.",
    status:"Discontinued 1972. Some formulations contain asbestos. No longer manufactured. Replacement is the only appropriate solution.",
    action:[
      "Do NOT attempt repair with couplings — temporary fix only",
      "Camera inspect the full run before quoting replacement",
      "Expect significant deformation — standard equipment may not work",
      "Note: some Orangeburg contains asbestos — test if uncertain",
      "Advise client full replacement is required — not optional",
      "Replacement: PVC SDR 35, HDPE, or CIPP lining if structurally sound",
    ],
    professional_required:true,
    notify:"Homeowner — document condition in writing with photographs",
  },
];

function lookupDanger(materialStr) {
  if (!materialStr) return null;
  const m = materialStr.toLowerCase();
  for (const d of DANGER_DB) {
    if (
      (d.id==="kitec"         && (m.includes("kitec")||m.includes("pex-al")||m.includes("pex al"))) ||
      (d.id==="polybutylene"  && (m.includes("polybutylene")||m.includes("poly b")||m.includes("quest"))) ||
      (d.id==="yellow_pvc_gas"&& m.includes("yellow")&&m.includes("pvc")) ||
      (d.id==="yellow_pe_gas" && m.includes("yellow")&&(m.includes(" pe ")||m.includes("polyethylene"))) ||
      (d.id==="csst"          && (m.includes("csst")||m.includes("corrugated stainless")||m.includes("tracpipe")||m.includes("gastite"))) ||
      (d.id==="lead"          && m.includes("lead")) ||
      (d.id==="orangeburg"    && (m.includes("orangeburg")||m.includes("bituminous")))
    ) return d;
  }
  return null;
}

/* ─── AI prompts ─────────────────────────────────────────────────

   TOP-DOWN MODE:
   Camera shoots straight down at a pipe lying horizontally.
   Quarter rests on TOP of the pipe (curved surface).
   The pipe appears as a long cylinder — OD = visible width between
   the two outermost edges of the pipe.

   PARALLAX NOTE: Quarter is elevated above the ground by the pipe
   radius, so it's slightly closer to the camera than the pipe edges.
   This makes the quarter appear fractionally larger in the image.
   Correction factor: quarter_apparent_px should be slightly reduced.
   For most pipes (<4") the error is <2% and within tolerance.
   For larger pipes the AI is instructed to note uncertainty.

   CROSS-SECTION MODE:
   Camera shoots at the cut end of a pipe.
   Pipe appears as a circle/ring. Quarter lies flat beside the end.
   OD = outer diameter of the circle.
   Wall thickness is also measurable → helps confirm grade.
─────────────────────────────────────────────────────────────── */
/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
:root {
  --blk:#0c0c0c; --blk2:#141414; --blk3:#1c1c1c; --blk4:#262626;
  --red:#cc2020; --redhi:#e83030;          /* danger only */
  --cop:#c9793c; --cophi:#de9757;          /* accent — copper */
  --grn:#22c55e; --grnhi:#4ade80;
  --yel:#f5c518;
  --wht:#f0ebe0; --w80:rgba(240,235,224,.80); --w50:rgba(240,235,224,.50);
  --w40:rgba(240,235,224,.40); --w25:rgba(240,235,224,.25); --w12:rgba(240,235,224,.12); --w06:rgba(240,235,224,.06);
  --bdr:rgba(240,235,224,.14); --bdr2:rgba(240,235,224,.25);
  --r:4px; --rm:8px;
  /* Mobile-first type scale — all sizes defined here, override for desktop */
  --fs-xs:13px; --fs-sm:15px; --fs-md:17px; --fs-lg:20px; --fs-xl:24px;
  --fs-label:11px; --fs-mono:13px;
  --touch:48px; /* minimum tap target */
}
/* On wider screens (tablet / desktop) scale down slightly */
@media (min-width: 640px) {
  :root {
    --fs-xs:11px; --fs-sm:13px; --fs-md:15px; --fs-lg:18px; --fs-xl:22px;
    --fs-label:9px; --fs-mono:11px;
    --touch:40px;
  }
}
html,body{height:100%;margin:0;padding:0}#root{height:100%;height:100dvh;background:var(--blk);overflow:hidden;font-size:16px}
body{font-family:'Barlow',sans-serif;color:var(--wht);-webkit-font-smoothing:antialiased;
  -webkit-text-size-adjust:100%}
button{font-family:'Barlow',sans-serif;cursor:pointer;border:none;background:none;
  box-sizing:border-box}
.btn-fire,.btn-ghost{min-height:var(--touch)}
select,input,textarea{font-family:'JetBrains Mono',monospace;font-size:var(--fs-sm)}
.scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;flex-shrink:1}
.scroll::-webkit-scrollbar{width:3px}
.scroll::-webkit-scrollbar-thumb{background:var(--w25);border-radius:2px}
.bc{font-family:'Barlow Condensed',sans-serif}
.mono{font-family:'JetBrains Mono',monospace}

@keyframes spin    {to{transform:rotate(360deg)}}
@keyframes up      {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
div::-webkit-scrollbar { display:none; }

.slidein {animation:up .3s cubic-bezier(.22,.68,0,1.15) both}

.stripe{background:repeating-linear-gradient(-45deg,var(--yel) 0px,var(--yel) 9px,var(--blk) 9px,var(--blk) 18px)}

.btn-fire{background:var(--cop);color:var(--blk);font-family:'Barlow Condensed',sans-serif;
  font-weight:800;font-size:21px;letter-spacing:.06em;text-transform:uppercase;
  border:none;border-radius:var(--r);padding:17px 20px;width:100%;cursor:pointer;
  transition:background .12s,transform .1s;display:flex;align-items:center;justify-content:center;gap:10px;
  min-height:var(--touch)}
.btn-fire:hover{background:var(--cophi)}
.btn-fire:active{transform:scale(.97)}
.btn-fire:disabled{opacity:.35;cursor:not-allowed;transform:none}

.btn-ghost{border:1.5px solid var(--bdr2);color:var(--w80);font-size:var(--fs-sm);font-weight:600;
  border-radius:var(--r);padding:10px 16px;background:none;cursor:pointer;transition:background .12s;
  min-height:var(--touch)}
.btn-ghost:hover{background:var(--w06)}

.redtop{height:2px;background:var(--cop);flex-shrink:0}
.body-text{font-size:15px;color:var(--w80);line-height:1.5}
.body-muted{font-size:15px;color:var(--w50);line-height:1.5}

`;

const Mono = ({c,s={}}) => <span className="mono" style={s}>{c}</span>;
const BC   = ({c,s={}}) => <span className="bc"   style={s}>{c}</span>;
const SectionLabel = ({c}) => (
  <BC c={c} s={{fontSize:15,color:"var(--w50)",letterSpacing:".14em",
    textTransform:"uppercase",display:"block",marginBottom:8,fontWeight:700}}/>
);


/* ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   APP — clean rewrite. All state here. All screens receive
   exactly what they need via props. Navigation is a single
   navigate(id) function passed everywhere. No closures trapped
   in child components.
═══════════════════════════════════════════════════════════ */
/* ─── Onboarding feature cards ─────────────────────────────── */
const ONBOARD_FEATURES = [
  {icon:"📏", title:"No calipers needed",     body:"Wrap a string around the pipe, measure it, enter the length — get the OD."},
  {icon:"⚠️",  title:"Hazmat detection",       body:"Automatically flags Kitec, polybutylene, lead, and other dangerous materials."},
  {icon:"🔧", title:"Part numbers + where to buy", body:"Real part numbers and retailer links for fittings that fit your exact pipe."},
];



/* ═══════════════════════════════════════════════════════════
   LICENSE — 3 day trial, then $12 one-time unlock
   Token is stored locally so the unlock survives with no signal.
═══════════════════════════════════════════════════════════ */
const TRIAL_DAYS = 3;
const PRICE_LABEL = "$12";
const LS_INSTALL = "pp_install";
const LS_LICENSE = "pp_license";
const LS_EMAIL   = "pp_email";
const DAY_MS = 86400000;

function lsGet(k){ try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k,v){ try { localStorage.setItem(k,v); } catch {} }

/* First launch stamps the install date */
function installTime() {
  let t = lsGet(LS_INSTALL);
  if (!t) { t = String(Date.now()); lsSet(LS_INSTALL, t); }
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : Date.now();
}

function trialInfo() {
  const elapsed = Date.now() - installTime();
  const msLeft  = TRIAL_DAYS * DAY_MS - elapsed;
  return {
    active:    msLeft > 0,
    msLeft,
    daysLeft:  Math.max(0, Math.ceil(msLeft / DAY_MS)),
    hoursLeft: Math.max(0, Math.ceil(msLeft / 3600000)),
  };
}

const hasLicense = () => !!lsGet(LS_LICENSE);

/* ═══ Paywall ═══ */
function PaywallScreen({ onUnlocked }) {
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState("");
  const [mode, setMode]   = useState("buy");
  const [email, setEmail] = useState("");

  const buy = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/checkout", { method:"POST" });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      setErr(d.error || "Could not start checkout. Try again.");
    } catch {
      setErr("No connection. Checkout needs signal — try again where you have service.");
    }
    setBusy(false);
  };

  const restore = async () => {
    if (!email.trim()) { setErr("Enter the email you paid with."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/verify?email=${encodeURIComponent(email.trim())}`);
      const d = await r.json();
      if (d.paid && d.token) {
        lsSet(LS_LICENSE, d.token); lsSet(LS_EMAIL, d.email || email);
        onUnlocked(); return;
      }
      setErr("No purchase found for that email.");
    } catch {
      setErr("Could not reach the server. Check your connection.");
    }
    setBusy(false);
  };

  const FEATURES = [
    ["OD tables + string method", "Identify any pipe with a tape measure"],
    ["Compatibility",            "What connects to what, and how"],
    ["Fittings + part numbers",  "Verified parts, straight to the product page"],
    ["Solvents + pro tips",      "Right cement, right primer, right cure time"],
    ["Hazard identification",    "Asbestos, lead, poly-B, Kitec"],
  ];

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--blk)"}}>
      <div style={{height:2,background:"var(--cop)",flexShrink:0}}/>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",
        padding:"28px 20px 32px",display:"flex",flexDirection:"column",alignItems:"center"}}>

        <svg viewBox="0 0 64 96" style={{width:46,marginBottom:14}} aria-hidden="true">
          <line x1="14" y1="8" x2="14" y2="88" stroke="var(--cop)" strokeWidth="13" strokeLinecap="round"/>
          <path d="M14 14 C44 14 55 26 55 36 C55 46 44 58 14 58" fill="none"
            stroke="var(--cop)" strokeWidth="13" strokeLinecap="round"/>
        </svg>

        <BC c="TRIAL ENDED" s={{fontSize:15,fontWeight:900,letterSpacing:".18em",
          color:"var(--cop)",marginBottom:8}}/>
        <BC c="POCKET PLUMBER™" s={{fontSize:31,fontWeight:900,letterSpacing:".02em",
          color:"var(--wht)",marginBottom:6,textAlign:"center"}}/>
        <div style={{fontSize:15,color:"var(--w50)",textAlign:"center",
          marginBottom:24,lineHeight:1.5,maxWidth:320}}>
          Your 3 free days are up. Unlock it once and it&rsquo;s yours — no subscription,
          no account, works with no signal.
        </div>

        {mode === "buy" ? (
          <>
            <div style={{width:"100%",maxWidth:360,marginBottom:22}}>
              {FEATURES.map(([title,sub])=>(
                <div key={title} style={{display:"flex",gap:11,alignItems:"flex-start",
                  padding:"10px 0",borderBottom:"1px solid var(--bdr)"}}>
                  <BC c="✓" s={{fontSize:17,color:"var(--cop)",flexShrink:0,lineHeight:1.3}}/>
                  <div>
                    <BC c={title} s={{fontSize:17,fontWeight:800,color:"var(--wht)",
                      display:"block",letterSpacing:".03em"}}/>
                    <div style={{fontSize:13,color:"var(--w50)",marginTop:1}}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={buy} disabled={busy} className="btn-fire"
              style={{width:"100%",maxWidth:360,padding:"16px",borderRadius:"var(--r)",
                border:"none",opacity:busy?.6:1,marginBottom:10}}>
              {busy ? "Opening checkout…" : `Unlock — ${PRICE_LABEL} one time`}
            </button>

            <div style={{fontSize:13,color:"var(--w25)",marginBottom:16,textAlign:"center"}}>
              Secure checkout by Stripe · no account needed
            </div>

            <button onClick={()=>{setMode("restore");setErr("");}}
              style={{background:"none",border:"none",cursor:"pointer",
                fontSize:14,color:"var(--w50)",textDecoration:"underline",
                fontFamily:"inherit",minHeight:"unset"}}>
              Already bought it? Restore purchase
            </button>
          </>
        ) : (
          <div style={{width:"100%",maxWidth:360}}>
            <BC c="RESTORE PURCHASE" s={{fontSize:14,fontWeight:900,letterSpacing:".12em",
              color:"var(--w50)",display:"block",marginBottom:10}}/>
            <div style={{fontSize:14,color:"var(--w50)",marginBottom:12,lineHeight:1.5}}>
              Enter the email you used at checkout. New phone, reinstall, cleared browser —
              this brings it back.
            </div>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              type="email" inputMode="email" autoCapitalize="off" autoCorrect="off"
              placeholder="you@example.com"
              style={{width:"100%",padding:"13px 14px",borderRadius:"var(--r)",
                background:"var(--blk3)",border:"1px solid var(--bdr2)",
                color:"var(--wht)",fontSize:16,marginBottom:12,outline:"none"}}/>
            <button onClick={restore} disabled={busy} className="btn-fire"
              style={{width:"100%",padding:"15px",borderRadius:"var(--r)",
                border:"none",opacity:busy?.6:1,marginBottom:12}}>
              {busy ? "Checking…" : "Restore"}
            </button>
            <button onClick={()=>{setMode("buy");setErr("");}}
              style={{background:"none",border:"none",cursor:"pointer",width:"100%",
                fontSize:14,color:"var(--w50)",textDecoration:"underline",
                fontFamily:"inherit",minHeight:"unset"}}>
              Back
            </button>
          </div>
        )}

        {err && (
          <div style={{marginTop:16,padding:"11px 13px",borderRadius:"var(--r)",
            background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.35)",
            maxWidth:360,fontSize:14,color:"rgba(255,190,190,.92)",lineHeight:1.45}}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Trial countdown banner ═══ */
function TrialBanner({ trial, onBuy }) {
  const urgent = trial.daysLeft <= 1;
  return (
    <button onClick={onBuy} style={{
      width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
      gap:10,padding:"8px 14px",cursor:"pointer",minHeight:"unset",border:"none",
      background: urgent ? "rgba(239,68,68,.1)" : "rgba(201,121,60,.09)",
      borderBottom:`1px solid ${urgent ? "rgba(239,68,68,.3)" : "rgba(201,121,60,.28)"}`,
    }}>
      <BC c={urgent
              ? `TRIAL · ${trial.hoursLeft} HOUR${trial.hoursLeft===1?"":"S"} LEFT`
              : `TRIAL · ${trial.daysLeft} DAYS LEFT`}
        s={{fontSize:13,fontWeight:900,letterSpacing:".1em",
          color: urgent ? "#ef4444" : "var(--cop)"}}/>
      <BC c={`Unlock ${PRICE_LABEL} →`} s={{fontSize:14,fontWeight:800,
        color: urgent ? "#ef4444" : "var(--cop)"}}/>
    </button>
  );
}

export default function App() {
  /* ── Screens: home | fittings | connect | reference */
  const [screen, setScreen] = useState("home");

  /* ── License: 3-day trial, then $12 unlock ── */
  const [licensed, setLicensed] = useState(hasLicense);
  const [trial, setTrial]       = useState(trialInfo);
  const [forcePay, setForcePay] = useState(false);

  /* Returning from Stripe: ?session_id=... → verify and store the token */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (!sid || hasLicense()) return;
    (async () => {
      try {
        const r = await fetch(`/api/verify?session_id=${encodeURIComponent(sid)}`);
        const d = await r.json();
        if (d.paid && d.token) {
          lsSet(LS_LICENSE, d.token);
          if (d.email) lsSet(LS_EMAIL, d.email);
          setLicensed(true); setForcePay(false);
        }
      } catch { /* leave locked; they can restore by email */ }
      window.history.replaceState({}, "", window.location.pathname);
    })();
  }, []);

  /* Re-check the clock when the app comes back to the foreground */
  useEffect(() => {
    const tick = () => setTrial(trialInfo());
    const id = setInterval(tick, 60000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, []);

  const locked = !licensed && (!trial.active || forcePay);

  /* ── First launch onboarding */
  const [showOnboard, setShowOnboard] = useState(() => {
    try { return !localStorage.getItem("pid_seen"); } catch { return false; }
  });
  const dismissOnboard = () => {
    try { localStorage.setItem("pid_seen","1"); } catch {}
    setShowOnboard(false);
  };

  /* ── Navigation ─────────────────────────────────────────────
     Single function. Passed as a prop to every screen.
     No closures. Always works.
  ─────────────────────────────────────────────────────────── */
  const navigate = useCallback((id) => { setScreen(id); }, []);

  /* ── Shared props passed to every screen */
  const nav = { screen, navigate };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  // Inject global CSS once — covers ALL screens including external components
  useEffect(() => {
    let el = document.getElementById("pipeid-global-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "pipeid-global-css";
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }, []);

  if (locked) return <PaywallScreen onUnlocked={()=>{setLicensed(true);setForcePay(false);}}/>;

  if (screen === "home") return (
    <>
      <HomeScreen {...nav} trial={!licensed ? trial : null}
        onBuy={()=>setForcePay(true)}/>
      {showOnboard && (
        <div onClick={dismissOnboard} style={{
          position:"fixed",inset:0,background:"rgba(10,10,10,.97)",
          zIndex:500,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          padding:"32px 28px",cursor:"pointer",overflowY:"auto",
        }}>
          <svg viewBox="0 0 64 96" style={{width:52,marginBottom:14}} aria-hidden="true">
            <line x1="14" y1="8" x2="14" y2="88" stroke="var(--cop)" strokeWidth="13" strokeLinecap="round"/>
            <path d="M14 14 C44 14 55 26 55 36 C55 46 44 58 14 58" fill="none" stroke="var(--cop)" strokeWidth="13" strokeLinecap="round"/>
          </svg>
          <BC c="POCKET PLUMBER™" s={{fontSize:27,fontWeight:900,
            letterSpacing:".03em",color:"var(--wht)",marginBottom:8}}/>
          <BC c="A contractor-grade field reference" s={{
            fontSize:15,fontWeight:700,
            color:"rgba(240,235,224,.4)",marginBottom:28,letterSpacing:".02em"}}/>
          {ONBOARD_FEATURES.map(f=>(
            <div key={f.title} style={{
              display:"flex",gap:14,alignItems:"flex-start",
              marginBottom:16,width:"100%",maxWidth:360,
            }}>
              <div style={{fontSize:22,flexShrink:0,marginTop:2}}>{f.icon}</div>
              <div>
                <BC c={f.title} s={{fontSize:16,fontWeight:900,display:"block",marginBottom:3}}/>
                <div style={{fontSize:15,color:"var(--w50)",lineHeight:1.45}}>{f.body}</div>
              </div>
            </div>
          ))}
          <div style={{
            marginTop:12,padding:"14px 48px",borderRadius:"var(--r)",
            background:"var(--cop)",cursor:"pointer",
            fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:21,fontWeight:800,letterSpacing:".08em",
            color:"var(--blk)",
          }}>
            GET STARTED
          </div>
          <div style={{fontSize:13,color:"var(--w25)",marginTop:10,letterSpacing:".06em"}}>
            Tap anywhere to continue
          </div>
        </div>
      )}
    </>
  );
  if (screen === "reference") return <ReferenceScreen {...nav}/>;
  if (screen === "connect")   return <CompatScreen {...nav}/>;
  if (screen === "fittings")  return <FittingsScreen {...nav}/>;

  return null;
}

const Spinner=()=>(
  <div style={{width:20,height:20,borderRadius:"50%",
    border:"2.5px solid rgba(240,235,224,.3)",borderTopColor:"var(--wht)",
    animation:"spin .7s linear infinite"}}/>
);

function ScreenHeader({title, center, right, left, topBorder=true}) {
  return(
    <div style={{flexShrink:0}}>
      {topBorder&&<div className="redtop"/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"36px 16px 10px",background:"var(--blk2)",
        borderBottom:"1px solid var(--bdr)"}}>
        {left||<div style={{minWidth:40}}/>}
        <div style={{flex:1,textAlign:"center"}}>
          {center||<span style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:26,fontWeight:900}}>{title}</span>}
        </div>
        {right||<div style={{minWidth:40}}/>}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   NAVBAR — standalone, always works, receives props directly
   This is the single source of truth for navigation.
   Every screen renders this. No closures. No prop drilling hell.
═══════════════════════════════════════════════════════════ */
function NavBar({active, navigate}) {
  // Ensure CSS always loaded when NavBar renders
  useEffect(() => {
    let el = document.getElementById("pid-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "pid-css";
      document.head.appendChild(el);
    }
    el.textContent = CSS;
  }, []);

  const tabs = [
    {id:"home",      short:"HOME"},
    {id:"connect",   short:"CONNECT"},
    {id:"fittings",  short:"FITTINGS"},
    {id:"reference", short:"REF"},
  ];

  return (
    <div style={{
      flexShrink:0,
      display:"flex",
      background:"var(--blk)",
      borderTop:"1px solid var(--bdr)",
      padding:"0 0 env(safe-area-inset-bottom,0px)",
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id}
            onClick={() => navigate(t.id)}
            aria-label={t.short}
            style={{
              flex:1,
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              justifyContent:"center",
              gap:3,
              padding:"11px 4px 10px",
              fontFamily:"'Barlow Condensed',sans-serif",
              background:"none",
              border:"none",
              cursor:"pointer",
              boxShadow: isActive ? "inset 0 2px 0 var(--cop)" : "none",
              transition:"box-shadow .1s",
            }}>
            <NavIcon id={t.id} active={isActive}/>
            <span style={{
              fontSize:15,
              fontWeight:800,
              letterSpacing:".06em",
              color: isActive ? "var(--cop)" : "var(--w40)",
              whiteSpace:"nowrap",
              textTransform:"uppercase",
            }}>{t.short}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Nav icons ─────────────────────────────────────────────── */
function NavIcon({id, active}) {
  const col = active ? "var(--cop)" : "var(--w40)";
  const s = {
    stroke:col, fill:"none", strokeWidth:"2",
    strokeLinecap:"round", strokeLinejoin:"round",
    width:22, height:22,
  };
  if(id==="home") return(
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  );
  if(id==="connect") return(
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M8 6h8M8 12h8M8 18h8"/>
      <circle cx="4" cy="6" r="1.5" fill={col} stroke="none"/>
      <circle cx="4" cy="12" r="1.5" fill={col} stroke="none"/>
      <circle cx="4" cy="18" r="1.5" fill={col} stroke="none"/>
      <path d="M20 9l-3 3 3 3"/>
    </svg>
  );
  if(id==="fittings") return(
    <svg viewBox="0 0 24 24" {...s}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  );
  if(id==="reference") return(
    <svg viewBox="0 0 24 24" {...s}>
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <path d="M3 9h18M3 15h18M9 3v18"/>
    </svg>
  );
  return(
    <svg viewBox="0 0 24 24" {...s}>
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  );
}

function ReferenceScreen({screen, navigate}) {
  const [unit,      setUnit]      = useState("in");
  const [circumVal, setCircumVal] = useState("");
  const [activeTab, setActiveTab] = useState("table");

  const circ  = parseFloat(circumVal) || 0;
  const od_raw = circ > 0 ? circ / Math.PI : 0;
  const od_mm  = unit === "in" ? od_raw * 25.4 : od_raw;
  const od_in  = unit === "in" ? od_raw : od_raw / 25.4;
  const matches = od_mm > 0 ? lookupOD(od_in) : [];
  const best    = matches[0];

  const circTable = [...OD_TABLE]
    .sort((a,b) => a.od - b.od)
    .filter((e,i,arr) => i === 0 || arr[i-1].od !== e.od)
    .map(e => ({
      ...e,
      circ_in: +(e.od * Math.PI).toFixed(3),
      circ_mm: +(e.od * 25.4 * Math.PI).toFixed(1),
    }));

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"var(--blk)"}}>
      <ScreenHeader title="Reference"/>

      <div style={{background:"var(--blk2)",borderBottom:"1px solid var(--bdr)",
        flexShrink:0,padding:"6px 10px",
        overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
        <div style={{display:"flex",gap:6,width:"max-content"}}>
          {[{id:"table",label:"📐 OD TABLE"},{id:"circ",label:"🧵 STRING"},{id:"solvent",label:"🧪 SOLVENTS"},{id:"tips",label:"💡 PRO TIPS"},{id:"danger",label:"⚠️ DANGER"}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              padding:"7px 14px",borderRadius:"6px",whiteSpace:"nowrap",minHeight:"unset",
              fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:900,fontSize:16,letterSpacing:".04em",
              cursor:"pointer",
              background:activeTab===t.id?"var(--cop)":"var(--blk3)",
              color:activeTab===t.id?"var(--blk)":"var(--w50)",
              border:"1px solid " + (activeTab===t.id?"var(--cop)":"var(--bdr2)"),
              transition:"all .12s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{flex:1,minHeight:0,padding:"12px 14px 20px"}}>

        {activeTab === "circ" && (
          <>
            {/* How-to */}
            <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
              border:"1px solid var(--bdr2)",borderLeft:"4px solid var(--yel)",
              padding:"10px 14px",marginBottom:10}}>
              <BC c="String method" s={{fontSize:16,fontWeight:900,
                display:"block",marginBottom:8,color:"var(--yel)"}}/>
              {[
                ["01","Wrap a string snugly around the pipe one full revolution"],
                ["02","Mark or pinch where the string meets itself"],
                ["03","Lay string flat — measure the length — that is the circumference"],
                ["04","Enter that measurement below"],
              ].map(([n,t])=>(
                <div key={n} style={{display:"flex",gap:10,marginBottom:6}}>
                  <Mono c={n} s={{fontSize:14,color:"var(--yel)",flexShrink:0,paddingTop:1}}/>
                  <div className="body-text">{t}</div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
              border:"1px solid var(--bdr2)",padding:"12px",marginBottom:10}}>
              <BC c="Enter circumference (string length)"
                s={{fontSize:14,fontWeight:800,color:"var(--w50)",
                  letterSpacing:".1em",textTransform:"uppercase",
                  display:"block",marginBottom:12}}/>
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {["in","mm"].map(u=>(
                  <button key={u} onClick={()=>setUnit(u)} style={{
                    flex:1,padding:"8px 0",borderRadius:"var(--r)",
                    background:unit===u?"var(--grn)":"var(--blk3)",
                    border:"1px solid " + (unit===u?"var(--grn)":"var(--bdr2)"),
                    color:unit===u?"#0c0c0c":"var(--w50)",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:800,fontSize:15,letterSpacing:".06em",
                    minHeight:"unset",
                  }}>{u==="in"?"INCHES":"MILLIMETERS"}</button>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input
                  type="number" inputMode="decimal"
                  placeholder={unit==="in"?"e.g. 3.534":"e.g. 89.8"}
                  value={circumVal}
                  onChange={e=>setCircumVal(e.target.value)}
                  style={{flex:1,padding:"10px 12px",borderRadius:"var(--r)",
                    background:"var(--blk3)",border:"1px solid var(--bdr2)",
                    color:"var(--wht)",fontSize:20,fontWeight:500,outline:"none",
                    fontFamily:"'JetBrains Mono',monospace"}}
                />
                <BC c={unit} s={{fontSize:16,fontWeight:800,color:"var(--w50)"}}/>
              </div>
            </div>

            {/* Result */}
            {od_mm > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
                  border:"1px solid var(--bdr2)",borderLeft:"4px solid var(--grn)",
                  padding:"16px 18px"}}>
                  <BC c="Calculated OD" s={{fontSize:14,fontWeight:800,
                    color:"var(--w50)",letterSpacing:".12em",
                    textTransform:"uppercase",display:"block",marginBottom:10}}/>
                  <div style={{display:"flex",alignItems:"flex-end",
                    justifyContent:"space-between",gap:8}}>
                    <div>
                      <BC c={od_mm.toFixed(2)} s={{fontSize:48,fontWeight:900,
                        color:"var(--wht)",letterSpacing:"-.01em",lineHeight:1}}/>
                      <BC c=" mm" s={{fontSize:24,fontWeight:700,color:"var(--w50)"}}/>
                      <Mono c={`${od_in.toFixed(4)}"`}
                        s={{fontSize:16,color:"var(--w50)",marginTop:6,display:"block"}}/>
                      <Mono c={`C ÷ π  =  ${circ} ${unit} ÷ 3.14159`}
                        s={{fontSize:14,color:"var(--w25)",marginTop:4,display:"block"}}/>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <BC c="NOMINAL" s={{fontSize:14,fontWeight:700,color:"var(--w50)",
                        letterSpacing:".1em",display:"block",marginBottom:4}}/>
                      <BC c={best?.nominal||"—"}
                        s={{fontSize:38,fontWeight:900,color:"var(--cop)",lineHeight:1}}/>
                    </div>
                  </div>
                </div>

                {matches.length > 0 && (
                  <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
                    border:"1px solid var(--bdr2)",overflow:"hidden"}}>
                    <div style={{padding:"9px 14px 5px"}}>
                      <BC c="Nearest pipe OD" s={{fontSize:14,fontWeight:800,
                        color:"var(--w50)",letterSpacing:".12em",textTransform:"uppercase"}}/>
                    </div>
                    {matches.map((m,i)=>{
                      const d = Math.abs(m.od - od_in) * 25.4;
                      const dc = d<1?"var(--grn)":d<2?"var(--yel)":"var(--redhi)";
                      return (
                        <div key={i} style={{padding:"11px 14px",
                          borderTop:"1px solid var(--bdr)",
                          background:i===0?"var(--blk3)":"var(--blk2)",
                          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div>
                            <BC c={m.nominal} s={{fontSize:26,fontWeight:900,
                              color:i===0?"var(--wht)":"var(--w50)"}}/>
                            <div style={{fontSize:15,marginTop:2,
                              color:i===0?"var(--w80)":"var(--w50)"}}>{m.material}</div>
                            <Mono c={`OD: ${m.od}" · ${(m.od*25.4).toFixed(1)}mm`}
                              s={{fontSize:15,color:"var(--w50)",marginTop:2,display:"block"}}/>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <Mono c={`Δ ${d.toFixed(1)}mm`} s={{fontSize:16,color:dc}}/>
                            <Mono c={`C = ${(m.od*Math.PI).toFixed(3)}"`}
                              s={{fontSize:14,color:"var(--w25)",display:"block",marginTop:3}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{padding:"10px 14px",borderRadius:"var(--r)",
                  background:"rgba(245,197,24,.06)",
                  border:"1px solid rgba(245,197,24,.2)"}}>
                  <BC c="Tip" s={{fontSize:15,fontWeight:800,color:"var(--yel)",
                    display:"block",marginBottom:4}}/>
                  <div style={{fontSize:15,color:"var(--w50)",lineHeight:1.6}}>
                    Pull the string snug but not stretched. Measure with a steel rule.
                    A string through a coupling recess gives true OD.
                  </div>
                </div>
              </div>
            )}

            {/* Reference chart */}
            <div style={{marginTop:20}}>
              <BC c="Circumference reference chart"
                s={{fontSize:14,fontWeight:800,color:"var(--w50)",letterSpacing:".12em",
                  textTransform:"uppercase",display:"block",marginBottom:10}}/>
              <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
                border:"1px solid var(--bdr2)",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"52px 1fr 72px 72px",
                  padding:"9px 12px",background:"var(--blk3)",
                  borderBottom:"2px solid var(--cop)"}}>
                  {["Nom.","Material","C (in)","C (mm)"].map(h=>(
                    <BC key={h} c={h} s={{fontSize:14,fontWeight:800,
                      color:"var(--w50)",letterSpacing:".07em",textTransform:"uppercase"}}/>
                  ))}
                </div>
                {circTable.map((e,i)=>(
                  <div key={i}
                    onClick={()=>{ setUnit("in"); setCircumVal(e.circ_in.toString()); }}
                    style={{display:"grid",gridTemplateColumns:"52px 1fr 72px 72px",
                      padding:"9px 12px",alignItems:"center",
                      borderTop:"1px solid var(--bdr)",cursor:"pointer",
                      background:i%2===0?"var(--blk2)":"var(--blk3)",
                      transition:"background .1s"}}>
                    <BC c={e.nominal} s={{fontSize:17,fontWeight:900}}/>
                    <div style={{fontSize:15,color:"var(--w80)",
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                      paddingRight:4}}>{e.material}</div>
                    <Mono c={`${e.circ_in}"`} s={{fontSize:15,color:"var(--yel)"}}/>
                    <Mono c={`${e.circ_mm}`} s={{fontSize:15,color:"var(--yel)"}}/>
                  </div>
                ))}
              </div>
              <div style={{fontSize:15,color:"var(--w25)",marginTop:8,textAlign:"center"}}>
                Tap any row to load into calculator
              </div>
            </div>

            {/* Quarter reference — below table, inches prominent */}
            <div style={{marginTop:12,background:"var(--blk2)",borderRadius:"var(--r)",
              border:"1px solid var(--bdr2)",borderLeft:"4px solid var(--grn)",
              padding:"12px 14px",display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:40,height:40,borderRadius:"50%",
                background:"rgba(34,197,94,.12)",border:"2px solid var(--grn)",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <BC c="25¢" s={{fontSize:15,fontWeight:900,color:"var(--grn)"}}/>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:2}}>
                  <Mono c='0.9550"' s={{fontSize:18,fontWeight:700,color:"var(--grn)"}}/>
                  <BC c="= US Quarter OD" s={{fontSize:14,fontWeight:700,color:"var(--w50)"}}/>
                  <Mono c="(24.26mm)" s={{fontSize:13,color:"var(--w25)"}}/>
                </div>
                <div className="body-muted">
                  Top-down: rest on pipe · End view: place beside cut end
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "danger" && (
          <>
            <div style={{padding:"10px 14px",borderRadius:"var(--r)",
              background:"rgba(239,68,68,.1)",border:"2px solid #ef4444",marginBottom:16}}>
              <BC c="⚠ Dangerous, Recalled & Discontinued Pipe"
                s={{fontSize:17,fontWeight:900,color:"#ef4444",display:"block",marginBottom:4}}/>
              <div style={{fontSize:15,color:"rgba(255,200,200,.8)",lineHeight:1.5}}>
                These pipe types require special handling, immediate notification, or qualified professionals only.
                Tap any entry for full details and required actions.
              </div>
            </div>
            {DANGER_DB.map((d,i)=>{
              const lvl=DANGER_LEVEL[d.level];
              return <DangerRefCard key={i} danger={d} lvl={lvl}/>;
            })}
          </>
        )}

        {activeTab === "solvent" && (
          <>
            <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
              border:"1px solid var(--bdr2)",borderLeft:"4px solid var(--redhi)",
              padding:"12px 16px",marginBottom:16}}>
              <BC c="Critical: wrong cement = failed joint" s={{fontSize:16,fontWeight:900,
                color:"var(--redhi)",display:"block",marginBottom:4}}/>
              <div style={{fontSize:16,color:"var(--w50)",lineHeight:1.5}}>
                PVC and CPVC cements are NOT interchangeable. Always verify material before applying solvent.
                Tap any pipe type below to expand full instructions.
              </div>
            </div>
            {SOLVENT_DB.map((entry,i)=>(
              <SolventCard key={i} entry={entry}/>
            ))}
          </>
        )}

        {activeTab === "tips" && (
          <ProTipsTab/>
        )}

        {activeTab === "table" && (
          <>

            <BC c="All pipe ODs — sorted by outside diameter"
              s={{fontSize:14,fontWeight:800,color:"var(--w50)",letterSpacing:".12em",
                textTransform:"uppercase",display:"block",marginBottom:10}}/>
            <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
              border:"1px solid var(--bdr2)",overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"52px 1fr 72px 64px",
                padding:"9px 14px",background:"var(--blk3)",
                borderBottom:"2px solid var(--cop)"}}>
                {[["Nom.",""],["Material",""],['OD (in)"',"var(--grn)"],["mm","var(--w50)"]].map(([h,c])=>(
                  <BC key={h} c={h} s={{fontSize:13,fontWeight:800,
                    color:c||"var(--w50)",letterSpacing:".08em",textTransform:"uppercase"}}/>
                ))}
              </div>
              {[...OD_TABLE].sort((a,b)=>b.od-a.od).map((e,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"52px 1fr 72px 64px",
                  padding:"10px 14px",alignItems:"center",borderTop:"1px solid var(--bdr)",
                  background:e.hazmat?"rgba(204,32,32,.05)":i%2===0?"var(--blk2)":"var(--blk3)"}}>
                  <BC c={e.nominal} s={{fontSize:18,fontWeight:900}}/>
                  <div>
                    <span style={{fontSize:14,
                      color:e.hazmat?"rgba(255,130,130,.9)":"var(--w80)"}}>{e.material}</span>
                    {e.hazmat && <BC c=" ⚠" s={{fontSize:14,color:"var(--redhi)"}}/>}
                  </div>
                  <div>
                    <Mono c={`${e.od}"`} s={{fontSize:15,fontWeight:700,color:"var(--grn)"}}/>
                  </div>
                  <div>
                    <Mono c={`${(e.od*25.4).toFixed(1)}`} s={{fontSize:14,color:"var(--w50)"}}/>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <NavBar active="reference" navigate={navigate}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOLVENT / CEMENT DATABASE
   Verified against manufacturer specs and UPC/IPC codes.
═══════════════════════════════════════════════════════════ */
const SOLVENT_DB = [
  {
    material: "PVC",
    color: "#c8d4e0",
    accent: "#4a9eff",
    primer: {
      required: true,
      product: "Purple Primer (IPS Weld-On P-70 or equiv.)",
      note: "Required by UPC/IPC for pressure systems. Apply to both pipe OD and fitting socket.",
      color_code: "Purple",
    },
    cement: {
      product: "PVC Solvent Cement — Low VOC (Christy's Red Hot, IPS Weld-On 711, or equiv.)",
      body: "Medium body for Sch 40 · Heavy body for Sch 80 and sizes >4\"",
      color_code: "Clear, grey, or blue",
      temp_range: "10°F to 110°F (-12°C to 43°C)",
    },
    application: [
      "Cut pipe square — deburr and bevel OD edge",
      "Wipe clean and dry — moisture weakens joint",
      "Apply primer to fitting socket, then pipe OD — keep wet",
      "Apply medium coat of cement to fitting socket",
      "Apply full coat of cement to pipe OD — second coat on pipe",
      "Insert pipe with 1/4 turn twist — bottom in socket — hold 30 sec",
      "Wipe excess cement from joint",
    ],
    set_time: "30 seconds initial set (holding time)",
    cure_time: {
      "1/2\" – 1-1/4\"":    "15 min @ 60°F+ · 2 hrs @ freezing",
      "1-1/2\" – 2\"":      "30 min @ 60°F+ · 4 hrs @ freezing",
      "2-1/2\" – 8\"":      "1 hr @ 60°F+   · 8 hrs @ freezing",
    },
    pressure_test: "Wait full cure before pressure testing",
    warnings: [
      "NEVER use PVC cement on CPVC — joint will fail",
      "Do not use on ABS — use transition cement or mechanical fitting",
      "Purple primer stains — protect surfaces and wear gloves",
    ],
    standard: "ASTM D2564 / ASTM F493",
  },
  {
    material: "CPVC",
    color: "#e8c87a",
    accent: "#e8c518",
    primer: {
      required: true,
      product: "CPVC Primer (yellow/orange — Christy's, IPS Weld-On P-70F or equiv.)",
      note: "Must use CPVC-rated primer — do NOT use standard PVC purple primer. Apply to both surfaces.",
      color_code: "Yellow or orange",
    },
    cement: {
      product: "CPVC Solvent Cement (Christy's CPVC, IPS Weld-On 724, FlowGuard Gold, or equiv.)",
      body: "Orange or yellow cement — specifically formulated for CPVC",
      color_code: "Orange or yellow",
      temp_range: "40°F to 110°F (4°C to 43°C)",
    },
    application: [
      "Cut square — deburr — bevel OD edge",
      "Dry fit first — pipe should enter fitting 1/3 to 2/3 of socket depth",
      "Apply CPVC primer to fitting socket and pipe OD — keep wet",
      "While still wet, apply CPVC cement to both surfaces",
      "Second coat of cement on pipe OD only",
      "Push pipe fully into socket with slight twist — hold 15–30 sec",
      "Remove excess — a bead at the joint face is normal and good",
    ],
    set_time: "15–30 seconds holding time",
    cure_time: {
      "1/2\" – 3/4\"":   "15 min @ 60°F+ · 1 hr @ 40°F",
      "1\" – 2\"":       "30 min @ 60°F+ · 2 hrs @ 40°F",
      "2-1/2\" – 4\"":   "1 hr @ 60°F+   · 4 hrs @ 40°F",
    },
    pressure_test: "Wait full cure — CPVC is for hot water — test at operating temp",
    warnings: [
      "NEVER use standard PVC cement on CPVC — will fail under heat/pressure",
      "CPVC is for hot and cold water — not drainage or conduit",
      "Petroleum-based products (oils, greases) degrade CPVC — keep away",
      "Do not mix brands of primer and cement without checking compatibility",
    ],
    standard: "ASTM F493",
  },
  {
    material: "ABS",
    color: "#27272a",
    accent: "#a0a0a0",
    primer: {
      required: false,
      product: "No primer required",
      note: "ABS uses one-step cement. Primer optional but can improve bond on large diameter.",
      color_code: "N/A",
    },
    cement: {
      product: "ABS Solvent Cement (IPS Weld-On 795, Christy's All-Purpose, or equiv.)",
      body: "One-step — no primer — black or clear cement",
      color_code: "Black or clear",
      temp_range: "40°F to 100°F (4°C to 38°C)",
    },
    application: [
      "Cut square — deburr — no bevel needed (but recommended)",
      "Wipe clean and dry",
      "Apply ABS cement to pipe OD — full even coat",
      "Apply medium coat to fitting socket",
      "Insert immediately — full quarter turn — push to bottom",
      "Hold 15–30 seconds",
      "Wipe excess",
    ],
    set_time: "15–30 seconds",
    cure_time: {
      "1-1/4\" – 3\"":  "5 min @ 60°F+ · 15 min @ cold",
      "3\" – 6\"":      "10 min @ 60°F+ · 30 min @ cold",
    },
    pressure_test: "2 hrs before light use · 24 hrs for full pressure test",
    warnings: [
      "Do not use PVC cement on ABS — use transition cement for ABS-to-PVC",
      "ABS is for drainage/waste/vent only — not pressure",
      "Keep cement can closed — evaporates fast",
    ],
    standard: "ASTM D2235",
  },
  {
    material: "Copper",
    color: "#cd7c32",
    accent: "#cd7c32",
    primer: {
      required: true,
      product: "Flux (paste flux — LA-CO Regular, Harris Stay-Silv, or equiv.)",
      note: "Flux cleans and protects the joint surface during heating. Apply immediately before soldering.",
      color_code: "N/A — paste",
    },
    cement: {
      product: "Lead-free solder (95/5 tin-antimony or 97/3 tin-copper for potable water)",
      body: "50/50 or 60/40 lead solder prohibited on potable water since 1986 (US)",
      color_code: "Bright silver when applied — dull when cooled",
      temp_range: "Heat to 450–500°F (232–260°C) at joint",
    },
    application: [
      "Cut square — deburr inside and outside",
      "Sand or emery cloth the OD of pipe and ID of fitting — shiny copper",
      "Apply flux to both surfaces immediately — do not touch after",
      "Assemble fitting — ensure pipe bottoms in socket",
      "Heat fitting body (not pipe) — move flame to heat evenly",
      "Touch solder to joint — when it flows in by capillary action, the temp is right",
      "Feed solder around full circumference — fill the joint",
      "Remove flame — let cool undisturbed — wipe with damp cloth while still warm",
    ],
    set_time: "Cool 5 min before handling",
    cure_time: {
      "All sizes": "30 min before pressure — 1 hr for hot water systems",
    },
    pressure_test: "Allow full cool before pressure — 1 hr minimum",
    warnings: [
      "Lead-free solder only on potable water — federal law since 1986",
      "Do not overheat — copper oxidizes — flux burns off — joint fails",
      "Keep joint still while cooling — movement causes cold joint",
      "De-energize nearby wiring — copper is an excellent heat conductor",
      "Always torch in a direction away from combustibles",
    ],
    standard: "ASTM B32 (solder) / ASTM B813 (flux)",
  },
  {
    material: "PEX",
    color: "#e07040",
    accent: "#e07040",
    primer: {
      required: false,
      product: "No solvent/primer — mechanical connections only",
      note: "PEX cannot be solvent welded. Use crimp, clamp, or expansion fittings.",
      color_code: "N/A",
    },
    cement: {
      product: "Crimp rings (copper) · Clamp rings (stainless) · Expansion fittings (PEX-A only)",
      body: "Match fitting system to PEX type — PEX-A uses expansion, PEX-B/C uses crimp or clamp",
      color_code: "N/A",
      temp_range: "Install above 32°F (0°C) — pipe becomes brittle when frozen",
    },
    application: [
      "Cut PEX square with PEX cutter — not a hacksaw",
      "Slide ring/clip onto pipe before inserting fitting",
      "Insert fitting fully — brass barbs must be fully seated",
      "Position ring 1/8\" from pipe end",
      "Crimp with go/no-go gauge tool — ring must be perpendicular",
      "Check with go/no-go gauge after every crimp",
      "For expansion (PEX-A): expand pipe, insert fitting, allow 20 min to recover",
    ],
    set_time: "Immediate — mechanical connection",
    cure_time: {
      "Crimp / clamp":  "Immediate use after correct crimp",
      "Expansion (PEX-A)": "20 min recovery time at 60°F+ before pressure",
    },
    pressure_test: "Test at system pressure — inspect all connections",
    warnings: [
      "Do not use PEX in exterior or UV-exposed applications — degrades in sunlight",
      "Minimum bend radius: 8× pipe OD — use bend supports",
      "Do not connect PEX directly to water heater — 18\" min of copper or CPVC",
      "Check local codes — some jurisdictions restrict PEX in certain applications",
    ],
    standard: "ASTM F876 / F877 (PEX tube) · ASTM F1807 (crimp) · ASTM F2159 (clamp)",
  },
  {
    material: "SDR 35 Sewer Pipe",
    color: "#4a7c59",
    accent: "#22c55e",
    primer: {
      required: true,
      product: "Purple PVC Primer (IPS Weld-On P-70 or equiv.) — solvent weld joints only",
      note: "Primer required for solvent weld joints. Gasketed (push-on) joints require NO cement or primer — rubber gasket only.",
      color_code: "Purple — solvent weld only. Gasketed needs nothing.",
    },
    cement: {
      product: "Heavy-body PVC Solvent Cement (SDR 35 requires heavy-body — NOT medium body)",
      body: "HEAVY body cement required — thin-wall SDR 35 pipe needs more gap-filling. Christy's Red Hot, IPS Weld-On 705, or equiv.",
      color_code: "Clear or grey — heavy body only",
      temp_range: "40°F to 110°F (4°C to 43°C)",
    },
    application: [
      "GASKETED JOINTS (most common in 4\"+): No cement needed — push spigot into bell until mark",
      "Lubricate gasket and spigot with approved pipe lubricant — NOT petroleum grease",
      "Push pipe straight in — do NOT rock side to side — seat to insertion mark",
      "Verify gasket is not rolled or displaced after assembly",
      "SOLVENT WELD JOINTS: Cut square — deburr — bevel OD edge",
      "Apply purple primer to fitting socket and pipe OD — keep wet",
      "Apply HEAVY BODY cement — full coat to socket, double coat to pipe OD",
      "Insert with 1/4 turn twist — hold 30 seconds — wipe excess",
    ],
    set_time: "30 seconds holding time (solvent weld). Gasketed: immediate.",
    cure_time: {
      "Solvent weld 4\"–6\"": "30 min @ 60°F+ before backfill · 2 hrs before pressure test",
      "Solvent weld 8\"+":     "1 hr @ 60°F+ before backfill",
      "Gasketed all sizes":   "Immediate — no cure required",
    },
    pressure_test: "SDR 35 is GRAVITY sewer only — non-pressure. Exfiltration test max 4 PSI.",
    warnings: [
      "DO NOT use medium-body cement on SDR 35 — insufficient gap-filling for thin wall",
      "DO NOT pressure test above 4 PSI — this is non-pressure gravity sewer pipe",
      "DO NOT use SDR 35 for water supply, hot water, or pressure applications",
      "Gasketed joints: use only approved pipe lube — petroleum grease degrades rubber gasket",
      "Misaligned gasketed joint causes leaks — ensure pipe is straight before shoving home",
      "DO NOT disturb gasketed joint for 30 minutes after assembly — gasket needs to seat",
    ],
    standard: "ASTM D3034 (pipe) · ASTM D3212 (joints) · ASTM F477 (gaskets)",
  },
  {
    material: "Galvanized Steel",
    color: "#9aa8a0",
    accent: "#9aa8a0",
    primer: {
      required: false,
      product: "Thread sealant (not solvent) — Teflon tape or pipe dope",
      note: "Galvanized uses threaded mechanical connections. Apply sealant to male threads only.",
      color_code: "White tape or grey/white paste",
    },
    cement: {
      product: "PTFE tape (Teflon) or thread compound (pipe dope — Rectorseal, LA-CO, or equiv.)",
      body: "2–3 wraps Teflon tape clockwise on male threads — or brush-on pipe dope",
      color_code: "White tape · grey or white paste",
      temp_range: "Standard: 250°F (121°C) · High-temp dope for steam",
    },
    application: [
      "Clean threads — wire brush if corroded",
      "Apply 2–3 wraps PTFE tape clockwise on male threads only",
      "Or apply pipe dope with brush to male threads — full coverage",
      "Hand tighten first — then 2–3 turns with pipe wrench",
      "Use two wrenches — one on fitting, one on pipe to avoid twisting pipe",
      "Do not over-tighten — cracks cast fittings and damages threads",
    ],
    set_time: "Immediate — mechanical",
    cure_time: {"All sizes": "Immediate — pressure test after assembly"},
    pressure_test: "Pressure test immediately — inspect for weeps at all threads",
    warnings: [
      "Galvanized corrodes internally — not recommended for new potable water",
      "Do not mix with copper without dielectric union — galvanic corrosion",
      "Never use Teflon tape on flare fittings — creates leak path",
      "Check for cross-threading before applying force",
    ],
    standard: "ASTM A53 (pipe) · ASTM A197 (fittings)",
  },
];

/* ─── Solvent card component ────────────────────────────────── */
function SolventCard({entry}) {
  const [open, setOpen] = useState(false);
  const ac = entry.accent;

  return (
    <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
      border:"1px solid var(--bdr2)",borderLeft:`4px solid ${ac}`,
      overflow:"hidden",marginBottom:10}}>

      {/* Header — tap to expand */}
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",padding:"14px 16px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"none",textAlign:"left",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:14,height:14,borderRadius:"50%",
            background:entry.color,border:`2px solid ${ac}`,flexShrink:0}}/>
          <BC c={entry.material} s={{fontSize:20,fontWeight:900,color:"var(--wht)"}}/>
          <Mono c={entry.primer.required?"PRIMER REQ.":"NO PRIMER"}
            s={{fontSize:14,padding:"2px 7px",borderRadius:2,
              background:entry.primer.required?"rgba(245,197,24,.15)":"rgba(34,197,94,.12)",
              color:entry.primer.required?"var(--yel)":"var(--grn)",
              border:`1px solid ${entry.primer.required?"rgba(245,197,24,.3)":"rgba(34,197,94,.25)"}`}}/>
        </div>
        <BC c={open?"▲":"▼"} s={{fontSize:15,color:"var(--w50)"}}/>
      </button>

      {/* Summary row — always visible */}
      <div style={{padding:"0 16px 12px",display:"flex",gap:8,flexWrap:"wrap"}}>
        <Mono c={entry.cement.product.split("(")[0].trim()}
          s={{fontSize:15,color:"var(--w50)",lineHeight:1.4}}/>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{borderTop:"1px solid var(--bdr)",padding:"14px 16px",
          display:"flex",flexDirection:"column",gap:14}}>

          {/* Primer */}
          <div>
            <BC c="Primer / Surface prep"
              s={{fontSize:14,fontWeight:800,color:ac,letterSpacing:".1em",
                textTransform:"uppercase",display:"block",marginBottom:8}}/>
            <div style={{background:"var(--blk3)",borderRadius:"var(--r)",
              padding:"10px 12px"}}>
              <div style={{fontSize:16,fontWeight:600,color:"var(--wht)",marginBottom:4}}>
                {entry.primer.product}
              </div>
              <div className="body-muted">
                {entry.primer.note}
              </div>
              {entry.primer.color_code!=="N/A"&&(
                <div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:6}}>
                  <BC c="COLOR:" s={{fontSize:14,fontWeight:800,color:"var(--w25)",letterSpacing:".08em"}}/>
                  <BC c={entry.primer.color_code} s={{fontSize:15,fontWeight:700,color:ac}}/>
                </div>
              )}
            </div>
          </div>

          {/* Cement / joining method */}
          <div>
            <BC c="Cement / Joining method"
              s={{fontSize:14,fontWeight:800,color:ac,letterSpacing:".1em",
                textTransform:"uppercase",display:"block",marginBottom:8}}/>
            <div style={{background:"var(--blk3)",borderRadius:"var(--r)",
              padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
              <div style={{fontSize:16,fontWeight:600,color:"var(--wht)"}}>
                {entry.cement.product}
              </div>
              <div style={{fontSize:15,color:"var(--w50)"}}>{entry.cement.body}</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:2}}>
                {entry.cement.color_code!=="N/A"&&(
                  <div>
                    <BC c="COLOR: " s={{fontSize:14,fontWeight:800,color:"var(--w25)",letterSpacing:".06em"}}/>
                    <BC c={entry.cement.color_code} s={{fontSize:15,fontWeight:700,color:ac}}/>
                  </div>
                )}
                <div>
                  <BC c="TEMP: " s={{fontSize:14,fontWeight:800,color:"var(--w25)",letterSpacing:".06em"}}/>
                  <Mono c={entry.cement.temp_range} s={{fontSize:14,color:"var(--w50)"}}/>
                </div>
              </div>
            </div>
          </div>

          {/* Application steps */}
          <div>
            <BC c="Application steps"
              s={{fontSize:14,fontWeight:800,color:ac,letterSpacing:".1em",
                textTransform:"uppercase",display:"block",marginBottom:8}}/>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {entry.application.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",
                  background:"var(--blk3)",borderRadius:"var(--r)",padding:"8px 10px"}}>
                  <BC c={String(i+1).padStart(2,"0")}
                    s={{fontSize:15,fontWeight:900,color:ac,flexShrink:0,paddingTop:1}}/>
                  <div className="body-text">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Set + cure times */}
          <div>
            <BC c="Set & Cure time"
              s={{fontSize:14,fontWeight:800,color:ac,letterSpacing:".1em",
                textTransform:"uppercase",display:"block",marginBottom:8}}/>
            <div style={{background:"var(--blk3)",borderRadius:"var(--r)",
              padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                <BC c="Initial set:" s={{fontSize:14,fontWeight:800,color:"var(--w25)",
                  letterSpacing:".06em",whiteSpace:"nowrap"}}/>
                <Mono c={entry.set_time} s={{fontSize:15,color:"var(--yel)"}}/>
              </div>
              {Object.entries(entry.cure_time).map(([size,time])=>(
                <div key={size} style={{display:"flex",gap:8,alignItems:"baseline",
                  flexWrap:"wrap"}}>
                  <Mono c={size} s={{fontSize:14,color:ac,flexShrink:0}}/>
                  <Mono c={"→ "+time} s={{fontSize:15,color:"var(--w50)"}}/>
                </div>
              ))}
              <div style={{fontSize:15,color:"rgba(245,197,24,.8)",marginTop:4,
                borderTop:"1px solid var(--bdr)",paddingTop:6}}>
                {entry.pressure_test}
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div>
            <BC c="Warnings & Notes"
              s={{fontSize:14,fontWeight:800,color:"var(--redhi)",letterSpacing:".1em",
                textTransform:"uppercase",display:"block",marginBottom:8}}/>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {entry.warnings.map((w,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",
                  background:"rgba(204,32,32,.08)",borderRadius:"var(--r)",
                  border:"1px solid rgba(204,32,32,.2)",padding:"8px 10px"}}>
                  <BC c="⚠" s={{fontSize:15,flexShrink:0,color:"var(--redhi)"}}/>
                  <div style={{fontSize:15,color:"rgba(255,180,180,.85)",lineHeight:1.5}}>{w}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Standard */}
          <Mono c={entry.standard}
            s={{fontSize:14,color:"var(--w25)",textAlign:"right"}}/>
        </div>
      )}
    </div>
  );
}

/* ─── DangerRefCard — for reference screen ───────────────────── */
function DangerRefCard({danger, lvl}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
      border:`1px solid ${lvl.border}`,borderLeft:`4px solid ${lvl.color}`,
      overflow:"hidden",marginBottom:10}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",padding:"12px 14px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"none",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22,flexShrink:0}}>{lvl.icon}</span>
          <div>
            <BC c={danger.material} s={{fontSize:18,fontWeight:900,color:"var(--wht)",display:"block"}}/>
            <div style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace",
              color:lvl.color,marginTop:2,letterSpacing:".06em",fontWeight:700}}>
              {lvl.label}
            </div>
          </div>
        </div>
        <BC c={open?"▲":"▼"} s={{fontSize:15,color:"var(--w50)",flexShrink:0}}/>
      </button>
      {open&&(
        <div style={{borderTop:`1px solid ${lvl.border}`,
          padding:"12px 14px",display:"flex",flexDirection:"column",gap:12}}>
          <div className="body-text">
            <BC c="Visual ID: " s={{fontWeight:700,color:lvl.color}}/>
            {danger.visual}
          </div>
          <div style={{padding:"10px 12px",background:"var(--blk3)",
            borderRadius:"var(--r)",border:`1px solid ${lvl.border}`}}>
            <BC c="Why dangerous" s={{fontSize:14,fontWeight:800,color:lvl.color,
              letterSpacing:".1em",textTransform:"uppercase",display:"block",marginBottom:5}}/>
            <div className="body-text">{danger.why_dangerous}</div>
          </div>
          {danger.emergency&&(
            <div style={{padding:"10px 12px",background:"rgba(239,68,68,.12)",
              borderRadius:"var(--r)",border:"1px solid rgba(239,68,68,.4)"}}>
              <BC c={danger.emergency} s={{fontSize:16,fontWeight:900,color:"#ef4444"}}/>
            </div>
          )}
          <div>
            <BC c="Required actions" s={{fontSize:14,fontWeight:800,color:lvl.color,
              letterSpacing:".1em",textTransform:"uppercase",display:"block",marginBottom:6}}/>
            {danger.action.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",
                background:"var(--blk3)",borderRadius:"var(--r)",
                marginBottom:4,alignItems:"flex-start"}}>
                <BC c={String(i+1).padStart(2,"0")}
                  s={{fontSize:14,fontWeight:900,color:lvl.color,flexShrink:0,paddingTop:1}}/>
                <div className="body-text">{a}</div>
              </div>
            ))}
          </div>
          {danger.notify&&(
            <div style={{padding:"8px 12px",borderRadius:"var(--r)",
              background:"rgba(245,158,11,.08)",
              border:"1px solid rgba(245,158,11,.3)"}}>
              <BC c="Notify: " s={{fontSize:15,fontWeight:800,color:"var(--yel)"}}/>
              <span style={{fontSize:15,color:"rgba(255,220,100,.8)"}}>{danger.notify}</span>
            </div>
          )}
          <div style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace",
            color:"var(--w25)",textAlign:"right"}}>{danger.id_tips}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRO TIPS DATABASE
   Trade knowledge most people don't know.
═══════════════════════════════════════════════════════════ */
const PRO_TIPS = [

  /* ── PIPE SIZING ── */
  {
    cat:"sizing", catLabel:"Pipe Sizing",
    title:"Plumbing is sized by ID, not OD — and the ID is fictional",
    short:"Nominal pipe size has nothing to do with any measurement on the pipe.",
    body:`When someone says "¾ inch copper pipe" they mean nominal ¾". The actual outside diameter of ¾" copper is 0.875" — not ¾". The inside diameter is roughly 0.785" — also not ¾". The "¾ inch" is a historical label that traces back to 19th century iron pipe standards and has stuck ever since.

Every pipe material has a different OD at the same nominal size. That's why ¾" copper and ¾" CPVC use the same fittings (both have 0.875" OD), but ¾" PVC does not (PVC ¾" OD is 1.050"). Always verify before buying fittings.

The rule: nominal size ≈ approximate ID for iron/steel pipe. For copper, PVC, CPVC and others it's a legacy label with no direct measurement relationship.`,
    example:"¾\" copper OD = 0.875\" · ¾\" PVC OD = 1.050\" · Same nominal, completely different fittings.",
  },
  {
    cat:"sizing", catLabel:"Pipe Sizing",
    title:"Why copper and CPVC use the same fittings — but PVC doesn't",
    short:"Copper OD and CPVC OD match at every nominal size. PVC OD is larger.",
    body:`Copper pipe OD and CPVC pipe OD are identical at every nominal size. This is intentional — CPVC was designed to retrofit into copper systems using the same fittings. A CPVC fitting will accept copper pipe and vice versa for solvent or sweat connections.

PVC uses Iron Pipe Size (IPS) OD, which is larger. A ½" PVC pipe has OD of 0.840" — the same as ½" galvanized steel. A ½" copper pipe OD is 0.625". They are not interchangeable.

This matters when transitioning between materials. Copper to CPVC can be a direct connection with the right fitting. Copper to PVC requires a transition fitting sized to account for the OD difference.`,
    example:"½\" copper OD = 0.625\" = ½\" CPVC OD. ½\" PVC OD = 0.840\" (same as ½\" galvanized iron).",
  },
  {
    cat:"sizing", catLabel:"Pipe Sizing",
    title:"Schedule vs Type — two different grading systems",
    short:"Plastic pipe uses Schedule. Copper uses Type. Both describe wall thickness.",
    body:`Plastic pipe (PVC, CPVC, ABS) uses Schedule numbers — Schedule 40 is standard residential, Schedule 80 has thicker walls for higher pressure, Schedule 120 is industrial. Higher schedule = thicker wall = smaller ID at the same nominal size and OD.

Copper uses Type designations — Type K (thickest), Type L (standard residential), Type M (thin wall), DWV (drain only, thinnest). The OD is identical for all types at each nominal size. Only the wall thickness and therefore the ID changes.

Key implication: if you replace Schedule 40 with Schedule 80 the fitting still fits (same OD), but the flow capacity is reduced because the ID is smaller. Always match schedule to application.`,
    example:"¾\" Sch 40 PVC ID = 0.824\" · ¾\" Sch 80 PVC ID = 0.742\" · Same OD, same fittings, different flow.",
  },
  {
    cat:"sizing", catLabel:"Pipe Sizing",
    title:"Pipe vs tube — there is a difference",
    short:"Pipe is sized by nominal ID. Tube is sized by actual OD. Completely different systems.",
    body:`Plumbers use pipe (nominal ID sizing). HVAC and refrigeration use tube (actual OD sizing). This causes confusion when crossing trades.

½" copper water pipe OD = 0.625". ½" ACR (air conditioning refrigerant) copper tube OD = 0.500" — that's the actual half inch. They look identical, are made of the same material, but will not connect to the same fittings.

ACR tubing is also sold in a dehydrated, sealed condition to prevent contamination. Never use plumbing copper for refrigerant lines — the residual drawing lubricants inside will contaminate the refrigerant system.`,
    example:"½\" water pipe (type L): OD 0.625\". ½\" ACR tube: OD 0.500\". Both look like copper. Different fittings.",
  },

  /* ── READING FITTINGS ── */
  {
    cat:"fittings", catLabel:"Reading Fittings",
    title:"How to read a tee: run × run × branch — always",
    short:"A tee is never read left to right. It's always the straight run first, then the branch.",
    body:`A tee has three connections: two that form the straight run-through and one that exits at 90°. The correct way to call out a tee is: run size × run size × branch size.

A 2×2×1½ tee: the straight run is 2" on both sides, the branch is 1½". This is also called a reducing tee. If all three outlets are the same size it's just called a "2 inch tee" — the full callout would be 2×2×2 but no one writes it that way.

When you see a tee called out as 2×1½, that's shorthand for a 2×2×1½ — both run ends are assumed to be the same size unless stated otherwise.

Never order a tee by describing it spatially (left, right, top). Always use the run × branch convention. If the branch is on the left in your sketch and the run is on the right, it's still called by run first.`,
    example:"2×2×1½ tee = 2\" straight run, 1½\" side outlet. 1½×1½×¾ = 1½\" run, ¾\" branch.",
  },
  {
    cat:"fittings", catLabel:"Reading Fittings",
    title:"Reducers, bushings, and couplings — large × small always",
    short:"A reducer is always called large end first. A bushing is male × female.",
    body:`A reducer coupling connects two different sizes of pipe. It is always called large × small regardless of which end faces which direction in the installation. A 2×1½ reducer is a 2 inch end and a 1½ inch end — always, no matter the orientation.

A bushing is a short fitting that changes size inside a fitting socket. It is called male size × female size. The male (outside threaded or plain) end goes into the larger fitting. The female (inside) end receives the smaller pipe. A 2×1½ bushing fits inside a 2" socket and accepts 1½" pipe.

A coupling connects two pipes of the same size end to end. A reducing coupling connects two different sizes — same as a reducer but shorter and typically used for direct pipe-to-pipe transitions.

Street fittings: a street elbow or street tee has one male (spigot) end that inserts directly into another fitting's socket — eliminates the need for a nipple. Adds about ⅜" to the face-to-face dimension.`,
    example:"2×1½ reducer = 2\" socket, 1½\" socket. 2×1½ bushing = fits 2\" fitting, accepts 1½\" pipe.",
  },
  {
    cat:"fittings", catLabel:"Reading Fittings",
    title:"Elbow degrees — 90, 45, 22½, and long radius",
    short:"A standard elbow and a long-radius elbow look similar but have very different pressure drop.",
    body:`A standard 90° elbow (short radius) has a centerline radius equal to 1× the pipe diameter. A long-radius 90° elbow has a centerline radius of 1.5× the pipe diameter. Long radius elbows have significantly lower pressure drop and are required in drain lines where solids need to pass cleanly.

45° elbows are used to change direction without the full 90° turn. Two 45s can replace a 90 with lower pressure drop and more flexibility in routing.

22½° elbows are used for precise angle changes — common in DWV offsets and fire sprinkler layouts.

In DWV (drain, waste, vent) plumbing you'll see "⅛ bend" (45°), "¼ bend" (90°), "⅙ bend" (60°), and "⅛ bend" (45°). These fraction names refer to the fraction of a full circle.

A sweep fitting has a long, gradual curve. Always use sweeps in drain lines carrying solids — standard elbows can cause clogs.`,
    example:"Long radius 90: use on drain lines. Short radius 90: OK for supply lines only. 45+45 = smoother than one 90.",
  },
  {
    cat:"fittings", catLabel:"Reading Fittings",
    title:"Wye vs sanitary tee — never swap them in DWV",
    short:"A sanitary tee is for vertical-to-horizontal branch only. A wye is for horizontal-to-horizontal.",
    body:`In drain, waste, and vent (DWV) plumbing, fitting selection is not optional — it's code.

A sanitary tee (or sanitary fitting) has a gentle sweep entry. It is only approved for vertical pipe receiving a horizontal branch — for example, a vertical stack receiving a horizontal drain. It cannot be used for two horizontal pipes because it causes turbulence and backflow.

A wye (Y fitting) has a 45° branch angle. Use wyes for horizontal-to-horizontal connections and for cleanout access. A wye + ⅛ bend combination is equivalent to a sanitary tee but can be used in either orientation.

Using a sanitary tee on a horizontal run is a code violation and causes slow drains, gurgling, and eventual backup.

A combination wye is a wye with a ⅛ bend factory-assembled — very common in residential DWV. It creates a smooth, code-compliant direction change from horizontal to horizontal.`,
    example:"Vertical stack receiving horizontal drain = sanitary tee. Two horizontal drains meeting = wye. Never swap.",
  },
  {
    cat:"fittings", catLabel:"Reading Fittings",
    title:"How to read threaded fittings — NPT vs NPS",
    short:"NPT threads taper and seal on the thread. NPS is straight and needs a gasket.",
    body:`NPT (National Pipe Taper) is the standard for most plumbing threaded connections. The threads are tapered — they tighten as you thread them in, creating a mechanical seal. Teflon tape or pipe dope fills the microscopic gaps.

NPS (National Pipe Straight) has parallel threads and requires a gasket or o-ring to seal — it cannot be sealed with tape alone. Garden hose threads (GHT) are also straight. Never use NPT tape on NPS/GHT and expect a seal.

Thread count is called TPI (threads per inch). ½" NPT = 14 TPI. ¾" NPT = 14 TPI. 1" NPT = 11.5 TPI. Mismatched TPI threads will cross-thread.

To confirm NPT: the thread diameter at the small end should be noticeably smaller than at the large end when you look along the fitting. NPS threads look the same diameter throughout.`,
    example:"NPT = tapered = seal with tape or dope. NPS/GHT = straight = needs gasket. Never mix them.",
  },

  /* ── GRADES & SCHEDULES ── */
  {
    cat:"grades", catLabel:"Grades & Schedules",
    title:"Copper Type K, L, M — wall thickness and when to use each",
    short:"Type L is the standard. Type M is thin-wall for low pressure only. Type K is for burial.",
    body:`All copper types have the same OD and use the same fittings. The difference is wall thickness.

Type K: thickest wall. Used for underground burial, high-pressure commercial, and where long service life with potential soil corrosion is a concern. Often required by code for underground water service lines.

Type L: standard for residential and commercial above-ground water supply. The correct default choice for most plumbing work. Red printing on the pipe.

Type M: thinnest wall. Only for low-pressure applications — radiant heat systems and some residential supply where allowed by local code. Many jurisdictions do not allow Type M for water supply. Blue printing.

DWV: drain, waste, vent only. Very thin wall. Not for pressure. Yellow printing.

Memory trick: K = Kursed thick (underground), L = Legit standard, M = Minimum (last resort), DWV = Drain only.`,
    example:"Underground water service: always Type K. Residential supply: Type L. Radiant heat returns (low pressure only): Type M.",
  },
  {
    cat:"grades", catLabel:"Grades & Schedules",
    title:"PVC Schedule 40 vs 80 vs SDR — what the numbers mean",
    short:"Schedule describes wall thickness. SDR (Standard Dimension Ratio) is a wall-to-OD ratio.",
    body:`Schedule 40 PVC has a wall thickness defined by a fixed schedule — the wall gets proportionally thicker as pipe gets larger. It's the standard for residential and light commercial drain, waste, vent, and irrigation.

Schedule 80 PVC has a thicker wall, higher pressure rating, and grey color. Required for exposed applications in industrial settings and where pipe may be subject to impact. More expensive and heavier.

SDR (Standard Dimension Ratio) is a different system used for larger pressure pipe. SDR 35 is the standard for sewer laterals — the wall thickness is 1/35th of the OD. SDR 26 is thicker and used for higher-pressure applications. Lower SDR number = thicker wall = higher pressure rating.

CPVC uses both systems: Schedule 40 and 80 for small diameter, SDR 11 for ½" to 2" residential hot water supply (this is the most common CPVC used in homes).`,
    example:"Drain pipe: PVC Sch 40. Exposed industrial: PVC Sch 80 (grey). Sewer lateral: PVC SDR 35. Residential hot water: CPVC SDR 11.",
  },
  {
    cat:"grades", catLabel:"Grades & Schedules",
    title:"PEX-A vs PEX-B vs PEX-C — they are NOT the same",
    short:"The letter describes the manufacturing method and determines which fittings you can use.",
    body:`PEX-A (Engel method): highest flexibility, best freeze resistance, lowest memory — it returns to its original shape after bending. This is the only type that can use expansion fittings (the fitting goes inside the pipe after expansion — strongest joint, full-bore flow). Wirsbo/Uponor is the main brand.

PEX-B (Silane method): stiffer than A, less freeze-tolerant, but UV resistant for a short period of UV exposure — more common and less expensive. Uses crimp or clamp fittings only.

PEX-C (Electron beam): least flexible, most susceptible to cracking at low temperatures. Rarely specified for new work.

The fitting systems are NOT interchangeable between types. An expansion tool and fittings for PEX-A will not work on PEX-B. Crimp fittings for PEX-B will work on PEX-C but are not approved for PEX-A expansion connections.

When matching repairs: always identify PEX type before buying fittings.`,
    example:"PEX-A + expansion tool = cleanest install. PEX-B + crimp/clamp = most common. Never use expansion fittings on PEX-B.",
  },

  /* ── SOLVENT TRICKS ── */
  {
    cat:"solvent", catLabel:"Solvent & Joining Tricks",
    title:"The wipe — why and when to wipe a fresh solvent joint",
    short:"Wiping a wet PVC joint removes the excess solvent that causes long-term weakness.",
    body:`After pushing a PVC or CPVC joint together, there should be a small bead of cement at the joint face. That bead is good — it means full coverage. But excess cement puddled on the pipe or dripping into the fitting creates a problem.

Puddled cement continues to dissolve the pipe material after the joint is assembled. This can thin the pipe wall immediately behind the fitting socket, creating a weak point that may fail under pressure months or years later.

Wipe the excess from the outside with a clean rag immediately after assembly — while the cement is still wet. Don't disturb the joint (hold it still), just wipe the bead around the outside.

Never wipe the inside of the fitting — you can't reach it and trying will disturb the joint.

Also: too much cement is better than too little. A dry joint (insufficient cement) fails immediately or under first pressure test. An over-cemented joint can be corrected with a wipe. An under-cemented joint cannot be fixed after assembly.`,
    example:"See a drip of cement below the fitting? Wipe it immediately. A bead at the socket face = good. A drip running down = bad.",
  },
  {
    cat:"solvent", catLabel:"Solvent & Joining Tricks",
    title:"Cold weather cementing — below 40°F everything changes",
    short:"Below 40°F solvent cement doesn't cure properly. Here's how to work in the cold.",
    body:`Solvent cement works by chemically softening both pipe surfaces so they fuse together. Below 40°F the solvent evaporates too slowly, the cement gels before the joint is made, and the chemical bond is incomplete.

Warm the pipe and fitting to above 50°F before cementing — a heat gun on low, or bring parts inside. Don't overheat — above 140°F the pipe distorts.

Use a cement rated for cold weather or wet conditions — these have different solvent blends that remain workable at lower temperatures. Christy's Red Hot Blue Glue is a well-known example.

Extend your assembly time — in cold weather you have more time before the cement gels, but don't rely on this. Work quickly and decisively.

Double-check cure times — a joint that cures in 15 minutes at 70°F may need 2 hours at 35°F. Never pressure test too soon in cold weather.`,
    example:"Working below 40°F: warm the parts, use cold-weather cement, double the cure time before pressure testing.",
  },
  {
    cat:"solvent", catLabel:"Solvent & Joining Tricks",
    title:"The dry fit — always test before you cement",
    short:"Dry fit every joint before applying primer or cement. You only get one shot.",
    body:`Before applying any primer or cement, assemble the entire run dry. Pipe should enter the fitting socket 1/3 to 2/3 of the full socket depth. If it slides in with no resistance and bottoms out completely — the joint is too loose and the pipe or fitting is out of tolerance. Return them.

Mark the pipe and fitting with a pencil line across the joint so you know exactly how far to push during final assembly and can verify the pipe didn't back out.

Dry fitting also reveals routing problems before they're permanent. There's no unmaking a cemented joint.

One more thing: deburr and bevel every cut end. A sharp pipe end shaves cement off the fitting socket as it's inserted, creating a dry streak that fails. A 15-second bevel with sandpaper or a deburring tool is mandatory, not optional.`,
    example:"Pencil mark across the joint before cementing. After assembly, mark should be visible and offset by the socket depth — confirming full seating.",
  },
  {
    cat:"solvent", catLabel:"Solvent & Joining Tricks",
    title:"Copper solder — why the fitting heats, not the pipe",
    short:"Heat the fitting body. Touch solder to the joint — not the flame. Capillary action does the work.",
    body:`The most common soldering mistake is heating the pipe directly and applying solder where the flame is pointing. This creates a cold joint on the far side of the fitting where the heat didn't reach.

Heat the fitting body — the copper body is thicker and holds more heat. As it heats, the pipe inside also heats by conduction. When the fitting is hot enough, touch solder to the joint gap on the OPPOSITE side from the flame. If it melts and flows in, you're at the right temperature. If it beads or won't melt, heat more.

Capillary action pulls liquid solder into the joint gap regardless of gravity. You can solder a joint upside down if the fitting is hot enough.

Signs of overheating: the flux turns black and burns off. If that happens, let it cool, clean both surfaces with emery cloth, re-flux, and try again. Never solder a joint with burnt flux — it won't bond.`,
    example:"Heat fitting, not pipe. Touch solder to joint gap — not to flame. It should flow in by itself. Black flux = overheated = start over.",
  },

  /* ── MEASURING & LAYOUT ── */
  {
    cat:"measure", catLabel:"Measuring & Layout",
    title:"Face-to-face vs center-to-center vs end-to-end",
    short:"Always know which measurement you're working with or your cut will be wrong.",
    body:`Three ways to measure a pipe run — and they give different numbers:

Face-to-face (F-F): the distance between the faces (ends) of two fittings. This is the actual pipe length you need to cut. Most precise for prefab.

Center-to-center (C-C): the distance between the centerlines of two fittings or outlets. Used for layout and rough-in dimensions (e.g., shower valve rough-in 48" from floor, 6" center to center).

End-to-end (E-E): the overall length including the pipe that inserts into the fittings. Rarely used.

To get face-to-face from center-to-center: F-F = C-C minus the socket depth of both fittings. For ½" PVC that's about ¾" per end. For 4" PVC it's about 2" per end.

Most manufacturer catalogs list the socket depth (also called "takeout" or "makeup") for every fitting. Keep a chart in your bag.`,
    example:"C-C = 24\". ½\" PVC socket depth ≈ ¾\" each end. F-F = 24\" − ¾\" − ¾\" = 22½\". That's your cut length.",
  },
  {
    cat:"measure", catLabel:"Measuring & Layout",
    title:"The story pole — the most underused plumbing tool",
    short:"A story pole is a length of wood that transfers real-world measurements without arithmetic.",
    body:`A story pole is any straight stick — a scrap of ½" conduit, a wood lath, a piece of strapping — that you use to mark real dimensions directly from the installation.

Instead of measuring the distance between two points, writing it down, and transferring it to your pipe, you hold the pole against the run and mark both ends with a pencil. Then hold the pole against your pipe and mark the cut. No arithmetic, no transcription error, no wrong number.

Story poles are especially valuable for irregular dimensions (47⅝"), angled runs, and matching multiple identical pieces. Making 10 cut-to-length pieces? Make one, check it, use it as the story pole for the other nine.

Old-school plumbers call this "templating." It's faster than measuring and eliminates the most common source of wrong cuts — misreading or miswriting a measurement.`,
    example:"Rough-in 14 matching 4\" stub-outs? Cut one perfect, use it to mark the other 13. Never measure twice.",
  },
  {
    cat:"measure", catLabel:"Measuring & Layout",
    title:"Offsets — how to calculate a rolling offset without a calculator",
    short:"A 45° offset is always 1.414× the spread. A 22½° offset is 2.613× the spread.",
    body:`An offset is when pipe needs to shift position — left/right or up/down — while still connecting two parallel points.

For a 45° offset (the most common):
Pipe length = spread × 1.414
Where spread = the perpendicular distance the pipe needs to travel.

For a 22½° offset:
Pipe length = spread × 2.613

Example: pipe needs to move 6" to the right using 45° elbows.
Pipe length = 6" × 1.414 = 8.485" ≈ 8½"

The travel (how far along the run axis the offset uses up) equals the spread for 45°. So a 6" spread offset also uses 6" of run distance.

Rolling offset (moves both directions at once): use the Pythagorean theorem to find the true spread first, then apply the multiplier.`,
    example:"Pipe needs to move 8\" sideways with two 45s: cut = 8 × 1.414 = 11.31\" ≈ 11⅜\". Travel along the run = 8\".",
  },
  {
    cat:"measure", catLabel:"Measuring & Layout",
    title:"Why inside vs outside measurements matter for copper",
    short:"When soldering copper, always measure to the center of the fitting — not the face.",
    body:`PVC and CPVC have defined socket depths in the fitting, so face-to-face math is straightforward. Copper soldering is different — there's no fixed stop, and the pipe length depends on how deep it seats in the fitting.

For copper, measure center-to-center of fittings. To convert to pipe cut length, subtract the face-to-face fitting dimension (how much of the run the fitting body occupies from centerline to socket face) for each end.

Most copper fitting dimensions are published in manufacturer charts. ¾" 90° elbow: center to face ≈ 1". So pipe cut = C-C minus 1" per end.

Alternatively, dry-assemble the fittings on the ends of a piece of pipe, hold them in position, and scribe the cut marks directly. No math required.

Quick rule of thumb: for copper, the center-to-face dimension of a standard fitting ≈ 1× the nominal pipe size. A 1" fitting = ~1" from center to face.`,
    example:"1\" copper, C-C = 18\". Center to face ≈ 1\" each end. Cut length = 18\" − 1\" − 1\" = 16\".",
  },

  /* ── INSPECTION TIPS ── */
  {
    cat:"inspect", catLabel:"Inspection Tips",
    title:"How to spot a bad solder joint without pressure testing",
    short:"A good solder joint is shiny, fully filled, and has a small bead. A bad one is dull, grey, or pitted.",
    body:`A properly made solder joint has a uniform shiny ring of solder at the socket face all the way around. The solder bead should be small and consistent — not a drip, not a blob, and not absent.

Signs of a bad joint:
- Dull grey or chalky appearance: overheated — solder oxidized, bond is weak
- Drips or icicles of solder: too much solder applied while pipe was too cold — surface joint only, no capillary penetration
- Gaps or dark spots in the ring: insufficient heat, missed coverage — will leak under pressure
- Beads of solder instead of a smooth ring: flux was gone before solder was applied
- Rough pitted surface: pipe contamination — oil, water, or dirty hands before soldering

A cold joint (solder applied to wrong temperature) looks like it's complete but the solder is only bonded to the surface, not fused with the copper. It may hold for months then fail.

Any joint that looks wrong should be cut out and redone. Attempting to re-heat and add solder to a bad joint usually makes it worse.`,
    example:"Shiny, uniform ring = good. Dull grey, drips, gaps, or rough surface = bad. Cut it out and redo.",
  },
  {
    cat:"inspect", catLabel:"Inspection Tips",
    title:"Signs of a bad solvent cement joint — before it leaks",
    short:"A well-cemented PVC joint has a uniform bead and the pipe is fully seated. Here's what bad looks like.",
    body:`Signs of a compromised solvent cement joint:

Pipe not fully seated: measure the socket depth against a fitting, then check how much of the insertion mark is still visible. If the pipe backed out even ¼" before the cement set, the joint has less bonding surface and may not hold pressure.

Bubbles or voids in the bead: air was introduced during assembly — could indicate the cement was partially set when assembled, or the pipe was rotated too much.

No bead at all: insufficient cement. The joint is probably dry in spots. Will fail.

Solvent drip runs on the pipe below the fitting: excess cement migrated into the pipe interior. Not a structural problem usually, but worth noting for potable water (solvent contains VOCs).

Fitting cocked at an angle: the pipe wasn't pushed straight. Creates stress at one point in the socket. May fail under vibration or movement.

Time since assembly matters: a joint assembled 10 minutes ago at 70°F is not cured. Never assume — know the cement type and temperature.`,
    example:"Check: is the pipe fully seated (insertion mark visible)? Is there a consistent bead? Is the fitting straight? Yes to all = probably good.",
  },
  {
    cat:"inspect", catLabel:"Inspection Tips",
    title:"How to find a leak in a system that won't hold pressure",
    short:"Systematic isolation is faster than hunting. Divide the system in half, repeat.",
    body:`When a system won't hold a pressure test, don't start crawling around looking at every joint. Isolate.

Divide the system in half using isolation valves or by capping mid-system. Test each half. The half that fails contains the leak. Divide that half in half again. Repeat until you've narrowed it to a short section.

For gas systems: use a calibrated pressure gauge and watch it for 10 minutes with all valves closed. Any drop at all is a leak. Use soap solution on every fitting — bubbles locate it exactly. Never use open flame to find a gas leak.

For water systems: if the system holds pressure with pump off but loses pressure with pump cycling — you have a waterlogged pressure tank, not a pipe leak. The bladder has failed.

For copper in a slab: listen. A pinhole leak in a slab copper line often makes a hissing or splashing sound audible by pressing your ear to the floor above the line.

After repair: always re-test the whole system — not just the repaired section.`,
    example:"System won't hold: cap half the system, test. Fails? Cap half of that. Takes 3–4 iterations to find a single leak.",
  },
  {
    cat:"inspect", catLabel:"Inspection Tips",
    title:"Reading a pressure gauge — what the numbers actually tell you",
    short:"Pressure drop rate tells you more than the initial pressure. Know what's normal.",
    body:`A standard plumbing pressure test is conducted at 1.5× the working pressure, minimum 15 minutes for residential and often 2 hours for commercial.

A gauge that drops instantly to zero: major leak, probably an open valve or disconnected pipe.

A gauge that drops slowly over the test period: small leak. Rate of drop helps estimate severity. 1 PSI drop in 15 min is a small drip. 5 PSI in 5 min is a significant leak.

A gauge that holds, then slowly drops after test pressure is released: normal behavior — thermal expansion. If water temp changed during the test, pressure changes even without a leak.

Residential water pressure should be 40–80 PSI at the meter. Above 80 PSI causes accelerated fitting wear, valve leaks, and appliance damage. A pressure reducing valve (PRV) should be set between 55–65 PSI.

Low pressure at fixtures but normal at meter: look for a failing PRV, partially closed isolation valve, or corroded galvanized lines reducing ID over time.`,
    example:"Normal residential: 55–65 PSI. Above 80 PSI: install or adjust PRV. Pressure drops 1 PSI in 15 min during test: find the drip.",
  },
];

/* Group tips by category */
const TIP_CATS = [
  { id:"sizing",   label:"Pipe Sizing",          color:"#22c55e" },
  { id:"fittings", label:"Reading Fittings",      color:"#4a9eff" },
  { id:"grades",   label:"Grades & Schedules",    color:"#f59e0b" },
  { id:"solvent",  label:"Solvent & Joining",     color:"#e8192c" },
  { id:"measure",  label:"Measuring & Layout",    color:"#a78bfa" },
  { id:"inspect",  label:"Inspection Tips",       color:"#22d3a5" },
];

function ProTipsTab() {
  const [activeCat, setActiveCat] = useState("all");
  const [openTip,   setOpenTip]   = useState(null);

  const filtered = activeCat === "all"
    ? PRO_TIPS
    : PRO_TIPS.filter(t => t.cat === activeCat);

  return (
    <div>
      {/* Intro */}
      <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
        border:"1px solid var(--bdr2)",borderLeft:"4px solid var(--yel)",
        padding:"12px 14px",marginBottom:16}}>
        <BC c="Trade knowledge most people don't know"
          s={{fontSize:16,fontWeight:900,color:"var(--yel)",display:"block",marginBottom:4}}/>
        <div className="body-muted">
          {PRO_TIPS.length} tips across {TIP_CATS.length} categories. Tap any card to expand.
        </div>
      </div>

      {/* Category filter */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        <button onClick={()=>setActiveCat("all")} style={{
          padding:"5px 11px",borderRadius:20,fontSize:14,cursor:"pointer",
          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:".06em",
          background:activeCat==="all"?"var(--wht)":"var(--blk3)",
          color:activeCat==="all"?"var(--blk)":"var(--w50)",
          border:`1px solid ${activeCat==="all"?"var(--wht)":"var(--bdr2)"}`,
        }}>ALL</button>
        {TIP_CATS.map(c=>(
          <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{
            padding:"5px 11px",borderRadius:20,fontSize:14,cursor:"pointer",
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:".06em",
            background:activeCat===c.id?c.color+"22":"var(--blk3)",
            color:activeCat===c.id?c.color:"var(--w50)",
            border:`1px solid ${activeCat===c.id?c.color+"55":"var(--bdr2)"}`,
            transition:"all .15s",
          }}>{c.label.toUpperCase()}</button>
        ))}
      </div>

      {/* Tip cards */}
      {filtered.map((tip,i)=>{
        const cat  = TIP_CATS.find(c=>c.id===tip.cat);
        const isOpen = openTip===tip.title;
        return (
          <div key={i} style={{
            background:"var(--blk2)",borderRadius:"var(--r)",
            border:"1px solid var(--bdr2)",
            borderLeft:`4px solid ${cat.color}`,
            overflow:"hidden",marginBottom:8,
          }}>
            {/* Header */}
            <button onClick={()=>setOpenTip(isOpen?null:tip.title)} style={{
              width:"100%",padding:"13px 14px",
              display:"flex",alignItems:"flex-start",justifyContent:"space-between",
              gap:12,background:"none",textAlign:"left",cursor:"pointer",
            }}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontFamily:"'JetBrains Mono',monospace",
                  color:cat.color,letterSpacing:".08em",fontWeight:700,
                  textTransform:"uppercase",marginBottom:5}}>
                  {cat.label}
                </div>
                <BC c={tip.title} s={{fontSize:17,fontWeight:800,
                  color:"var(--wht)",display:"block",lineHeight:1.3,marginBottom:4}}/>
                {!isOpen&&(
                  <div style={{fontSize:15,color:"var(--w50)",lineHeight:1.4}}>
                    {tip.short}
                  </div>
                )}
              </div>
              <BC c={isOpen?"▲":"▼"}
                s={{fontSize:15,color:"var(--w50)",flexShrink:0,paddingTop:2}}/>
            </button>

            {/* Expanded content */}
            {isOpen&&(
              <div style={{borderTop:"1px solid var(--bdr)",
                padding:"14px 14px 16px",
                display:"flex",flexDirection:"column",gap:12}}>
                {/* Body text */}
                <div style={{fontSize:16,color:"var(--w80)",lineHeight:1.7,
                  whiteSpace:"pre-wrap"}}>
                  {tip.body}
                </div>
                {/* Example callout */}
                {tip.example&&(
                  <div style={{padding:"10px 12px",borderRadius:"var(--r)",
                    background:`${cat.color}10`,
                    border:`1px solid ${cat.color}30`}}>
                    <BC c="Example / Rule of thumb"
                      s={{fontSize:14,fontWeight:800,color:cat.color,
                        letterSpacing:".1em",textTransform:"uppercase",
                        display:"block",marginBottom:5}}/>
                    <div style={{fontSize:15,color:"var(--w80)",
                      lineHeight:1.6,fontFamily:"'JetBrains Mono',monospace"}}>
                      {tip.example}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RETAILER CONFIG
   Sponsor slot: set sponsored:true + highlight to activate.
   Link templates use {q} as search query placeholder.
═══════════════════════════════════════════════════════════ */
const RETAILERS = [
  {
    id:      "standard",
    name:    "Standard Plumbing",
    short:   "Standard",
    color:   "#e8192c",
    url:     q => `https://www.standardplumbing.com/search?q=${encodeURIComponent(q)}`,
    sponsored: false,   // ← flip to true when partnership active
    sponsorLabel: "Local Supply",
  },
  {
    id:      "ferguson",
    name:    "Ferguson",
    short:   "Ferguson",
    color:   "#e87722",
    url:     q => `https://www.ferguson.com/search#q=${encodeURIComponent(q)}&t=All`,
    sponsored: false,
  },
  {
    id:      "homedepot",
    name:    "Home Depot",
    short:   "Home Depot",
    color:   "#f96302",
    url:     q => `https://www.homedepot.com/s/${encodeURIComponent(q)}`,
    sponsored: false,
  },
  {
    id:      "lowes",
    name:    "Lowe's",
    short:   "Lowe's",
    color:   "#004990",
    url:     q => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}`,
    sponsored: false,
  },
  {
    id:      "amazon",
    name:    "Amazon",
    short:   "Amazon",
    color:   "#ff9900",
    url:     q => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=industrial`,
    sponsored: false,
  },
];

/* ═══════════════════════════════════════════════════════════
   FITTING DATABASE
   Organized by material → nominal size → fitting type.
   Part numbers are from manufacturer catalogs.
   search_terms feed the retailer link generator.
═══════════════════════════════════════════════════════════ */

const FITTING_MATERIALS = [
  "Copper",
  "PVC (Schedule 40)",
  "CPVC",
  "PEX-A",
  "PEX-B",
  "ABS",
  "PVC DWV (Sch 40)",
  "Galvanized Steel",
  "Black Steel",
  "PVC (Schedule 80)",
  "SDR 35 Sewer — Solid",
  "SDR 35 Sewer — Perforated",
  "Cast Iron",
  "AC Pipe (Transite)",
  "Copper DWV",
  "CPVC (Schedule 80)",
];

const NOMINAL_SIZES = [
  '¼"', '⅜"', '½"', '¾"', '1"', '1¼"', '1½"', '2"', '2½"', '3"', '4"', '6"', '8"',
];

/* Fitting types with icons */
const FITTING_TYPES = [
  { id:"coupling",     label:"Coupling"           },
  { id:"reducer",      label:"Reducer / Bushing"  },
  { id:"elbow90",      label:"90° Elbow"          },
  { id:"elbow45",      label:"45° Elbow"          },
  { id:"elbow225",     label:"22½° Elbow"         },
  { id:"tee",          label:"Tee / Wye"          },
  { id:"cross",        label:"Cross"              },
  { id:"dblfix",       label:"Double Fixture"     },
  { id:"cap",          label:"Cap / Plug"         },
  { id:"union",        label:"Union"              },
  { id:"trap",         label:"P-Trap / J-Bend"   },
  { id:"cleanout",     label:"Cleanout"           },
  { id:"flange",       label:"Flange"             },
  { id:"saddle",       label:"Saddle / Wet Tap"   },
  { id:"street",       label:"Street Fitting"     },
  { id:"press",        label:"Press Fitting"      },
  { id:"transition",   label:"Transition"         },
  { id:"fernco",       label:"Fernco / Flex"      },
  { id:"repair",       label:"Repair / Range"     },
  { id:"slip",         label:"Slip / No-Stop"     },
  { id:"compression",  label:"Compression"        },
  { id:"telescopic",   label:"Telescopic"         },
  { id:"hose",         label:"Hose Thread"        },
];

/* Port count per fitting type — how many sizes the fitting actually has.
   Couplings 2 · tees & wyes 3 · crosses & double fixtures 4. */
const FITTING_PORTS = {
  coupling:2, reducer:2, elbow90:2, elbow45:2, elbow225:2,
  tee:3, cross:4, dblfix:4,
  cap:1, union:2, trap:2, cleanout:1, flange:1, saddle:2,
  street:2, press:2, transition:2, fernco:2,
  repair:2, slip:2, compression:2, telescopic:2, hose:2,
};

/* Labels for each port, in order */
const PORT_LABELS = {
  coupling:   ["End 1","End 2"],
  reducer:    ["Large end","Small end"],
  elbow90:    ["End 1","End 2"],
  elbow45:    ["End 1","End 2"],
  elbow225:   ["End 1","End 2"],
  tee:        ["Run A","Run B","Branch"],
  cross:      ["Run A","Run B","Branch 1","Branch 2"],
  dblfix:     ["Run A","Run B","Fixture 1","Fixture 2"],
  cap:        ["Size"],
  union:      ["End 1","End 2"],
  trap:       ["Inlet","Outlet"],
  cleanout:   ["Size"],
  flange:     ["Size"],
  saddle:     ["Main","Branch"],
  street:     ["Spigot","Socket"],
  press:      ["End 1","End 2"],
  transition: ["This pipe","Other pipe"],
  fernco:     ["End 1","End 2"],
  repair:     ["Pipe OD","Pipe OD"],
  slip:       ["End 1","End 2"],
  telescopic: ["End 1","End 2"],
  compression:["End 1","End 2"],
  hose:       ["Pipe thread","Hose thread"],
};


/* ════════════════════════════════════════════════════════════
   HOME DEPOT VERIFIED PARTS
   Every entry below was read off a live Home Depot product page.
   hd = Internet # (also the URL path) · model = HD Model #
   Anything not verified is absent — no invented numbers.
════════════════════════════════════════════════════════════ */
const HD = {
  /* Copper slip / repair couplings — NO center stop, slides over the pipe */
  "copper-repair-½\"": { hd:"100345672", model:"C601HD12",  brand:"Everbilt",
    slug:"Everbilt-1-2-in-Copper-Pressure-Slip-Coupling-Fitting-C601HD12" },
  "copper-repair-¾\"": { hd:"100346736", model:"C601HD34",  brand:"Everbilt", sku:"747386",
    slug:"Everbilt-3-4-in-Copper-Pressure-Slip-Coupling-Fitting-C601HD34" },

  /* Copper couplings WITH stop — standard, not a repair coupling */
  "copper-coupling-¼\"": { hd:"204583730", model:"C600HD14", brand:"Everbilt", sku:"550249",
    slug:"Everbilt-1-4-in-Copper-Pressure-Cup-x-Cup-Coupling-Fitting-with-Stop-C600HD14" },
  "copper-coupling-½\"": { hd:"100342365", model:"C600HD12", brand:"Everbilt",
    slug:"Everbilt-1-2-in-Copper-Pressure-Cup-x-Cup-Coupling-Fitting-with-Stop-C600HD12" },
  "copper-coupling-¾\"": { hd:"100343588", model:"C600HD34", brand:"Everbilt", sku:"187356",
    slug:"Everbilt-3-4-in-Copper-Pressure-Cup-x-Cup-Coupling-with-Stop-Fitting-C600HD34" },
  "copper-coupling-1½\"": { hd:"100345557", model:"C600HD112", brand:"Everbilt",
    slug:"Everbilt-1-1-2-in-Copper-Pressure-C-x-C-Coupling-with-Stop-C600" },

  /* Copper press repair couplings */
  "copper-pressrepair-¾\"": { hd:"203460413", model:"PC60134", brand:"Nibco",
    slug:"NIBCO-3-4-in-Copper-Press-x-Press-Pressure-Repair-Coupling-with-No-Stop-PC60134" },

  /* Charlotte Pipe cast iron no-hub — verified at Home Depot */
  "ci-santee-3\"":  { hd:"202535702", model:"NHTY3",  brand:"Charlotte Pipe",
    slug:"Charlotte-Pipe-3-in-Cast-Iron-DWV-No-Hub-Sanitary-Tee-NHTY3" },
  "ci-tapsantee-1½\"": { hd:"202534991", model:"NHTTY1", brand:"Charlotte Pipe",
    slug:"Charlotte-Pipe-1-1-2-in-Cast-Iron-DWV-No-Hub-Tapped-Sanitary-Tee-NHTTY1" },

  /* Charlotte Pipe PVC DWV — verified at Home Depot */
  "pvcdwv-combo-2\"": { hd:"203396237", model:"PVC005010800HD", brand:"Charlotte Pipe", sku:"905573",
    slug:"Charlotte-Pipe-2-in-DWV-PVC-Comb-Wye-and-1-8-Bend-Fitting-PVC005010800HD" },
  "pvcdwv-combo-3\"": { hd:"203396239", model:"PVC005011000HD", brand:"Charlotte Pipe",
    slug:"Charlotte-Pipe-3-in-x-3-in-x-3-in-DWV-PVC-Comb-Wye-and-1-8-Bend-PVC005011000HD" },

  /* NIBCO PVC DWV — verified at Home Depot. Part number encodes port sizes:
     C4811HD332 = sanitary tee 3×3×2 · 112 = 1½" */
  "nibco-pvcdwv-santee-3\"": { hd:"100342376", model:"C4811HD332", brand:"Nibco",
    slug:"NIBCO-3-in-x-3-in-x-2-in-PVC-DWV-All-Hub-Sanitary-Tee-Fitting-C4811HD332" },
  "nibco-pvcdwv-santee-2\"": { hd:"100345173", model:"C4811HD22112", brand:"Nibco",
    slug:"NIBCO-2-in-x-2-in-x-1-1-2-in-PVC-DWV-All-Hub-Sanitary-Reducing-Tee-C4811HD22112" },
  "nibco-pvcdwv-dblsantee-2\"": { hd:"100348298", model:"C4835HD2", brand:"Nibco",
    slug:"NIBCO-2-in-PVC-DWV-All-Hub-Double-Sanitary-Tee-C4835HD2" },
  "nibco-pvcdwv-dblsantee-3\"": { hd:"205799569", model:"C4835HD3322", brand:"Nibco", sku:"922719",
    slug:"NIBCO-3-in-x-3-in-x-2-in-x-2-in-PVC-DWV-All-Hub-Double-Sanitary-Tee-C4835HD3322" },

  /* NIBCO ABS DWV — verified at Home Depot */
  "nibco-absdwv-santee-2\"": { hd:"100343490", model:"C5811HD22112", brand:"Nibco",
    slug:"NIBCO-2-in-x-2-in-x-1-1-2-in-ABS-DWV-All-Hub-Sanitary-Tee-C5811HD22112" },
  "nibco-absdwv-lrtee-2\"": { hd:"100344794", model:"C5812LHD2", brand:"Nibco",
    slug:"NIBCO-2-in-ABS-DWV-All-Hub-Long-Radius-Sanitary-Tee-C5812LHD2" },
  "nibco-absdwv-dblfix-2\"": { hd:"100210106", model:"C5835BHD2", brand:"Nibco",
    slug:"NIBCO-2-in-ABS-DWV-All-Hub-Double-Fixture-Sanitary-Tee-C5835BHD2" },

  /* Dura PVC — verified */
  "dura-coupling-½\"": { hd:"100342935", model:"C429-005", brand:"Dura",
    slug:"Dura-Corp-1-2-in-Schedule-40-PVC-Coupling-C429-005" },
  "dura-coupling-1\"":  { hd:"100343722", model:"C429-010", brand:"Dura",
    slug:"DURA-1-in-Schedule-40-PVC-Coupling-Fitting-C429-010" },
  "dura-threaded-½\"": { hd:"100344953", model:"C430-005W", brand:"Dura",
    slug:"Dura-Corp-1-2-in-Schedule-40-PVC-Threaded-Coupling-C430-005W" },

  /* PVC compression coupling */
  "pvc-compression-¾\"": { hd:"206667869", model:"511-43-34-34H", brand:"Homewerks",
    slug:"Homewerks-Worldwide-3-4-in-PVC-Compression-Coupling-511-43-34-34H" },
};

const hdUrl = (e) => `https://www.homedepot.com/p/${e.slug}/${e.hd}`;

/* Build a fitting record from a verified HD entry */
function hdPart(key, type, desc, search) {
  const e = HD[key];
  if (!e) return null;
  return { type, desc, brand:e.brand, part:e.model, search,
           hdUrl:hdUrl(e), hd:e.hd, sku:e.sku, verified:true };
}


/* ════════════════════════════════════════════════════════════
   JCM UNIVERSAL CLAMP COUPLINGS — heavy duty repair / range couplings
   Part number format is JCM's own, from their catalog:
       model – pipe OD (4 digits, hundredths) – band width
       e.g. 6.90" OD cast iron, 6" band  →  101-0690-6
   OD comes straight from the app's OD table, so the number is derived,
   not guessed. Band width varies by application — confirm when ordering.
════════════════════════════════════════════════════════════ */
const JCM_MODELS = [
  { model:"101", name:"Single Band Universal Clamp Coupling",
    note:"Standard lug. Low-alloy steel band." },
  { model:"171", name:"Single Band, Removable Lug",
    note:"Removable lug for tight excavations and rockbound soil." },
  { model:"102", name:"Extended Range Multi-Band Coupling",
    note:'Built for AC and cast iron 4"–12". Extra range — best on 10" and larger.' },
  { model:"172", name:"Extended Range, Removable Lug",
    note:"Extended range with removable lug for restricted access." },
  { model:"131", name:"All Stainless Single Band",
    note:"All 304 stainless — hot soils and corrosive ground." },
  { model:"132", name:"All Stainless Extended Range",
    note:'All stainless, AC and cast iron. 6 clamps cover 4"–12".' },
  { model:"136", name:"All Stainless Heavy Duty Repair Clamp",
    note:"Heavy duty all stainless. Meets ANSI/AWWA C230." },
];

/* pipe OD → JCM 4-digit code: 6.90 → 0690 */
const jcmOD = (od) => String(Math.round(od * 100)).padStart(4, "0");

/* Look up the OD this material/size actually is */
function odFor(materialMatch, size) {
  const row = OD_TABLE.find(e =>
    e.nominal === size && e.material.toLowerCase().includes(materialMatch));
  return row ? row.od : null;
}

function jcmFittings(materialMatch, size, pipeLabel) {
  const od = odFor(materialMatch, size);
  if (!od) return [];
  const code = jcmOD(od);
  return JCM_MODELS.map(m => ({
    type:"repair",
    desc:`${size} ${pipeLabel} — JCM ${m.model} ${m.name}`,
    brand:"JCM",
    part:`${m.model}-${code}-6`,
    search:`JCM ${m.model} universal clamp coupling ${od}" OD ${pipeLabel}`,
    note:`${m.note} · Pipe OD ${od}" → code ${code}. 6" band shown — confirm width. Torque 60–85 ft-lb standard; JCM rated past 100 ft-lb on ⅝" bolts.`,
    verified:true,
  }));
}

/* ═══ TYLER PIPE cast iron — verified numbers only ═══
   Tyler uses 6-digit item numbers. Blanks show a dash and rely on the
   search link; nothing here is invented. */
const TYLER = {
  '2"': { wye:"008217" },
};

/* ═══ DURA PVC — verified part numbers only ═══
   sc  = SC29 compression coupling · frc = flexible repair coupling
   Only sizes confirmed against a live listing appear here. */
const DURA = {
  '¾"': { frc:"FRC-007" },
  '1"': { frc:"FRC-010" },
  '4"': { sc:"SC29-040" },
};

/* ═══ PASCO galvanized IPS compression couplings (verified) ═══ */
const PASCO_COMPRESSION = {
  '½"':  { part:"2908", len:'3-3/4"' },
  '¾"':  { part:"2909", len:"long"   },
  '1"':  { part:"2910", len:'4-1/4"' },
  '1¼"': { part:"2911", len:'4-3/4"' },
  '1½"': { part:"2912", len:'5"'     },
  '2"':  { part:"2913", len:'5-3/8"' },
};

/* Core fitting data — material + size → fittings */
function getFittings(material, size) {
  const m = material;
  const s = size;
  const sz = s.replace(/[^0-9]/g,"") || "4";

  /* ── COPPER ── */
  if(m === "Copper") {
    const nb = {
      '½"':  { coupling:"604-5",  elbow90:"806-5",  elbow45:"807-5",  elbow225:"877-5",  tee:"611-5",  cap:"702-5",  union:"295-5",  reducer:"6295-5" },
      '¾"':  { coupling:"604-7",  elbow90:"806-7",  elbow45:"807-7",  elbow225:"877-7",  tee:"611-7",  cap:"702-7",  union:"295-7",  reducer:"6295-7" },
      '1"':  { coupling:"604-10", elbow90:"806-10", elbow45:"807-10", elbow225:"877-10", tee:"611-10", cap:"702-10", union:"295-10", reducer:"6295-10" },
      '1¼"': { coupling:"604-12", elbow90:"806-12", elbow45:"807-12", elbow225:"877-12", tee:"611-12", cap:"702-12", union:"295-12", reducer:"6295-12" },
      '1½"': { coupling:"604-15", elbow90:"806-15", elbow45:"807-15", elbow225:"877-15", tee:"611-15", cap:"702-15", union:"295-15", reducer:"6295-15" },
      '2"':  { coupling:"604-20", elbow90:"806-20", elbow45:"807-20", elbow225:"877-20", tee:"611-20", cap:"702-20", union:"295-20", reducer:"6295-20" },
      '3"':  { coupling:"604-30", elbow90:"806-30", elbow45:"807-30", tee:"611-30", cap:"702-30", union:"295-30" },
      '4"':  { coupling:"604-40", elbow90:"806-40", elbow45:"807-40", tee:"611-40", cap:"702-40", union:"295-40" },
    };
    const sb = {
      '½"':  { coupling:"U008LF",    elbow90:"U256LF",    tee:"U260LF",    transition:"U088LF"    },
      '¾"':  { coupling:"U008LF075", elbow90:"U256LF075", tee:"U260LF075", transition:"U088LF075" },
      '1"':  { coupling:"U008LF100", elbow90:"U256LF100", tee:"U260LF100", transition:"U088LF100" },
      '1¼"': { coupling:"U008LF125", elbow90:"U256LF125", tee:"U260LF125", transition:"U088LF125" },
      '1½"': { coupling:"U008LF150", elbow90:"U256LF150", tee:"U260LF150", transition:"U088LF150" },
      '2"':  { coupling:"U008LF200", elbow90:"U256LF200", tee:"U260LF200", transition:"U088LF200" },
    };
    const r = nb[s]||{}, b = sb[s]||{};
    return [
      r.coupling  && { type:"coupling",  desc:`${s} Copper Coupling`,             brand:"Nibco",     part:r.coupling,  search:`Nibco ${s} copper coupling` },
      r.reducer   && { type:"reducer",   desc:`${s} Copper Reducer Coupling`,     brand:"Nibco",     part:r.reducer,   search:`Nibco ${s} copper reducer coupling` },
      r.elbow90   && { type:"elbow90",   desc:`${s} Copper 90° Elbow`,            brand:"Nibco",     part:r.elbow90,   search:`Nibco ${s} copper 90 elbow` },
      r.elbow45   && { type:"elbow45",   desc:`${s} Copper 45° Elbow`,            brand:"Nibco",     part:r.elbow45,   search:`Nibco ${s} copper 45 elbow` },
      r.elbow225  && { type:"elbow225",  desc:`${s} Copper 22½° Elbow`,           brand:"Nibco",     part:r.elbow225,  search:`Nibco ${s} copper 22.5 degree elbow` },
      r.tee       && { type:"tee",       desc:`${s} Copper Tee`,                  brand:"Nibco",     part:r.tee,       search:`Nibco ${s} copper tee` },
      r.cap       && { type:"cap",       desc:`${s} Copper Cap`,                  brand:"Nibco",     part:r.cap,       search:`Nibco ${s} copper cap` },
      r.union     && { type:"union",     desc:`${s} Copper Union`,                brand:"Nibco",     part:r.union,     search:`Nibco ${s} copper union` },
                     { type:"trap",      desc:`${s} Copper P-Trap`,               brand:"Eastman",   part:`60107`,     search:`${s} copper p-trap plumbing` },
                     { type:"street",    desc:`${s} Copper Street 90° Elbow`,     brand:"Nibco",     part:`812-${sz}`, search:`Nibco ${s} copper street 90 elbow` },
                     { type:"street",    desc:`${s} Copper Street 45° Elbow`,     brand:"Nibco",     part:`813-${sz}`, search:`Nibco ${s} copper street 45 elbow` },
                     { type:"press",     desc:`${s} Copper Press Coupling`,       brand:"Viega",     part:`79261-${sz}`,search:`Viega ${s} copper press coupling` },
                     { type:"press",     desc:`${s} Copper Press 90° Elbow`,      brand:"Viega",     part:`79233-${sz}`,search:`Viega ${s} copper press 90 elbow` },
                     { type:"press",     desc:`${s} Copper Press Tee`,            brand:"Viega",     part:`79271-${sz}`,search:`Viega ${s} copper press tee` },
      b.coupling  && { type:"coupling",  desc:`${s} Push-Connect Coupling`,       brand:"SharkBite", part:b.coupling,  search:`SharkBite ${s} push connect coupling` },
      b.elbow90   && { type:"elbow90",   desc:`${s} Push-Connect 90° Elbow`,      brand:"SharkBite", part:b.elbow90,   search:`SharkBite ${s} push connect 90 elbow` },
      b.tee       && { type:"tee",       desc:`${s} Push-Connect Tee`,            brand:"SharkBite", part:b.tee,       search:`SharkBite ${s} push connect tee` },
      b.transition&& { type:"transition",desc:`${s} Copper × PEX Transition`,     brand:"SharkBite", part:b.transition,search:`SharkBite ${s} copper PEX transition` },
      hdPart(`copper-repair-${s}`, "slip",
        `${s} Copper Slip Coupling (no stop)`,
        `${s} copper slip coupling no stop`),
      hdPart(`copper-coupling-${s}`, "coupling",
        `${s} Copper Coupling (with stop)`,
        `${s} copper coupling with stop`),
      hdPart(`copper-pressrepair-${s}`, "slip",
        `${s} Copper Press Slip Coupling (no stop)`,
        `${s} copper press repair coupling no stop`),
                     { type:"fernco",    desc:`${s} Fernco Flex Coupling`,        brand:"Fernco",    part:`1056-${sz}`,search:`Fernco ${s} flexible coupling` },
                     { type:"saddle",    desc:`${s} Copper Saddle Tee`,           brand:"Sioux Chief",part:`SC-${sz}`, search:`${s} copper saddle tee wet tap` },
    ].filter(Boolean);
  }

  /* ── PVC Schedule 40 ── */
  if(m === "PVC (Schedule 40)") {
    const cp = {
      '½"':  { coupling:"PVC 01100 0600", elbow90:"PVC 06101 0600", elbow45:"PVC 07101 0600", tee:"PVC 02100 0600", cap:"PVC 03101 0600" },
      '¾"':  { coupling:"PVC 01100 0750", elbow90:"PVC 06101 0750", elbow45:"PVC 07101 0750", tee:"PVC 02100 0750", cap:"PVC 03101 0750" },
      '1"':  { coupling:"PVC 01100 1000", elbow90:"PVC 06101 1000", elbow45:"PVC 07101 1000", tee:"PVC 02100 1000", cap:"PVC 03101 1000" },
      '1¼"': { coupling:"PVC 01100 1250", elbow90:"PVC 06101 1250", elbow45:"PVC 07101 1250", tee:"PVC 02100 1250", cap:"PVC 03101 1250" },
      '1½"': { coupling:"PVC 01100 1500", elbow90:"PVC 06101 1500", elbow45:"PVC 07101 1500", tee:"PVC 02100 1500", cap:"PVC 03101 1500" },
      '2"':  { coupling:"PVC 01100 2000", elbow90:"PVC 06101 2000", elbow45:"PVC 07101 2000", tee:"PVC 02100 2000", cap:"PVC 03101 2000" },
      '3"':  { coupling:"PVC 01100 3000", elbow90:"PVC 06101 3000", elbow45:"PVC 07101 3000", tee:"PVC 02100 3000", cap:"PVC 03101 3000" },
      '4"':  { coupling:"PVC 01100 4000", elbow90:"PVC 06101 4000", elbow45:"PVC 07101 4000", tee:"PVC 02100 4000", cap:"PVC 03101 4000" },
    };
    const c = cp[s]||{};
    return [
      c.coupling && { type:"coupling",  desc:`${s} PVC Sch 40 Coupling`,        brand:"Charlotte Pipe", part:c.coupling, search:`Charlotte Pipe ${s} PVC schedule 40 coupling` },
                   { type:"reducer",   desc:`${s} PVC Sch 40 Reducer Coupling`, brand:"Charlotte Pipe", part:`PVC 01101 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 reducer coupling` },
                   { type:"reducer",   desc:`${s} PVC Sch 40 Bushing`,          brand:"Charlotte Pipe", part:`PVC 02900 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 bushing reducer` },
      c.elbow90  && { type:"elbow90",   desc:`${s} PVC Sch 40 90° Elbow`,       brand:"Charlotte Pipe", part:c.elbow90,  search:`Charlotte Pipe ${s} PVC schedule 40 90 elbow` },
      c.elbow45  && { type:"elbow45",   desc:`${s} PVC Sch 40 45° Elbow`,       brand:"Charlotte Pipe", part:c.elbow45,  search:`Charlotte Pipe ${s} PVC schedule 40 45 elbow` },
                   { type:"elbow225",  desc:`${s} PVC Sch 40 22½° Elbow`,       brand:"Charlotte Pipe", part:`PVC 07201 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 22.5 degree elbow` },
      c.tee      && { type:"tee",       desc:`${s} PVC Sch 40 Tee`,             brand:"Charlotte Pipe", part:c.tee,      search:`Charlotte Pipe ${s} PVC schedule 40 tee` },
                   { type:"tee",       desc:`${s} PVC Sch 40 Wye`,              brand:"Charlotte Pipe", part:`PVC 02800 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 wye` },
                   { type:"tee",       desc:`${s} PVC Sch 40 Sanitary Tee`,     brand:"Charlotte Pipe", part:`PVC 02400 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 sanitary tee` },
      c.cap      && { type:"cap",       desc:`${s} PVC Sch 40 Cap`,             brand:"Charlotte Pipe", part:c.cap,      search:`Charlotte Pipe ${s} PVC schedule 40 cap` },
                   { type:"cap",       desc:`${s} PVC Sch 40 Plug`,             brand:"Charlotte Pipe", part:`PVC 01900 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 plug` },
                   { type:"union",     desc:`${s} PVC Sch 40 Union`,            brand:"Charlotte Pipe", part:`PVC 01700 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 union` },
                   { type:"cleanout",  desc:`${s} PVC Sch 40 Cleanout Adapter`, brand:"Charlotte Pipe", part:`PVC 01600 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 cleanout adapter` },
                   { type:"cleanout",  desc:`${s} PVC Sch 40 Cleanout Plug`,    brand:"Charlotte Pipe", part:`PVC 01601 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 cleanout plug` },
                   { type:"trap",      desc:`${s} PVC P-Trap w/ Cleanout`,      brand:"Charlotte Pipe", part:`PVC P-TRAP ${sz}`, search:`${s} PVC P-trap with cleanout schedule 40` },
                   { type:"flange",    desc:`${s} PVC Closet Flange`,           brand:"Charlotte Pipe", part:`PVC 04300 ${sz}`, search:`Charlotte Pipe ${s} PVC closet flange toilet` },
                   { type:"street",    desc:`${s} PVC Sch 40 Street 90° Elbow`, brand:"Charlotte Pipe", part:`PVC 06001 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 street 90 elbow` },
                   { type:"street",    desc:`${s} PVC Sch 40 Street 45° Elbow`, brand:"Charlotte Pipe", part:`PVC 07001 ${sz}`, search:`Charlotte Pipe ${s} PVC schedule 40 street 45 elbow` },
                   { type:"saddle",    desc:`${s} PVC Saddle Tee`,              brand:"Sioux Chief",    part:`SC-PVC-${sz}`,   search:`${s} PVC saddle tee wet tap` },
      hdPart(`pvc-compression-${s}`, "compression",
        `${s} PVC Compression Coupling`,
        `${s} PVC compression coupling repair`),
      hdPart(`dura-coupling-${s}`, "coupling",
        `${s} PVC Sch 40 Coupling`,
        `Dura ${s} schedule 40 PVC coupling`),
      ...(DURA[s]?.sc ? [{
        type:"compression", desc:`${s} Dura PVC Compression Coupling`,
        brand:"Dura", part:DURA[s].sc,
        search:`Dura ${DURA[s].sc} ${s} PVC compression coupling schedule 40`,
        note:"Compression repair coupling — no cement, no cutting back the line.",
        verified:true }] : []),
      ...(DURA[s]?.frc ? [{
        type:"telescopic", desc:`${s} Dura Flexible Repair Coupling`,
        brand:"Dura", part:DURA[s].frc,
        search:`Dura ${DURA[s].frc} ${s} PVC flexible repair coupling slip joint`,
        note:"Flexible slip-joint repair coupling. Non-potable — irrigation and sprinkler repair.",
        verified:true }] : []),
                   { type:"fernco",    desc:`${s} Fernco PVC Flex Coupling`,    brand:"Fernco",         part:`1056-${sz}`,     search:`Fernco ${s} PVC flexible coupling` },
                   { type:"transition",desc:`${s} PVC × ABS Transition`,        brand:"Charlotte Pipe", part:`PVC TRANS ${sz}`, search:`${s} PVC to ABS transition coupling` },
    ].filter(Boolean);
  }

  /* ── CPVC ── */
  if(m === "CPVC") {
    const fg = {
      '½"':  { coupling:"50808", elbow90:"50906", elbow45:"50707", tee:"50505", cap:"51200" },
      '¾"':  { coupling:"50809", elbow90:"50907", elbow45:"50708", tee:"50506", cap:"51201" },
      '1"':  { coupling:"50810", elbow90:"50908", elbow45:"50709", tee:"50507", cap:"51202" },
      '1¼"': { coupling:"50811", elbow90:"50909", elbow45:"50710", tee:"50508", cap:"51203" },
      '1½"': { coupling:"50812", elbow90:"50910", elbow45:"50711", tee:"50509", cap:"51204" },
      '2"':  { coupling:"50813", elbow90:"50911", elbow45:"50712", tee:"50510", cap:"51205" },
    };
    const f = fg[s]||{};
    return [
      f.coupling && { type:"coupling",  desc:`${s} CPVC Coupling`,            brand:"FlowGuard Gold", part:f.coupling, search:`FlowGuard Gold ${s} CPVC coupling` },
                   { type:"reducer",   desc:`${s} CPVC Reducer Coupling`,     brand:"FlowGuard Gold", part:`50814-${sz}`, search:`FlowGuard Gold ${s} CPVC reducer coupling` },
                   { type:"reducer",   desc:`${s} CPVC Bushing`,              brand:"FlowGuard Gold", part:`51100-${sz}`, search:`FlowGuard Gold ${s} CPVC bushing` },
      f.elbow90  && { type:"elbow90",   desc:`${s} CPVC 90° Elbow`,           brand:"FlowGuard Gold", part:f.elbow90,  search:`FlowGuard Gold ${s} CPVC 90 elbow` },
      f.elbow45  && { type:"elbow45",   desc:`${s} CPVC 45° Elbow`,           brand:"FlowGuard Gold", part:f.elbow45,  search:`FlowGuard Gold ${s} CPVC 45 elbow` },
      f.tee      && { type:"tee",       desc:`${s} CPVC Tee`,                 brand:"FlowGuard Gold", part:f.tee,      search:`FlowGuard Gold ${s} CPVC tee` },
      f.cap      && { type:"cap",       desc:`${s} CPVC Cap`,                 brand:"FlowGuard Gold", part:f.cap,      search:`FlowGuard Gold ${s} CPVC cap` },
                   { type:"cap",       desc:`${s} CPVC Plug`,                 brand:"FlowGuard Gold", part:`51300-${sz}`, search:`FlowGuard Gold ${s} CPVC plug` },
                   { type:"union",     desc:`${s} CPVC Union`,                brand:"FlowGuard Gold", part:`51400-${sz}`, search:`FlowGuard Gold ${s} CPVC union` },
                   { type:"street",    desc:`${s} CPVC Street 90° Elbow`,     brand:"FlowGuard Gold", part:`50907S-${sz}`, search:`FlowGuard Gold ${s} CPVC street 90 elbow` },
                   { type:"transition",desc:`${s} CPVC × Copper Adapter`,     brand:"FlowGuard Gold", part:`CPVC-CU-${sz}`, search:`${s} CPVC to copper adapter` },
                   { type:"transition",desc:`${s} CPVC × PEX Push-Connect`,   brand:"SharkBite",      part:`U088LF-${sz}`,  search:`SharkBite ${s} CPVC PEX push connect` },
    ].filter(Boolean);
  }

  /* ── PEX ── */
  /* ── PEX-A (expansion/Uponor system) ── */
  if(m === "PEX-A") {
    const up = {
      '½"':  { coupling:"Q4525050", elbow90:"Q4806050", tee:"Q4900050" },
      '¾"':  { coupling:"Q4525075", elbow90:"Q4806075", tee:"Q4900075" },
      '1"':  { coupling:"Q4525100", elbow90:"Q4806100", tee:"Q4900100" },
      '1¼"': { coupling:"Q4525125", elbow90:"Q4806125", tee:"Q4900125" },
      '1½"': { coupling:"Q4525150", elbow90:"Q4806150", tee:"Q4900150" },
      '2"':  { coupling:"Q4525200", elbow90:"Q4806200", tee:"Q4900200" },
    };
    const u = up[s]||{};
    return [
      u.coupling && { type:"coupling",  desc:`${s} PEX-A Expansion Coupling`,       brand:"Uponor",     part:u.coupling,  search:`Uponor ${s} PEX-A expansion coupling` },
      u.elbow90  && { type:"elbow90",   desc:`${s} PEX-A Expansion 90° Elbow`,      brand:"Uponor",     part:u.elbow90,   search:`Uponor ${s} PEX-A expansion 90 elbow` },
                   { type:"elbow45",   desc:`${s} PEX-A Expansion 45° Elbow`,      brand:"Uponor",     part:`Q4807${sz}`, search:`Uponor ${s} PEX-A expansion 45 elbow` },
      u.tee      && { type:"tee",       desc:`${s} PEX-A Expansion Tee`,            brand:"Uponor",     part:u.tee,       search:`Uponor ${s} PEX-A expansion tee` },
                   { type:"reducer",   desc:`${s} PEX-A Reducing Tee`,             brand:"Uponor",     part:`Q4900${sz}R`,search:`Uponor ${s} PEX-A reducing tee` },
                   { type:"cap",       desc:`${s} PEX-A Expansion Cap`,            brand:"Uponor",     part:`Q4720${sz}`, search:`Uponor ${s} PEX-A expansion cap` },
                   { type:"union",     desc:`${s} PEX-A Expansion Union`,          brand:"Uponor",     part:`Q4560${sz}`, search:`Uponor ${s} PEX-A expansion union` },
                   { type:"transition",desc:`${s} PEX-A × Copper Adapter`,         brand:"Uponor",     part:`Q4779${sz}`, search:`Uponor ${s} PEX-A copper adapter` },
                   { type:"transition",desc:`${s} PEX-A × CPVC Adapter`,           brand:"Uponor",     part:`Q4781${sz}`, search:`Uponor ${s} PEX-A CPVC adapter` },
                   { type:"saddle",    desc:`${s} PEX-A Saddle Tee`,               brand:"Sioux Chief",part:`SC-PEX-${sz}`,search:`${s} PEX-A saddle tee` },
    ].filter(Boolean);
  }

  /* ── PEX-B (crimp/clamp system) ── */
  if(m === "PEX-B") {
    const wm = {
      '½"':  { coupling:"F1960-050", elbow90:"F2159-050", tee:"F1960T-050" },
      '¾"':  { coupling:"F1960-075", elbow90:"F2159-075", tee:"F1960T-075" },
      '1"':  { coupling:"F1960-100", elbow90:"F2159-100", tee:"F1960T-100" },
      '1½"': { coupling:"F1960-150", elbow90:"F2159-150", tee:"F1960T-150" },
      '2"':  { coupling:"F1960-200", elbow90:"F2159-200", tee:"F1960T-200" },
    };
    const sb = {
      '½"':  { coupling:"UC008LF",    elbow90:"UB256LF",    tee:"UC260LF"    },
      '¾"':  { coupling:"UC008LF075", elbow90:"UB256LF075", tee:"UC260LF075" },
      '1"':  { coupling:"UC008LF100", elbow90:"UB256LF100", tee:"UC260LF100" },
    };
    const w = wm[s]||{}, b = sb[s]||{};
    return [
      w.coupling && { type:"coupling",  desc:`${s} PEX-B Crimp Coupling`,           brand:"Watts",      part:w.coupling,  search:`Watts ${s} PEX-B crimp coupling` },
      w.elbow90  && { type:"elbow90",   desc:`${s} PEX-B Crimp 90° Elbow`,          brand:"Watts",      part:w.elbow90,   search:`Watts ${s} PEX-B crimp 90 elbow` },
                   { type:"elbow45",   desc:`${s} PEX-B Crimp 45° Elbow`,          brand:"Watts",      part:`F2160-${sz}`,search:`Watts ${s} PEX-B crimp 45 elbow` },
      w.tee      && { type:"tee",       desc:`${s} PEX-B Crimp Tee`,               brand:"Watts",      part:w.tee,       search:`Watts ${s} PEX-B crimp tee` },
                   { type:"reducer",   desc:`${s} PEX-B Crimp Reducer Coupling`,   brand:"Watts",      part:`F1960R-${sz}`,search:`Watts ${s} PEX-B crimp reducer` },
                   { type:"cap",       desc:`${s} PEX-B Crimp Cap`,                brand:"Watts",      part:`F1960C-${sz}`,search:`Watts ${s} PEX-B crimp cap` },
      b.coupling && { type:"coupling",  desc:`${s} PEX-B Push-Connect Coupling`,   brand:"SharkBite",  part:b.coupling,  search:`SharkBite ${s} PEX-B push connect coupling` },
      b.elbow90  && { type:"elbow90",   desc:`${s} PEX-B Push-Connect 90° Elbow`,  brand:"SharkBite",  part:b.elbow90,   search:`SharkBite ${s} PEX-B push connect 90 elbow` },
      b.tee      && { type:"tee",       desc:`${s} PEX-B Push-Connect Tee`,        brand:"SharkBite",  part:b.tee,       search:`SharkBite ${s} PEX-B push connect tee` },
                   { type:"transition",desc:`${s} PEX-B × Copper Crimp Adapter`,   brand:"Watts",      part:`F1960CP-${sz}`,search:`Watts ${s} PEX-B copper crimp adapter` },
                   { type:"transition",desc:`${s} PEX-B × CPVC Adapter`,           brand:"Watts",      part:`F1960CV-${sz}`,search:`Watts ${s} PEX-B CPVC crimp adapter` },
                   { type:"saddle",    desc:`${s} PEX-B Saddle Tee`,               brand:"Sioux Chief",part:`SC-PEXB-${sz}`,search:`${s} PEX-B saddle tee` },
    ].filter(Boolean);
  }

  /* ── ABS ── */
  if(m === "ABS") {
    return [
      { type:"coupling",  desc:`${s} ABS Coupling`,              brand:"Charlotte Pipe", part:`ABS 01100 ${sz}`, search:`Charlotte Pipe ${s} ABS coupling` },
      { type:"reducer",   desc:`${s} ABS Reducer Coupling`,      brand:"Charlotte Pipe", part:`ABS 01101 ${sz}`, search:`Charlotte Pipe ${s} ABS reducer coupling` },
      { type:"reducer",   desc:`${s} ABS Bushing`,               brand:"Charlotte Pipe", part:`ABS 02900 ${sz}`, search:`Charlotte Pipe ${s} ABS bushing` },
      { type:"elbow90",   desc:`${s} ABS 90° Elbow`,             brand:"Charlotte Pipe", part:`ABS 06101 ${sz}`, search:`Charlotte Pipe ${s} ABS 90 elbow` },
      { type:"elbow45",   desc:`${s} ABS 45° Elbow`,             brand:"Charlotte Pipe", part:`ABS 07101 ${sz}`, search:`Charlotte Pipe ${s} ABS 45 elbow` },
      { type:"elbow225",  desc:`${s} ABS 22½° Elbow`,            brand:"Charlotte Pipe", part:`ABS 07201 ${sz}`, search:`Charlotte Pipe ${s} ABS 22.5 degree elbow` },
      { type:"tee",       desc:`${s} ABS Sanitary Tee`,          brand:"Charlotte Pipe", part:`ABS 02400 ${sz}`, search:`Charlotte Pipe ${s} ABS sanitary tee` },
      { type:"tee",       desc:`${s} ABS Wye`,                   brand:"Charlotte Pipe", part:`ABS 02800 ${sz}`, search:`Charlotte Pipe ${s} ABS wye` },
      { type:"tee",       desc:`${s} ABS Combo Wye + 1/8 Bend`,  brand:"Charlotte Pipe", part:`ABS 02850 ${sz}`, search:`Charlotte Pipe ${s} ABS combination wye` },
      { type:"cap",       desc:`${s} ABS Cap`,                   brand:"Charlotte Pipe", part:`ABS 03101 ${sz}`, search:`Charlotte Pipe ${s} ABS cap` },
      { type:"cap",       desc:`${s} ABS Plug`,                  brand:"Charlotte Pipe", part:`ABS 01900 ${sz}`, search:`Charlotte Pipe ${s} ABS plug` },
      { type:"cleanout",  desc:`${s} ABS Cleanout Adapter`,      brand:"Charlotte Pipe", part:`ABS 01600 ${sz}`, search:`Charlotte Pipe ${s} ABS cleanout adapter` },
      { type:"cleanout",  desc:`${s} ABS Cleanout Plug`,         brand:"Charlotte Pipe", part:`ABS 01601 ${sz}`, search:`Charlotte Pipe ${s} ABS cleanout plug` },
      { type:"trap",      desc:`${s} ABS P-Trap`,                brand:"Charlotte Pipe", part:`ABS P-TRAP ${sz}`,search:`${s} ABS P-trap` },
      { type:"flange",    desc:`${s} ABS Closet Flange`,         brand:"Charlotte Pipe", part:`ABS 04300 ${sz}`, search:`Charlotte Pipe ${s} ABS closet flange toilet` },
      { type:"street",    desc:`${s} ABS Street 90° Elbow`,      brand:"Charlotte Pipe", part:`ABS 06001 ${sz}`, search:`Charlotte Pipe ${s} ABS street 90 elbow` },
      { type:"fernco",    desc:`${s} Fernco ABS Flex Coupling`,  brand:"Fernco",         part:`1056-${sz}`,      search:`Fernco ${s} ABS flexible coupling` },
      { type:"transition",desc:`${s} ABS × PVC Transition`,      brand:"Fernco",         part:`C-1056-${sz}`,    search:`${s} ABS to PVC transition coupling` },
    ];
  }

  /* ── Galvanized Steel ── */
  if(m === "Galvanized Steel") {
    return [
      { type:"coupling",  desc:`${s} Galvanized Coupling`,       brand:"Anvil", part:`0310-${sz}`, search:`${s} galvanized steel pipe coupling` },
      { type:"reducer",   desc:`${s} Galvanized Reducer`,        brand:"Anvil", part:`0319-${sz}`, search:`${s} galvanized steel reducer coupling` },
      { type:"elbow90",   desc:`${s} Galvanized 90° Elbow`,      brand:"Anvil", part:`0300-${sz}`, search:`${s} galvanized steel 90 elbow` },
      { type:"elbow45",   desc:`${s} Galvanized 45° Elbow`,      brand:"Anvil", part:`0380-${sz}`, search:`${s} galvanized steel 45 elbow` },
      { type:"tee",       desc:`${s} Galvanized Tee`,            brand:"Anvil", part:`0330-${sz}`, search:`${s} galvanized steel tee` },
      { type:"cap",       desc:`${s} Galvanized Cap`,            brand:"Anvil", part:`0315-${sz}`, search:`${s} galvanized steel cap` },
      { type:"cap",       desc:`${s} Galvanized Plug`,           brand:"Anvil", part:`0341-${sz}`, search:`${s} galvanized steel plug` },
      { type:"union",     desc:`${s} Galvanized Union`,          brand:"Watts", part:`A-110-${sz}`, search:`${s} galvanized steel union` },
      { type:"union",     desc:`${s} Dielectric Union`,          brand:"Watts", part:`DULF-${sz}`,  search:`Watts ${s} dielectric union galvanized copper` },
      { type:"saddle",    desc:`${s} Galvanized Saddle Tee`,     brand:"Anvil", part:`0369-${sz}`, search:`${s} galvanized saddle tee` },
      { type:"street",    desc:`${s} Galvanized Street Elbow`,   brand:"Anvil", part:`0308-${sz}`, search:`${s} galvanized steel street elbow` },
      { type:"fernco",    desc:`${s} Fernco Flex Coupling`,      brand:"Fernco",part:`1056-${sz}`, search:`Fernco ${s} galvanized flexible coupling` },
      { type:"transition",desc:`${s} Galvanized × PEX Adapter`,  brand:"Watts", part:`LF3171-${sz}`,search:`${s} galvanized to PEX adapter` },
      ...(PASCO_COMPRESSION[s] ? [{
        type:"compression",
        desc:`${s} Galvanized Compression Coupling (long)`,
        brand:"Pasco", part:PASCO_COMPRESSION[s].part,
        search:`Pasco ${PASCO_COMPRESSION[s].part} ${s} galvanized compression coupling long IPS`,
        note:`Long pattern, ${PASCO_COMPRESSION[s].len}. Galvanized IPS — no threading, no welding. Restrain pipe after install.`,
        verified:true,
      }] : []),
    ];
  }

  /* ── Black Steel ── */
  if(m === "Black Steel") {
    return [
      { type:"coupling",  desc:`${s} Black Steel Coupling`,      brand:"Anvil", part:`0310B-${sz}`,search:`${s} black steel pipe coupling gas` },
      { type:"reducer",   desc:`${s} Black Steel Reducer`,       brand:"Anvil", part:`0319B-${sz}`,search:`${s} black steel reducer coupling gas` },
      { type:"elbow90",   desc:`${s} Black Steel 90° Elbow`,     brand:"Anvil", part:`0300B-${sz}`,search:`${s} black steel 90 elbow gas` },
      { type:"elbow45",   desc:`${s} Black Steel 45° Elbow`,     brand:"Anvil", part:`0380B-${sz}`,search:`${s} black steel 45 elbow gas` },
      { type:"tee",       desc:`${s} Black Steel Tee`,           brand:"Anvil", part:`0330B-${sz}`,search:`${s} black steel tee gas` },
      { type:"cap",       desc:`${s} Black Steel Cap`,           brand:"Anvil", part:`0315B-${sz}`,search:`${s} black steel cap gas` },
      { type:"cap",       desc:`${s} Black Steel Plug`,          brand:"Anvil", part:`0341B-${sz}`,search:`${s} black steel plug gas` },
      { type:"union",     desc:`${s} Black Steel Union`,         brand:"Anvil", part:`0390B-${sz}`,search:`${s} black steel union gas` },
      { type:"street",    desc:`${s} Black Steel Street Elbow`,  brand:"Anvil", part:`0308B-${sz}`,search:`${s} black steel street elbow gas` },
    ];
  }

  /* ── PVC Schedule 80 ── */
  if(m === "PVC (Schedule 80)") {
    return [
      { type:"coupling",  desc:`${s} PVC Sch 80 Coupling`,       brand:"Nibco", part:`4816-${sz}`, search:`${s} PVC schedule 80 coupling` },
      { type:"reducer",   desc:`${s} PVC Sch 80 Reducer`,        brand:"Nibco", part:`4817-${sz}`, search:`${s} PVC schedule 80 reducer coupling` },
      { type:"reducer",   desc:`${s} PVC Sch 80 Bushing`,        brand:"Nibco", part:`4831-${sz}`, search:`${s} PVC schedule 80 bushing` },
      { type:"elbow90",   desc:`${s} PVC Sch 80 90° Elbow`,      brand:"Nibco", part:`4808-${sz}`, search:`${s} PVC schedule 80 90 elbow` },
      { type:"elbow45",   desc:`${s} PVC Sch 80 45° Elbow`,      brand:"Nibco", part:`4809-${sz}`, search:`${s} PVC schedule 80 45 elbow` },
      { type:"elbow225",  desc:`${s} PVC Sch 80 22½° Elbow`,     brand:"Nibco", part:`4869-${sz}`, search:`${s} PVC schedule 80 22.5 degree elbow` },
      { type:"tee",       desc:`${s} PVC Sch 80 Tee`,            brand:"Nibco", part:`4821-${sz}`, search:`${s} PVC schedule 80 tee` },
      { type:"tee",       desc:`${s} PVC Sch 80 Reducing Tee`,   brand:"Nibco", part:`4822-${sz}`, search:`${s} PVC schedule 80 reducing tee` },
      { type:"cap",       desc:`${s} PVC Sch 80 Cap`,            brand:"Nibco", part:`4818-${sz}`, search:`${s} PVC schedule 80 cap` },
      { type:"cap",       desc:`${s} PVC Sch 80 Plug`,           brand:"Nibco", part:`4820-${sz}`, search:`${s} PVC schedule 80 plug` },
      { type:"union",     desc:`${s} PVC Sch 80 Union`,          brand:"Nibco", part:`4844-${sz}`, search:`${s} PVC schedule 80 union` },
      { type:"street",    desc:`${s} PVC Sch 80 Street 90°`,     brand:"Nibco", part:`4810-${sz}`, search:`${s} PVC schedule 80 street 90 elbow` },
      { type:"fernco",    desc:`${s} Fernco Flex Coupling`,      brand:"Fernco",part:`1056-${sz}`, search:`Fernco ${s} flexible coupling` },
    ];
  }

  /* ── PVC DWV (Sch 40 — drain/waste/vent only) ── */
  if(m === "PVC DWV (Sch 40)") {
    const cp = {
      '1½"': { coupling:"D2466-112",  elbow90:"D3034-112", elbow45:"D3034E-112", tee:"D3034T-112",  cap:"D2466C-112" },
      '2"':  { coupling:"D2466-200",  elbow90:"D3034-200", elbow45:"D3034E-200", tee:"D3034T-200",  cap:"D2466C-200" },
      '3"':  { coupling:"D2466-300",  elbow90:"D3034-300", elbow45:"D3034E-300", tee:"D3034T-300",  cap:"D2466C-300" },
      '4"':  { coupling:"D2466-400",  elbow90:"D3034-400", elbow45:"D3034E-400", tee:"D3034T-400",  cap:"D2466C-400" },
    };
    const ch = cp[s]||{};
    return [
      { type:"coupling",  desc:`${s} PVC DWV Hub × Hub Coupling`,     brand:"Charlotte Pipe", part:ch.coupling||`PVC 06101 ${sz}`, search:`Charlotte Pipe ${s} PVC DWV coupling` },
      { type:"reducer",   desc:`${s} PVC DWV Reducer Coupling`,        brand:"Charlotte Pipe", part:`PVC DWV 06102 ${sz}`, search:`Charlotte Pipe ${s} PVC DWV reducer coupling` },
      { type:"elbow90",   desc:`${s} PVC DWV 90° Elbow (¼ bend)`,     brand:"Charlotte Pipe", part:ch.elbow90||`PVC 06601 ${sz}`, search:`Charlotte Pipe ${s} PVC DWV 90 elbow quarter bend` },
      { type:"elbow45",   desc:`${s} PVC DWV 45° Elbow (⅛ bend)`,    brand:"Charlotte Pipe", part:ch.elbow45||`PVC 06701 ${sz}`, search:`Charlotte Pipe ${s} PVC DWV 45 elbow eighth bend` },
      { type:"elbow225",  desc:`${s} PVC DWV 22½° Elbow`,             brand:"Charlotte Pipe", part:`PVC 06801 ${sz}`, search:`Charlotte Pipe ${s} PVC DWV 22.5 degree elbow` },
      { type:"tee",       desc:`${s} PVC DWV Sanitary Tee`,            brand:"Charlotte Pipe", part:ch.tee||`PVC 07101 ${sz}`,    search:`Charlotte Pipe ${s} PVC DWV sanitary tee` },
      { type:"tee",       desc:`${s} PVC DWV Wye`,                     brand:"Charlotte Pipe", part:`PVC DWV WYE ${sz}`,          search:`Charlotte Pipe ${s} PVC DWV wye` },
      hdPart(`pvcdwv-combo-${s}`, "tee",
        `${s} PVC DWV Combo Wye + ⅛ Bend`,
        `Charlotte Pipe ${s} PVC DWV combination wye and 1/8 bend`)
        || { type:"tee", desc:`${s} PVC DWV Combo Wye + ⅛ Bend`, brand:"Charlotte Pipe",
             part:"—", search:`Charlotte Pipe ${s} PVC DWV combination wye 1/8 bend` },
      { type:"cap",       desc:`${s} PVC DWV Cap`,                     brand:"Charlotte Pipe", part:ch.cap||`PVC 07601 ${sz}`,    search:`Charlotte Pipe ${s} PVC DWV cap` },
      { type:"cap",       desc:`${s} PVC DWV Plug`,                    brand:"Charlotte Pipe", part:`PVC DWV PLUG ${sz}`,         search:`Charlotte Pipe ${s} PVC DWV plug` },
      { type:"cleanout",  desc:`${s} PVC DWV Cleanout Adapter`,        brand:"Charlotte Pipe", part:`PVC DWV CO ADP ${sz}`,       search:`Charlotte Pipe ${s} PVC DWV cleanout adapter` },
      { type:"cleanout",  desc:`${s} PVC DWV Cleanout Plug`,           brand:"Charlotte Pipe", part:`PVC DWV CO PLG ${sz}`,       search:`Charlotte Pipe ${s} PVC DWV cleanout plug` },
      { type:"trap",      desc:`${s} PVC DWV P-Trap`,                  brand:"Charlotte Pipe", part:`PVC DWV TRAP ${sz}`,         search:`${s} PVC DWV P-trap` },
      { type:"flange",    desc:`${s} PVC DWV Closet Flange`,           brand:"Charlotte Pipe", part:`PVC DWV FLANGE ${sz}`,       search:`Charlotte Pipe ${s} PVC DWV closet flange toilet` },
      { type:"street",    desc:`${s} PVC DWV Street 90° Elbow`,        brand:"Charlotte Pipe", part:`PVC DWV ST EL ${sz}`,        search:`Charlotte Pipe ${s} PVC DWV street 90 elbow` },
      { type:"reducer",   desc:`${s} PVC DWV Bushing`,                 brand:"Charlotte Pipe", part:`PVC DWV BUSH ${sz}`,         search:`Charlotte Pipe ${s} PVC DWV bushing` },
      { type:"transition",desc:`${s} PVC DWV × ABS Transition`,        brand:"Fernco",         part:`C-1056-${sz}`,               search:`${s} PVC DWV to ABS transition coupling` },
      { type:"fernco",    desc:`${s} PVC DWV Fernco Coupling`,         brand:"Fernco",         part:`1056-${sz}`,                 search:`Fernco ${s} PVC DWV flexible coupling` },
    ].filter(Boolean);
  }


  /* ── SDR 35 Sewer — Solid ── */
  if(m === "SDR 35 Sewer — Solid") {
    const sdrODs = {'4"':4.215,'6"':6.275,'8"':8.400,'10"':10.500,'12"':12.500,'15"':15.300};
    if(!sdrODs[s]) return [
      { type:"coupling", desc:`SDR 35 not available in ${s}`, brand:"—", part:"—",
        search:`SDR 35 sewer pipe ${s}`, note:'SDR 35 solid available 4" through 15" only' }
    ];
    return [
      { type:"coupling",  desc:`${s} SDR 35 Gasketed Coupling`,          brand:"Charlotte Pipe", part:`PVC D3034 G-COUP-${sz}`, search:`Charlotte Pipe ${s} SDR 35 gasketed coupling sewer`,        note:"Gasketed — push-on" },
      { type:"elbow90",   desc:`${s} SDR 35 Gasketed 90° Elbow`,         brand:"Charlotte Pipe", part:`PVC D3034 G-90-${sz}`,   search:`Charlotte Pipe ${s} SDR 35 gasketed 90 elbow sewer`,        note:"Gasketed — push-on" },
      { type:"elbow45",   desc:`${s} SDR 35 Gasketed 45° Elbow`,         brand:"Charlotte Pipe", part:`PVC D3034 G-45-${sz}`,   search:`Charlotte Pipe ${s} SDR 35 gasketed 45 elbow sewer`,        note:"Gasketed — push-on" },
      { type:"tee",       desc:`${s} SDR 35 Gasketed Sanitary Tee`,      brand:"Charlotte Pipe", part:`PVC D3034 G-TEE-${sz}`,  search:`Charlotte Pipe ${s} SDR 35 gasketed sanitary tee sewer`,    note:"Gasketed — push-on" },
      { type:"tee",       desc:`${s} SDR 35 Gasketed Wye`,               brand:"JM Eagle",       part:`SDR35-G-WYE-${sz}`,      search:`JM Eagle ${s} SDR 35 gasketed wye sewer`,                   note:"Gasketed — push-on" },
      { type:"tee",       desc:`${s} SDR 35 Gasketed Combo Wye`,         brand:"Charlotte Pipe", part:`PVC D3034 G-CWY-${sz}`,  search:`Charlotte Pipe ${s} SDR 35 gasketed combination wye sewer`, note:"Gasketed — push-on" },
      { type:"cap",       desc:`${s} SDR 35 Gasketed Test Cap`,          brand:"Charlotte Pipe", part:`PVC D3034 G-CAP-${sz}`,  search:`Charlotte Pipe ${s} SDR 35 gasketed test cap`,              note:"Gasketed — push-on" },
      { type:"cleanout",  desc:`${s} SDR 35 Gasketed Cleanout`,          brand:"Charlotte Pipe", part:`PVC D3034 G-CO-${sz}`,   search:`Charlotte Pipe ${s} SDR 35 gasketed cleanout adapter`,      note:"Gasketed — push-on" },
      { type:"coupling",  desc:`${s} SDR 35 Solvent Weld Coupling`,      brand:"Charlotte Pipe", part:`PVC 07701 ${sz}`,        search:`Charlotte Pipe ${s} SDR 35 solvent weld coupling sewer`,    note:"Solvent weld" },
      { type:"elbow90",   desc:`${s} SDR 35 Solvent Weld 90° Elbow`,    brand:"Charlotte Pipe", part:`PVC 07706 ${sz}`,        search:`Charlotte Pipe ${s} SDR 35 solvent weld 90 elbow sewer`,   note:"Solvent weld" },
      { type:"elbow45",   desc:`${s} SDR 35 Solvent Weld 45° Elbow`,    brand:"Charlotte Pipe", part:`PVC 07707 ${sz}`,        search:`Charlotte Pipe ${s} SDR 35 solvent weld 45 elbow sewer`,   note:"Solvent weld" },
      { type:"tee",       desc:`${s} SDR 35 Solvent Weld Sanitary Tee`, brand:"Charlotte Pipe", part:`PVC 07703 ${sz}`,        search:`Charlotte Pipe ${s} SDR 35 solvent weld sanitary tee`,     note:"Solvent weld" },
      { type:"tee",       desc:`${s} SDR 35 Solvent Weld Wye`,          brand:"Charlotte Pipe", part:`PVC 07730 ${sz}`,        search:`Charlotte Pipe ${s} SDR 35 solvent weld wye sewer`,        note:"Solvent weld" },
      { type:"fernco",    desc:`${s} SDR 35 × Cast Iron Coupling`,      brand:"Fernco",         part:`1056-${sz}`,             search:`Fernco ${s} SDR 35 cast iron flexible coupling sewer` },
      { type:"transition",desc:`${s} SDR 35 × Schedule 40 PVC Adapter`, brand:"Charlotte Pipe", part:`PVC D3034 IPS-ADP-${sz}`,search:`${s} SDR 35 to schedule 40 PVC adapter transition` },
    ];
  }

  /* ── SDR 35 Sewer — Perforated ── */
  if(m === "SDR 35 Sewer — Perforated") {
    const available = ['3"','4"','6"'];
    if(!available.includes(s)) return [
      { type:"coupling", desc:`Perforated SDR 35 not standard in ${s}`, brand:"—", part:"—",
        search:`perforated sewer pipe ${s} drainage`,
        note:'Perforated SDR 35 available 3", 4", 6" only. Larger sizes use corrugated HDPE.' }
    ];
    return [
      { type:"coupling",   desc:`${s} Perf SDR 35 Snap Coupler`,          brand:"Advanced Drainage Systems", part:`0610AA${sz}`,     search:`${s} perforated SDR 35 sewer pipe snap coupler drainage`,         note:"Snap-fit — no cement" },
      { type:"coupling",   desc:`${s} Perf SDR 35 Split Coupler`,         brand:"Charlotte Pipe",            part:`PVC-PERF-SPL-${sz}`, search:`${s} perforated PVC SDR 35 split coupler drain field`,           note:"Split coupler" },
      { type:"cap",        desc:`${s} Perf SDR 35 End Cap`,               brand:"Charlotte Pipe",            part:`PVC-PERF-CAP-${sz}`, search:`${s} perforated PVC SDR 35 end cap drain`,                      note:"Seals pipe end" },
      { type:"tee",        desc:`${s} Perf SDR 35 Tee`,                   brand:"Charlotte Pipe",            part:`PVC-PERF-TEE-${sz}`, search:`${s} perforated PVC SDR 35 tee cleanout drain field` },
      { type:"transition", desc:`${s} Perf → Solid SDR 35 Coupler`,      brand:"Fernco",                    part:`1056-${sz}`,         search:`${s} perforated to solid SDR 35 transition coupling drain` },
      { type:"transition", desc:`${s} Perf SDR 35 → Corrugated HDPE`,    brand:"Advanced Drainage Systems", part:`0610AA${sz}T`,       search:`${s} perforated SDR 35 PVC to corrugated HDPE transition adapter` },
    ];
  }

  /* ── COPPER DWV — thin wall, drainage only ── */
  if(m === "Copper DWV") {
    const DWV_SIZES = ['1¼"','1½"','2"','3"','4"','6"','8"'];
    if(!DWV_SIZES.includes(s)) return [
      { type:"coupling", desc:`Copper DWV not made in ${s}`, brand:"—", part:"—",
        search:`copper DWV pipe ${s}`,
        note:'Copper DWV runs 1¼" through 8". For supply sizes use Copper (pressure).' }
    ];
    const dwv = (type, name, extra) => ({
      type, desc:`${s} Copper DWV ${name}`, brand:"Nibco / Mueller", part:"—",
      search:`${s} copper DWV ${name.toLowerCase()} solder fitting ASTM B306`,
      note:"Copper DWV is thin-wall drainage only — NOT rated for pressure. "
         + "ASTM B306 tube, ASME B16.23 fittings. Supply-house item; Home Depot does not stock it."
         + (extra ? " " + extra : ""),
    });
    return [
      dwv("coupling", "Coupling"),
      dwv("elbow90",  "¼ Bend (90°)"),
      dwv("elbow45",  "⅛ Bend (45°)"),
      dwv("elbow225", "1/16 Bend (22½°)"),
      dwv("tee",      "Sanitary Tee"),
      dwv("tee",      "Wye"),
      dwv("cross",    "Sanitary Cross"),
      dwv("dblfix",   "Double Fixture Fitting"),
      dwv("trap",     "P-Trap"),
      dwv("cleanout", "Cleanout Adapter"),
      dwv("flange",   "Closet Flange"),
      dwv("reducer",  "Reducer / Increaser"),
      dwv("cap",      "Cap"),
      dwv("transition","× Cast Iron Adapter",
        "Solder DWV to a spigot adapter, then shielded coupling to cast iron."),
      { type:"fernco", desc:`${s} Copper DWV × Plastic Coupling`, brand:"Fernco",
        part:`1056-${sz}`, search:`Fernco ${s} copper DWV to PVC ABS flexible coupling`,
        note:"Copper DWV OD matches copper pressure at the same nominal size." },
    ];
  }

  /* ── CPVC SCHEDULE 80 — grey, industrial ── */
  if(m === "CPVC (Schedule 80)") {
    const c80 = (type, name) => ({
      type, desc:`${s} CPVC Sch 80 ${name}`, brand:"Spears / Charlotte", part:"—",
      search:`${s} CPVC schedule 80 ${name.toLowerCase()} grey ASTM F441`,
      note:"Grey Sch 80 CPVC — ASTM F441 pipe, F439 fittings. Use CPVC cement and "
         + "CPVC primer only; standard purple PVC primer is not compatible. "
         + "Thicker wall than Sch 40 — same OD, smaller ID, higher pressure rating.",
    });
    return [
      c80("coupling","Coupling"),
      c80("reducer", "Reducer Bushing"),
      c80("elbow90", "90° Elbow"),
      c80("elbow45", "45° Elbow"),
      c80("tee",     "Tee"),
      c80("cross",   "Cross"),
      c80("cap",     "Cap"),
      c80("union",   "Union"),
      c80("flange",  "Flange"),
      c80("street",  "Street 90° Elbow"),
      c80("transition","× CPVC Sch 40 Adapter"),
      c80("transition","× Metal Threaded Adapter"),
    ];
  }

  /* ── CAST IRON ── */
  if(m === "Cast Iron") {
    const jcm = jcmFittings("cast iron", s, "Cast Iron");
    if(!jcm.length) return [
      { type:"repair", desc:`Cast iron OD not in table for ${s}`, brand:"—", part:"—",
        search:`cast iron pipe ${s} repair coupling`,
        note:'Cast iron ODs on file: 2" (2.300), 3" (3.300), 4" (4.300).' }
    ];
    const T = TYLER[s] || {};
    const CI_NOTE = "ASTM A888 / CISPI 301. Join with CISPI 310 shielded couplings — "
                  + "unshielded couplings void the manufacturer warranty.";
    const ci = (type, name, extra, hdKey) => {
      /* Verified Charlotte part at Home Depot wins; Tyler next; otherwise search only */
      const e = hdKey && HD[hdKey];
      if (e) return {
        type, desc:`${s} Cast Iron No-Hub ${name}`, brand:e.brand,
        part:e.model, hdUrl:hdUrl(e), hd:e.hd, sku:e.sku, verified:true,
        search:`Charlotte Pipe ${s} no-hub cast iron ${name.toLowerCase()}`,
        note:CI_NOTE,
      };
      return {
        type, desc:`${s} Cast Iron No-Hub ${name}`,
        brand: T[extra] ? "Tyler Pipe" : "Charlotte / Tyler",
        part: T[extra] || "—",
        search:`${s} no-hub cast iron ${name.toLowerCase()} CISPI 301`,
        note:CI_NOTE,
        verified: !!T[extra],
      };
    };
    return [
      ...jcm,
      ci("elbow90",  "¼ Bend (90°)",        "qbend"),
      ci("elbow45",  "⅛ Bend (45°)",        "ebend"),
      ci("elbow225", "1/16 Bend (22½°)",    "sbend"),
      ci("tee",      "Sanitary Tee",          "santee",   `ci-santee-${s}`),
      ci("tee",      "Tapped Sanitary Tee",   "tapsantee",`ci-tapsantee-${s}`),
      ci("tee",      "Wye Branch",            "wye"),
      ci("tee",      "Combination Wye + ⅛ Bend", "combo"),
      ci("cross",    "Sanitary Cross",        "cross"),
      ci("dblfix",   "Double Fixture Fitting","dblfix"),
      ci("cleanout", "Cleanout Tee",          "cleanout"),
      ci("flange",   "Closet Flange",         "flange"),
      ci("reducer",  "Reducer",               "reducer"),
      ci("cap",      "Plug / Cap",            "cap"),
      ci("trap",     "P-Trap",                "trap"),
      { type:"fernco", desc:`${s} No-Hub Shielded Coupling (CISPI 310)`,
        brand:"Mission", part:`MC-${sz}`,
        search:`Mission no-hub shielded band coupling ${s} cast iron CISPI 310`,
        note:'Required by Tyler for hubless joints. Torque 60 in-lb (2"), 80 in-lb (3"–4").' },
      { type:"fernco", desc:`${s} Heavy-Duty Shielded Coupling`,
        brand:"Fernco", part:`GS-${sz}`,
        search:`Fernco shielded coupling ${s} cast iron no hub`,
        note:"4-band shielded coupling for underground and high-load applications." },
      { type:"transition", desc:`${s} Cast Iron × PVC/ABS Coupling`,
        brand:"Fernco", part:`1056-${sz}`,
        search:`Fernco ${s} cast iron to PVC transition coupling`,
        note:'No-hub cast iron OD differs from hub — Tyler lists 4" no-hub at 4.38", '
           + 'hub pipe at 4.30". Verify OD before sizing the coupling.' },
    ];
  }

  /* ── AC PIPE (TRANSITE) — HAZMAT ── */
  if(m === "AC Pipe (Transite)") {
    const jcm = jcmFittings("ac pipe", s, "AC Pipe");
    if(!jcm.length) return [
      { type:"repair", desc:`AC pipe OD not in table for ${s}`, brand:"—", part:"—",
        search:`asbestos cement pipe ${s} repair coupling`,
        note:'AC ODs on file: 4" (4.800), 6" (7.100), 8" (9.050), 10" (11.350), 12" (13.500).' }
    ];
    return [
      ...jcm,
      { type:"transition", desc:`${s} AC Pipe Fitting Restrainer`, brand:"JCM", part:"630",
        search:`JCM 630 asbestos cement pipe restrainer ${s}`,
        note:'Anchors fittings, hydrants, valves and meters to 4"–16" AC pipe. Split design for retrofit.',
        verified:true },
    ];
  }

  return [];
}

/* Brand colors */
const BRAND_COLORS = {
  "Nibco":          "#003087",
  "SharkBite":      "#e8192c",
  "Charlotte Pipe": "#005bac",
  "Fernco":         "#f5a623",
  "FlowGuard Gold": "#f5c518",
  "Uponor":         "#e8192c",
  "Sioux Chief":    "#c8102e",
  "Anvil":          "#555",
  "Amazon":         "#ff9900",
  "JM Eagle":          "#8b4513",
  "Charlotte Pipe SDR": "#005bac",
  "Diamond Plastics":  "#4a7c59",
  "Advanced Drainage Systems": "#2d6a2d",
  "JCM":            "#1b4f9c",
  "Pasco":          "#6b7280",
  "Mission":        "#8b1a1a",
  "Everbilt":       "#f96302",
  "Homewerks":      "#0a7a3d",
  "Nibco / Mueller":  "#003087",
  "Spears / Charlotte":"#005bac",
  "Charlotte / Tyler": "#5a5a5a",
  "Tyler Pipe":     "#8a6d3b",
  "Dura":           "#1b7a8c",
};

/* ═══════════════════════════════════════════════════════════
   FITTINGS SCREEN
═══════════════════════════════════════════════════════════ */
function FittingsScreen({screen, navigate}) {
  const [material,   setMaterial]   = useState("Copper");
  const [sizes,      setSizes]      = useState(['¾"','¾"','¾"','¾"']);
  const [typeFilter, setTypeFilter] = useState("all");

  /* How many ports the selected fitting has. "All" shows one size only,
     since port count is a property of the fitting type. */
  const portCount = typeFilter === "all" ? 1 : (FITTING_PORTS[typeFilter] || 1);
  const labels    = PORT_LABELS[typeFilter] || ["Size"];

  const setPort = (i, val) => setSizes(prev => {
    const next = [...prev];
    next[i] = val;
    return next;
  });
  /* Setting the main size pulls the other ports along unless already reduced */
  const setMain = (val) => setSizes(prev => {
    const next = [...prev];
    next.forEach((v,i) => { if (i === 0 || v === prev[0]) next[i] = val; });
    return next;
  });

  const active   = sizes.slice(0, portCount);
  const reducing = new Set(active).size > 1;
  const sizeSpec = active.join(" × ");

  /* Base list comes from the main size. For multi-port fittings the chosen
     spec is folded into the description and the retailer search string, so
     the link finds the right reducing part. */
  const raw = getFittings(material, sizes[0]);
  const fittings = raw.map(f => {
    const ports = FITTING_PORTS[f.type] || 1;
    if (ports < 2 || !reducing || typeFilter === "all") return f;
    const spec = sizes.slice(0, ports).join(" × ");
    return {
      ...f,
      desc: f.desc.replace(sizes[0], spec),
      search: `${spec} ${f.search.replace(sizes[0] + " ", "")}`.trim(),
      _spec: spec,
    };
  });
  const filtered = typeFilter === "all"
    ? fittings
    : fittings.filter(f => f.type === typeFilter);

  const sponsoredRetailers = RETAILERS.filter(r => r.sponsored);
  const allRetailers       = RETAILERS;

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"var(--blk)"}}>
      <ScreenHeader title="Fittings"/>

      {/* Selectors */}
      <div style={{padding:"10px 14px 0",background:"var(--blk2)",
        borderBottom:"1px solid var(--bdr)",flexShrink:0,
        maxHeight:"38vh",overflowY:"auto"}}>

        {/* Material */}
        <BC c="Material" s={{fontSize:13,fontWeight:800,color:"var(--w50)",
          letterSpacing:".1em",textTransform:"uppercase",display:"block",marginBottom:6}}/>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          {FITTING_MATERIALS.map(mat=>(
            <button key={mat} onClick={()=>setMaterial(mat)} style={{
              padding:"7px 11px",borderRadius:4,fontSize:14,cursor:"pointer",
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,
              letterSpacing:".04em",
              background:material===mat?"var(--cop)":"var(--blk3)",
              color:material===mat?"var(--blk)":"var(--w50)",
              border:"1px solid " + (material===mat?"var(--cop)":"var(--bdr2)"),
              transition:"all .12s",
              minHeight:"unset",
            }}>{mat}</button>
          ))}
        </div>

        {/* Size ports — one row per port on the selected fitting */}
        {Array.from({length: portCount}).map((_, i) => {
          const isMain   = i === 0;
          const label    = labels[i] || `Size ${i+1}`;
          const val      = sizes[i];
          const isReduced= !isMain && val !== sizes[0];
          const accent   = isMain ? "var(--grn)" : "var(--yel)";
          return (
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <BC c={label} s={{fontSize:14,fontWeight:800,
                  color:isReduced?"var(--yel)":"var(--w50)",
                  letterSpacing:".1em",textTransform:"uppercase"}}/>
                {isReduced && (
                  <button onClick={()=>setPort(i, sizes[0])} style={{
                    fontSize:12,padding:"2px 8px",borderRadius:10,cursor:"pointer",
                    background:"rgba(245,197,24,.15)",color:"var(--yel)",
                    border:"1px solid rgba(245,197,24,.3)",minHeight:"unset",
                    fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,
                  }}>✕ match run</button>
                )}
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {NOMINAL_SIZES.map(sz=>{
                  const on = val === sz;
                  return (
                    <button key={sz}
                      onClick={()=> isMain ? setMain(sz) : setPort(i, sz)}
                      style={{
                        padding:"10px 14px",borderRadius:5,fontSize:18,cursor:"pointer",
                        fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,
                        background:on?accent:"var(--blk3)",
                        color:on?"#0c0c0c":"var(--w50)",
                        border:"1px solid " + (on?accent:"var(--bdr2)"),
                        transition:"all .12s",minHeight:"unset",minWidth:46,
                      }}>{sz}</button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Spec readout */}
        {portCount > 1 && (
          <div style={{display:"flex",alignItems:"center",gap:10,
            padding:"9px 12px",marginBottom:10,borderRadius:"var(--r)",
            background:reducing?"rgba(245,197,24,.08)":"var(--blk3)",
            border:`1px solid ${reducing?"rgba(245,197,24,.3)":"var(--bdr)"}`}}>
            <BC c={reducing?"REDUCING":"STRAIGHT"} s={{fontSize:13,fontWeight:900,
              letterSpacing:".1em",color:reducing?"var(--yel)":"var(--w25)"}}/>
            <Mono c={sizeSpec} s={{fontSize:17,fontWeight:700,color:"var(--wht)"}}/>
          </div>
        )}

      </div>

      {/* Type filter */}
      <div style={{padding:"8px 16px",background:"var(--blk2)",
        borderBottom:"1px solid var(--bdr)",flexShrink:0,
        display:"flex",gap:5,overflowX:"auto"}}>
        <button onClick={()=>setTypeFilter("all")} style={{
          padding:"7px 12px",borderRadius:20,fontSize:14,cursor:"pointer",whiteSpace:"nowrap",
          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:".04em",minHeight:"unset",
          background:typeFilter==="all"?"var(--wht)":"var(--blk3)",
          color:typeFilter==="all"?"var(--blk)":"var(--w50)",
          border:"1px solid " + (typeFilter==="all"?"var(--wht)":"var(--bdr2)"),
        }}>ALL</button>
        {FITTING_TYPES.map(ft=>(
          <button key={ft.id} onClick={()=>setTypeFilter(ft.id)} style={{
            padding:"7px 12px",borderRadius:20,fontSize:14,cursor:"pointer",whiteSpace:"nowrap",
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:".06em",minHeight:"unset",
            background:typeFilter===ft.id?"var(--cop)":"var(--blk3)",
            color:typeFilter===ft.id?"var(--blk)":"var(--w50)",
            border:"1px solid " + (typeFilter===ft.id?"var(--cop)":"var(--bdr2)"),
          }}>{ft.label}</button>
        ))}
      </div>

      {/* Results */}
      <div className="scroll" style={{flex:1,minHeight:0,padding:"10px 14px 16px"}}>

        {/* Sponsor banner — shown when sponsored retailers are active */}
        {sponsoredRetailers.length > 0 && (
          <div style={{padding:"8px 12px",borderRadius:"var(--r)",
            background:"rgba(201,121,60,.08)",border:"1px solid rgba(201,121,60,.25)",
            marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <BC c="★" s={{fontSize:17,color:"var(--cop)"}}/>
            <div style={{fontSize:15,color:"var(--w80)"}}>
              <BC c={sponsoredRetailers.map(r=>r.name).join(" · ")}
                s={{fontWeight:800,color:"var(--cop)"}}/>{" "}
              stocking these fittings locally.
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{padding:40,textAlign:"center"}}>
            <BC c="No fittings found" s={{fontSize:19,fontWeight:800,
              color:"var(--w50)",display:"block",marginBottom:6}}/>
            <div style={{fontSize:16,color:"var(--w25)"}}>
              Try a different size or material
            </div>
          </div>
        ) : (
          filtered.map((f,i) => (
            <FittingCard key={i} fitting={f} retailers={allRetailers}
              sponsored={sponsoredRetailers}/>
          ))
        )}

        {/* Retailer disclaimer */}
        <div style={{marginTop:20,padding:"10px 12px",borderRadius:"var(--r)",
          background:"var(--blk2)",border:"1px solid var(--bdr)"}}>
          <BC c="About retailer links" s={{fontSize:14,fontWeight:800,
            color:"var(--w25)",letterSpacing:".08em",textTransform:"uppercase",
            display:"block",marginBottom:4}}/>
          <div style={{fontSize:15,color:"var(--w25)",lineHeight:1.5}}>
            Links open the retailer's search for that part number.
            Availability and pricing vary by location. Part numbers are from
            manufacturer catalogs and may differ by region.
          </div>
        </div>
      </div>

      <NavBar active="fittings" navigate={navigate}/>
    </div>
  );
}

/* ─── Fitting card ───────────────────────────────────────────── */
function FittingCard({fitting, retailers, sponsored}) {
  const [open, setOpen] = useState(false);
  const brandColor = BRAND_COLORS[fitting.brand] || "#888";
  const isSponsored = sponsored.some(r =>
    fitting.search.toLowerCase().includes(r.id));

  return (
    <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
      border:"1px solid var(--bdr2)",
      borderLeft:`3px solid ${brandColor}`,
      marginBottom:8,overflow:"hidden"}}>

      {/* Header */}
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",padding:"12px 14px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        gap:10,background:"none",textAlign:"left",cursor:"pointer"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:14,padding:"2px 7px",borderRadius:2,
              background:`${brandColor}22`,
              color:brandColor,
              fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:800,letterSpacing:".06em",flexShrink:0}}>
              {fitting.brand}
            </span>
            {fitting.verified&&(
              <span style={{fontSize:13,padding:"2px 7px",borderRadius:2,
                background:"rgba(34,197,94,.12)",color:"var(--grn)",
                border:"1px solid rgba(34,197,94,.3)",
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800,letterSpacing:".06em"}}>
                {fitting.hdUrl ? "✓ HD VERIFIED" : "✓ VERIFIED"}</span>
            )}
            {isSponsored&&(
              <span style={{fontSize:14,padding:"2px 6px",borderRadius:2,
                background:"rgba(201,121,60,.15)",color:"var(--cop)",
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800,letterSpacing:".06em"}}>★ LOCAL STOCK</span>
            )}
          </div>
          <BC c={fitting.desc} s={{fontSize:16,fontWeight:800,
            color:"var(--wht)",display:"block",marginBottom:2}}/>
          <Mono c={fitting.part} s={{fontSize:14,color:"var(--w50)"}}/>
          {fitting.hd && (
            <Mono c={`  ·  HD #${fitting.hd}${fitting.sku ? "  ·  SKU " + fitting.sku : ""}`}
              s={{fontSize:13,color:"var(--w25)"}}/>
          )}
        </div>
        <BC c={open?"▲":"▼"} s={{fontSize:15,color:"var(--w50)",flexShrink:0}}/>
      </button>

      {/* Retailer links — expanded */}
      {open&&(
        <div style={{borderTop:"1px solid var(--bdr)",padding:"12px 14px"}}>
          {fitting.note && (() => {
            const n = fitting.note;
            const hazard = /ASBESTOS|NOT rated|NOT pressure|void the manufacturer|never|Never/.test(n);
            return (
              <div style={{marginBottom:12,padding:"10px 12px",borderRadius:"var(--r)",
                background: hazard ? "rgba(239,68,68,.09)" : "var(--blk3)",
                border: `1px solid ${hazard ? "rgba(239,68,68,.35)" : "var(--bdr)"}`,
                borderLeft: `3px solid ${hazard ? "#ef4444" : "var(--cop)"}`}}>
                <BC c={hazard ? "⚠ Important" : "Field note"}
                  s={{fontSize:13,fontWeight:900,letterSpacing:".1em",
                    textTransform:"uppercase",display:"block",marginBottom:5,
                    color: hazard ? "#ef4444" : "var(--cop)"}}/>
                <div style={{fontSize:15,lineHeight:1.55,
                  color: hazard ? "rgba(255,190,190,.9)" : "var(--w80)"}}>{n}</div>
              </div>
            );
          })()}
          <BC c="Find at retailer" s={{fontSize:14,fontWeight:800,
            color:"var(--w50)",letterSpacing:".1em",textTransform:"uppercase",
            display:"block",marginBottom:10}}/>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {retailers.map(r=>(
              <a key={r.id}
                href={r.id === "homedepot" && fitting.hdUrl ? fitting.hdUrl : r.url(fitting.search)}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 14px",borderRadius:"var(--r)",
                  background:r.sponsored?"rgba(201,121,60,.1)":"var(--blk3)",
                  border:`1px solid ${r.sponsored?"rgba(201,121,60,.35)":"var(--bdr2)"}`,
                  textDecoration:"none",
                  transition:"background .12s",
                }}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",
                    background:r.color,flexShrink:0}}/>
                  <BC c={r.name} s={{fontSize:18,fontWeight:800,
                    color:r.sponsored?"var(--cop)":"var(--w80)"}}/>
                  {r.sponsored&&(
                    <BC c="★ SPONSOR" s={{fontSize:14,padding:"1px 6px",
                      borderRadius:2,background:"rgba(201,121,60,.2)",
                      color:"var(--cop)",fontWeight:900,letterSpacing:".08em"}}/>
                  )}
                </div>
                <BC c={r.id === "homedepot" && fitting.hdUrl ? "Open part →" : "Search →"}
                  s={{fontSize:15,fontWeight:700,
                  color:r.id === "homedepot" && fitting.hdUrl ? "var(--cop)"
                       : r.sponsored ? "var(--cop)" : "var(--w50)"}}/>
              </a>
            ))}
          </div>
          <div style={{marginTop:10,fontSize:14,color:"var(--w25)",lineHeight:1.5}}>
            Search term: <Mono c={fitting.search} s={{fontSize:13,color:"var(--w25)"}}/>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Fittings tab icon ──────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════
   HISTORY SCREEN — with job notes, scan selector, PDF export
═══════════════════════════════════════════════════════════ */
const COMPAT_MATERIALS = [
  "Copper",
  "CPVC",
  "PVC",
  "PEX-A",
  "PEX-B",
  "PEX",
  "ABS",
  "Galvanized Steel",
  "Black Steel",
  "Cast Iron",
  "Copper DWV",
  "CPVC Sch 80",
  "AC Pipe (Asbestos Cement)",
  "CSST (Gas)",
  "Polybutylene",
  "Lead",
  "SDR 35 Sewer",
];

/* Compatibility level */
const COMPAT_LEVEL = {
  DIRECT:    { color:"#22c55e", label:"Direct Connection",      icon:"✓" },
  ADAPTER:   { color:"#f5c518", label:"Adapter Required",       icon:"⚡" },
  SPECIAL:   { color:"#f97316", label:"Special Requirements",   icon:"⚠" },
  AVOID:     { color:"#ef4444", label:"Avoid / Not Recommended",icon:"✕" },
  ILLEGAL:   { color:"#ef4444", label:"Code Violation",         icon:"🚫" },
};

/* Helper: sort two strings to make a canonical key */
const compatKey = (a, b) => [a, b].sort().join(" || ");

const COMPAT_DB = {

  /* ── COPPER ── */
  [compatKey("Copper","Copper")]: {
    level:"DIRECT",
    summary:"Direct solder, push-connect, or compression connection.",
    dielectric:false,
    fittings:[
      { desc:"Solder (sweat) coupling",          brand:"Nibco",     part:"604-series",        search:"Nibco copper solder coupling" },
      { desc:"Push-to-connect coupling",          brand:"SharkBite", part:"U008LF",            search:"SharkBite copper push connect coupling" },
      { desc:"Compression coupling",              brand:"Watts",     part:"A-722 series",      search:"Watts copper compression coupling" },
    ],
    steps:[
      "Cut both pipe ends square and deburr",
      "For solder: clean with emery cloth, flux both surfaces, heat fitting and feed solder",
      "For push-connect: mark insertion depth, push firmly until it clicks",
      "For compression: slide nut and ring onto pipe, insert fitting, tighten nut 1¼ turns past hand-tight",
    ],
    code:"Standard connection — no special code requirements. Lead-free fittings required on potable water.",
    notes:"Push-connect fittings (SharkBite) are removable and reusable — good for repairs where torch work is impractical.",
  },

  [compatKey("Copper","CPVC")]: {
    level:"DIRECT",
    summary:"CPVC and copper share the same OD at every nominal size — direct connection with the right fitting.",
    dielectric:false,
    fittings:[
      { desc:"CPVC Female Adapter × Copper Solder",brand:"FlowGuard Gold",part:"50808-FA",     search:"CPVC to copper solder adapter" },
      { desc:"Push-to-connect copper × CPVC",      brand:"SharkBite",    part:"U088LF",        search:"SharkBite copper CPVC push connect" },
      { desc:"CPVC × Copper Male Adapter",          brand:"FlowGuard Gold",part:"CPVC-MA",      search:"CPVC male adapter copper female" },
    ],
    steps:[
      "Verify nominal sizes match — ½\" CPVC OD = ½\" copper OD = 0.625\"",
      "For soldered transition: use CPVC female adapter, solder copper end, solvent weld CPVC end",
      "Never apply torch heat directly to CPVC — keep flame away from plastic",
      "For push-connect: mark depth on both pipes, push firmly into SharkBite fitting",
      "Allow CPVC solvent joint to cure fully before pressurizing",
    ],
    code:"Approved by IPC and UPC. Purple primer required for CPVC solvent joints in most jurisdictions.",
    notes:"The most common transition in residential plumbing — copper supply to CPVC hot water. Both ODs are identical so fittings are interchangeable.",
  },

  [compatKey("Copper","PVC")]: {
    level:"ADAPTER",
    summary:"Different OD systems — requires a transition fitting or adapter.",
    dielectric:false,
    fittings:[
      { desc:"Copper Male Adapter × PVC Female",   brand:"Nibco",     part:"C × FPT adapter", search:"copper male adapter PVC female thread transition" },
      { desc:"Push-connect copper × PVC adapter",  brand:"SharkBite", part:"U034LF",          search:"SharkBite copper PVC transition fitting" },
      { desc:"Fernco flexible coupling",            brand:"Fernco",    part:"1056-series",     search:"Fernco copper PVC flexible coupling" },
    ],
    steps:[
      "Copper and PVC have different OD systems — do not attempt direct connection",
      "Use threaded adapter: solder male threaded adapter to copper, thread into PVC female fitting",
      "Apply Teflon tape to male threads only — 2–3 wraps clockwise",
      "Or use SharkBite push-connect adapter rated for both copper and PVC",
      "Or use Fernco flexible coupling where rigid connection isn't required (drain only)",
    ],
    code:"Approved transition. Thread sealant required on all threaded joints. IPC Table 605.5.",
    notes:"Copper supply to PVC drain is common. Use threaded male adapter on copper end into threaded PVC fitting. Never use PVC cement on copper.",
  },

  [compatKey("Copper","PEX")]: {
    level:"DIRECT",
    summary:"Very common transition — multiple proven methods.",
    dielectric:false,
    fittings:[
      { desc:"Push-to-connect copper × PEX",       brand:"SharkBite", part:"U088LF",          search:"SharkBite copper PEX push connect transition" },
      { desc:"Copper sweat × PEX crimp adapter",   brand:"Watts",     part:"LF3170 series",   search:"Watts copper sweat PEX crimp adapter" },
      { desc:"Copper sweat × PEX expansion",       brand:"Uponor",    part:"Q4570075",        search:"Uponor copper PEX expansion adapter" },
    ],
    steps:[
      "For push-connect (easiest): cut both pipes square, deburr, mark depth, push into SharkBite fitting",
      "For sweat-to-crimp: solder copper end of adapter, slide crimp ring on PEX, insert fitting, crimp",
      "Do not connect PEX directly to water heater — use 18\" of copper or CPVC first",
      "Verify PEX type (A, B, C) matches fitting system before purchasing",
    ],
    code:"Approved by IPC and UPC. PEX prohibited within 18\" of water heater — use copper or CPVC stub.",
    notes:"SharkBite push-connect is the fastest method — no tools required. For permanent installations a sweat-to-crimp adapter is more secure.",
  },

  [compatKey("Copper","Galvanized Steel")]: {
    level:"SPECIAL",
    summary:"REQUIRES dielectric union — galvanic corrosion will destroy the joint within years if connected directly.",
    dielectric:true,
    fittings:[
      { desc:"Dielectric union ½\"",               brand:"Watts",     part:"DULF-4",          search:"Watts dielectric union 1/2 inch" },
      { desc:"Dielectric union ¾\"",               brand:"Watts",     part:"DULF-6",          search:"Watts dielectric union 3/4 inch" },
      { desc:"Dielectric union 1\"",               brand:"Watts",     part:"DULF-8",          search:"Watts dielectric union 1 inch" },
      { desc:"Push-connect dielectric",            brand:"SharkBite", part:"DEL series",      search:"SharkBite dielectric push connect" },
    ],
    steps:[
      "NEVER connect copper directly to galvanized — galvanic cell forms and corrodes both metals",
      "Install dielectric union between copper and galvanized sections",
      "Dielectric union has plastic insulating sleeve that breaks the electrical contact",
      "Thread galvanized side with pipe dope or Teflon tape",
      "Solder or push-connect copper side",
      "Verify plastic isolator is seated correctly before tightening",
    ],
    code:"Dielectric isolation required by IPC Section 605.13.1 where dissimilar metals connect.",
    notes:"Galvanic corrosion is real and fast — copper and zinc (galvanized coating) are far apart on the galvanic series. In wet environments the galvanized corrodes preferentially within 2–5 years without isolation.",
    warning:"Inspect dielectric unions every 5 years — plastic isolator degrades over time.",
  },

  [compatKey("Copper","Black Steel")]: {
    level:"SPECIAL",
    summary:"Requires dielectric union. Black steel is for gas — not water. Confirm application first.",
    dielectric:true,
    fittings:[
      { desc:"Dielectric union",                   brand:"Watts",     part:"DULF series",     search:"Watts dielectric union black steel copper" },
    ],
    steps:[
      "Confirm the black steel is for gas — if water, galvanized should have been used",
      "For gas: only licensed gas contractor should make this transition",
      "For water (unusual): dielectric union required — same as copper to galvanized",
    ],
    code:"Black steel pipe is for gas and steam only — not approved for potable water (IPC 605.4).",
    notes:"If you're seeing black steel on a water line it's either a very old installation or an error. Gas lines require gas contractor — do not modify.",
    warning:"Black steel + water = DO NOT USE. Black steel is gas/steam only.",
  },

  [compatKey("Copper","Cast Iron")]: {
    level:"ADAPTER",
    summary:"Copper supply to cast iron drain is very common — use a lead-free mission coupling or Fernco.",
    dielectric:false,
    fittings:[
      { desc:"Mission no-hub coupling",            brand:"Mission",   part:"MC-series",       search:"Mission no-hub band coupling cast iron copper" },
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco cast iron copper flexible coupling" },
      { desc:"Copper × cast iron adapter",         brand:"Charlotte", part:"CI-CU adapter",   search:"cast iron to copper no hub adapter" },
    ],
    steps:[
      "For copper drain to cast iron: use Fernco or Mission no-hub flexible coupling",
      "Cut cast iron cleanly — angle grinder with cutting wheel or snap cutter",
      "Clean both pipe ends of debris and corrosion",
      "Slide coupling over cast iron end, insert copper pipe, tighten clamps evenly",
      "Torque band clamps to 60 in-lb for 2\", 80 in-lb for 3\"+",
    ],
    code:"Approved by UPC and IPC. No-hub couplings must be CISPI 310 rated for underground use.",
    notes:"Cast iron hub × copper spigot: cut old lead and oakum joint, clean hub, use inside-caulking fernco adapter.",
  },

  [compatKey("Copper","ABS")]: {
    level:"ADAPTER",
    summary:"Common transition — copper supply to ABS drain. Threaded adapter or Fernco.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco copper ABS flexible coupling" },
      { desc:"Copper × ABS threaded transition",   brand:"Genova",    part:"MIP adapter",     search:"copper male adapter ABS female thread" },
    ],
    steps:[
      "Copper supply to ABS drain: threaded male adapter soldered to copper, threaded into ABS fitting",
      "Or use Fernco flexible coupling for non-pressure (drain) connections",
      "ABS and copper are chemically compatible — no galvanic concern",
    ],
    code:"Approved transition. Fernco couplings must be used per manufacturer specs.",
    notes:"ABS is drain only — never use for pressure supply lines.",
  },

  /* ── PVC ── */
  [compatKey("PVC","PVC")]: {
    level:"DIRECT",
    summary:"Direct solvent cement connection. Prime first.",
    dielectric:false,
    fittings:[
      { desc:"PVC Sch 40 coupling",                brand:"Charlotte", part:"PVC 01100",       search:"Charlotte Pipe PVC schedule 40 coupling" },
      { desc:"Push-connect PVC",                   brand:"SharkBite", part:"U138LF",          search:"SharkBite PVC push connect coupling" },
    ],
    steps:[
      "Cut square, deburr, bevel the OD edge",
      "Apply purple primer to both pipe OD and fitting socket — keep wet",
      "Apply PVC cement to fitting socket (full coat) and pipe OD (full coat, second coat on pipe)",
      "Insert pipe with ¼ turn twist, push to socket bottom, hold 30 seconds",
      "Wipe excess cement from outside",
    ],
    code:"Purple primer required by UPC and most local codes for pressure systems. ASTM D2564.",
    notes:"Standard residential DWV and irrigation connection. Do not use PVC cement on CPVC.",
  },

  [compatKey("PVC","CPVC")]: {
    level:"SPECIAL",
    summary:"Different cement systems — use transition cement or mechanical fitting only. NEVER use PVC cement on CPVC.",
    dielectric:false,
    fittings:[
      { desc:"PVC-CPVC transition union",          brand:"Spears",    part:"8830 series",     search:"PVC CPVC transition union" },
      { desc:"Push-connect PVC × CPVC",            brand:"SharkBite", part:"U088LF",          search:"SharkBite PVC CPVC transition" },
      { desc:"All-purpose transition cement",      brand:"Christy's", part:"RH-RTA-HP",       search:"Christy's all purpose transition cement PVC CPVC" },
    ],
    steps:[
      "Do NOT use standard PVC cement on CPVC — bond failure under heat and pressure",
      "Do NOT use CPVC cement on PVC — incompatible formulation",
      "Option 1: mechanical union — solvent weld PVC side with PVC cement, CPVC side with CPVC cement",
      "Option 2: push-connect SharkBite fitting — works on both materials without cement",
      "Option 3: all-purpose transition cement where code allows (verify locally)",
      "Allow full cure before pressurizing — CPVC is hot water, PVC is cold/drain only",
    ],
    code:"Verify local code — some jurisdictions prohibit all-purpose cement. IPC Table 605.5.",
    notes:"CPVC is for hot and cold supply. PVC is cold supply and drain only. They meet where hot supply transitions to DWV.",
    warning:"Using wrong cement is the #1 cause of solvent joint failure at CPVC-to-PVC transitions.",
  },

  [compatKey("PVC","PEX")]: {
    level:"ADAPTER",
    summary:"Different materials and OD systems — use push-connect or threaded adapter.",
    dielectric:false,
    fittings:[
      { desc:"PVC × PEX push-connect adapter",     brand:"SharkBite", part:"U088LF-PVC",      search:"SharkBite PVC PEX transition adapter" },
      { desc:"PVC MIP × PEX barb adapter",         brand:"Watts",     part:"LF3170-series",   search:"PVC male thread PEX barb adapter" },
    ],
    steps:[
      "PVC and PEX cannot be solvent welded together",
      "Use SharkBite push-connect: works on PVC, CPVC, copper, and PEX",
      "Or thread: male adapter on PVC end, barb or crimp fitting on PEX end",
      "PEX requires crimp ring or expansion tool — never solder or cement",
    ],
    code:"Approved combination. Verify PEX type (A/B/C) before selecting fitting system.",
    notes:"Common in renovations — replacing PVC sections with PEX.",
  },

  [compatKey("PVC","ABS")]: {
    level:"SPECIAL",
    summary:"Requires transition cement or mechanical coupling — standard cement for either material will not bond the other.",
    dielectric:false,
    fittings:[
      { desc:"PVC/ABS transition cement",          brand:"Christy's", part:"RH-RTA-HP",       search:"Christy's transition cement PVC ABS" },
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco PVC ABS transition coupling" },
      { desc:"Mission band coupling",              brand:"Mission",   part:"MC-series",       search:"Mission coupling PVC ABS transition" },
    ],
    steps:[
      "Never use PVC cement on ABS or ABS cement on PVC — will not bond",
      "Option 1: transition cement — prime both surfaces, apply transition cement, assemble",
      "Option 2: Fernco flexible coupling over both pipe ends — no cement required",
      "Fernco is acceptable for drain/vent/waste — not for pressure",
      "Transition cement is preferred for permanent joints",
    ],
    code:"Transition cement required per ASTM D3138. Fernco approved for DWV per UPC 705.16.",
    notes:"Common in older homes where ABS was used originally and PVC is being used for repairs.",
  },

  [compatKey("PVC","Galvanized Steel")]: {
    level:"ADAPTER",
    summary:"Threaded adapter — galvanized threads into PVC female fitting.",
    dielectric:false,
    fittings:[
      { desc:"PVC FPT × galvanized MIP",           brand:"Charlotte", part:"PVC FPT adapter", search:"PVC female thread galvanized male adapter" },
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco PVC galvanized flexible coupling" },
    ],
    steps:[
      "Thread galvanized pipe with pipe dope or Teflon tape on male threads",
      "Thread into PVC female adapter — hand tight plus 2 turns maximum",
      "Do not overtighten — cracks PVC socket",
      "PVC is cold and drain — galvanized to PVC transition usually at meter or main",
    ],
    code:"Approved. Use pipe dope or Teflon — not both. IPC 605.18.",
    notes:"Over-tightening a galvanized nipple into PVC is the most common cause of cracked PVC fittings.",
  },

  [compatKey("PVC","Cast Iron")]: {
    level:"ADAPTER",
    summary:"Very common DWV transition — Fernco or no-hub coupling.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco PVC cast iron coupling" },
      { desc:"Mission no-hub band coupling",       brand:"Mission",   part:"MC-series",       search:"Mission no-hub PVC cast iron" },
      { desc:"Rubber donut (inside-caulk)",        brand:"Fernco",    part:"IC series",       search:"Fernco inside caulk cast iron PVC adapter" },
    ],
    steps:[
      "For hub cast iron: use inside-caulk Fernco that fits into the hub socket",
      "For no-hub cast iron: Fernco or Mission band coupling over both ends",
      "Clean pipe ends thoroughly — corrosion or tar residue prevents seal",
      "Tighten band clamps evenly — alternate sides to prevent cocking",
      "Torque to 60 in-lb (2\") or 80 in-lb (3\"–4\")",
    ],
    code:"CISPI 310 rated couplings required for underground. ASTM C1461 for hubless.",
    notes:"Most common transition in drain work — old cast iron main with new PVC branches.",
  },

  /* ── CPVC ── */
  [compatKey("CPVC","CPVC")]: {
    level:"DIRECT",
    summary:"Direct solvent cement with CPVC-specific cement and primer.",
    dielectric:false,
    fittings:[
      { desc:"CPVC coupling",                      brand:"FlowGuard Gold", part:"50808",      search:"FlowGuard Gold CPVC coupling" },
      { desc:"Push-connect CPVC",                  brand:"SharkBite",      part:"U088LF",     search:"SharkBite CPVC push connect" },
    ],
    steps:[
      "Cut square, deburr, bevel",
      "Apply CPVC primer (yellow/orange) — NOT standard purple PVC primer",
      "Apply CPVC-specific cement to both surfaces while primer is still wet",
      "Insert with ¼ turn twist, hold 15–30 seconds",
      "Minimum cure: 15 min at 60°F+ for ½\"–¾\", 30 min for 1\"–2\"",
    ],
    code:"ASTM F493. Yellow/orange CPVC primer required — purple PVC primer is NOT compatible.",
    notes:"CPVC is for hot and cold water supply — not for drain/waste/vent.",
    warning:"Do not use standard PVC cement on CPVC. The bond will fail under hot water pressure.",
  },

  [compatKey("CPVC","PEX")]: {
    level:"ADAPTER",
    summary:"Push-connect is easiest — or threaded CPVC adapter to PEX fitting.",
    dielectric:false,
    fittings:[
      { desc:"Push-connect CPVC × PEX",            brand:"SharkBite", part:"U088LF",          search:"SharkBite CPVC PEX push connect transition" },
      { desc:"CPVC FPT × PEX barb",                brand:"Watts",     part:"LF3170",          search:"CPVC female thread PEX barb adapter" },
    ],
    steps:[
      "CPVC and PEX cannot be cemented together",
      "Push-connect: SharkBite works on both — mark depth, push firmly",
      "Threaded: CPVC female adapter + PEX barb male adapter with Teflon on threads",
      "Do not connect PEX within 18\" of water heater — use CPVC stub first",
    ],
    code:"Both materials approved for hot water supply. PEX requires 18\" CPVC or copper stub at water heater.",
    notes:"CPVC to PEX is common when converting from CPVC supply to PEX throughout the home.",
  },

  [compatKey("CPVC","Galvanized Steel")]: {
    level:"ADAPTER",
    summary:"Threaded adapter required. No dielectric needed — CPVC is plastic.",
    dielectric:false,
    fittings:[
      { desc:"CPVC FPT × galvanized MIP",          brand:"FlowGuard Gold", part:"CPVC-FPT",   search:"CPVC female thread adapter galvanized" },
    ],
    steps:[
      "Thread galvanized with Teflon tape or pipe dope on male threads",
      "Thread into CPVC female adapter — hand tight plus 1½ turns only",
      "CPVC threads crack easily from overtightening — never use a pipe wrench on CPVC",
      "Use a strap wrench on CPVC fittings if needed",
    ],
    code:"Approved. CPVC plastic isolates the connection — no dielectric union needed.",
    notes:"Unlike copper-to-galvanized, CPVC has no galvanic reaction with steel.",
  },

  /* ── PEX ── */

  /* ── PEX-A ── */
  [compatKey("PEX-A","PEX-A")]: {
    level:"DIRECT", method:"Expansion fitting (ProPEX/Uponor system)",
    summary:"PEX-A to PEX-A is the gold standard. Expansion fittings create a stronger joint than the pipe wall itself.",
    steps:["Expand pipe end with correct tool","Insert fitting","Pipe contracts and grips — allow 20 min at 60°F+"],
    code:"ASTM F1960 expansion fittings required.",
    notes:"Only PEX-A pipe can be expanded. Do not use expansion fittings on PEX-B or PEX-C.",
  },
  [compatKey("PEX-A","PEX-B")]: {
    level:"ADAPTER", method:"Push-connect fitting (SharkBite) or crimp adapter",
    summary:"PEX-A and PEX-B are chemically compatible — both are cross-linked polyethylene. Use push-connect fittings or a crimp coupling. Cannot use expansion fittings on PEX-B.",
    steps:["Use push-connect fitting (SharkBite UB series) or","Use crimp coupling with copper crimp rings","Do NOT attempt expansion fitting on PEX-B end"],
    code:"ASTM F1960 (expansion) only for PEX-A end. ASTM F1807 crimp for PEX-B end.",
    notes:"Label each line — PEX-A and PEX-B look identical once installed.",
  },
  [compatKey("PEX-A","Copper")]: {
    level:"ADAPTER", method:"PEX-A expansion × copper adapter or push-connect",
    summary:"PEX-A connects to copper via expansion adapter fittings (Uponor Q-series) or SharkBite push-connect. Dielectric concern is minimal — PEX is non-conductive.",
    steps:["Expansion adapter: expand PEX-A, insert brass adapter, allow recovery","Push-connect: deburr copper, insert SharkBite fitting to depth mark"],
    code:"ASTM F1960 expansion or ASSE 1061 push-connect.",
    notes:"No dielectric union needed — PEX insulates the connection naturally.",
  },
  [compatKey("PEX-A","CPVC")]: {
    level:"ADAPTER", method:"Expansion adapter or push-connect transition",
    summary:"PEX-A to CPVC transition is common in retrofits. Use manufacturer-rated transition fittings — not standard CPVC solvent fittings.",
    steps:["Use Uponor PEX-A to CPVC adapter (Q4781 series)","Or SharkBite CPVC push-connect adapter","Do NOT solvent weld to PEX"],
    code:"ASTM F1960 + ASTM D2846.",
    notes:"Never solvent weld CPVC directly to PEX — PEX is not weldable.",
  },
  [compatKey("PEX-A","PVC")]: {
    level:"ADAPTER", method:"Transition fitting — push-connect or threaded adapter",
    summary:"PEX-A to PVC requires a transition fitting. Common in drainage connections and mixing old/new systems.",
    steps:["Use SharkBite push-connect PVC adapter","Or threaded plastic-to-plastic adapter — plastic male into plastic female only","Never thread a metal male adapter into a plastic female PVC fitting"],
    code:"ASTM F1960 + ASTM D1785.",
    warning:"NEVER thread a metal MIP adapter into a plastic FIP fitting. Metal threads stress-crack plastic fittings — use plastic-to-plastic or a union.",
  },
  [compatKey("PEX-A","Galvanized Steel")]: {
    level:"SPECIAL", method:"Dielectric union + threaded adapter",
    summary:"PEX-A to galvanized requires a dielectric union to prevent galvanic corrosion where water bridges the connection.",
    steps:["Install dielectric union at the transition point","Thread plastic male adapter into galvanized female — use PTFE tape","Never thread metal into plastic female fittings"],
    code:"Dielectric union required per most codes at dissimilar metal junctions.",
    warning:"Thread plastic-to-plastic or use a dielectric union. Metal male threads into plastic female fittings cause stress cracking.",
  },
  [compatKey("PEX-B","PEX-B")]: {
    level:"DIRECT", method:"Crimp or clamp fittings (F1807/F2080)",
    summary:"PEX-B to PEX-B using crimp or clamp rings is the standard system. Reliable, cost-effective, and widely available.",
    steps:["Slide crimp ring onto pipe","Insert brass or plastic insert fitting","Crimp ring with proper go/no-go gauge"],
    code:"ASTM F1807 (copper crimp) or ASTM F2080 (clamp rings).",
    notes:"Use a go/no-go gauge after every crimp — undertorqued rings leak. Stainless clamp rings preferred in corrosive environments.",
  },
  [compatKey("PEX-B","Copper")]: {
    level:"ADAPTER", method:"Crimp adapter or push-connect",
    summary:"PEX-B connects to copper via crimp insert adapters or SharkBite push-connect fittings. No dielectric union needed.",
    steps:["Crimp: slide ring, insert brass copper-sweat adapter, crimp","Push-connect: deburr copper, insert SharkBite to depth mark"],
    code:"ASTM F1807 crimp or ASSE 1061 push-connect.",
    notes:"PEX is non-conductive — no galvanic concern at the joint.",
  },
  [compatKey("PEX-B","CPVC")]: {
    level:"ADAPTER", method:"Crimp insert adapter or push-connect",
    summary:"PEX-B to CPVC via crimp adapter or SharkBite. Common in hot water line retrofits.",
    steps:["Use CPVC-to-PEX crimp adapter","Or SharkBite push-connect rated for CPVC"],
    code:"ASTM F1807 + ASTM D2846.",
    notes:"Confirm SharkBite fitting is rated for CPVC — some are PEX-only.",
  },
  [compatKey("PEX-B","PVC")]: {
    level:"ADAPTER", method:"Threaded or push-connect transition",
    summary:"PEX-B to PVC transition — use plastic-to-plastic threaded adapters or push-connect fittings.",
    steps:["Use SharkBite push-connect or","Thread plastic male adapter into plastic female — PTFE tape","Never thread metal male adapter into plastic female PVC"],
    code:"ASTM F1807 + ASTM D1785.",
    warning:"NEVER thread a metal MIP adapter into a plastic FIP fitting. Stress cracking will occur — sometimes immediately, sometimes months later.",
  },
  [compatKey("PEX-B","Galvanized Steel")]: {
    level:"SPECIAL", method:"Dielectric union + threaded adapter",
    summary:"PEX-B to galvanized requires a dielectric union. Use plastic-to-plastic threading at any plastic female fittings.",
    steps:["Install dielectric union at transition","Use PTFE tape on all threaded connections","Thread plastic male into galvanized female — not the reverse"],
    code:"Dielectric union required at dissimilar metal junctions.",
    warning:"Thread plastic-to-plastic wherever possible. Metal male into plastic female = stress cracking risk.",
  },
  [compatKey("PEX","PEX")]: {
    level:"DIRECT",
    summary:"Crimp, clamp, or expansion — match fitting system to PEX type.",
    dielectric:false,
    fittings:[
      { desc:"PEX expansion coupling (PEX-A only)", brand:"Uponor",    part:"Q4525050",       search:"Uponor PEX expansion coupling" },
      { desc:"PEX crimp coupling",                  brand:"Watts",     part:"LF3100 series",  search:"Watts PEX crimp coupling" },
      { desc:"Push-connect PEX coupling",           brand:"SharkBite", part:"UC008LF",        search:"SharkBite PEX push connect coupling" },
    ],
    steps:[
      "Identify PEX type first — A (Uponor, Wirsbo) uses expansion fittings only",
      "PEX-B and C use crimp or clamp fittings",
      "Crimp: slide copper ring on pipe, insert fitting fully, crimp perpendicular to pipe",
      "Check every crimp with go/no-go gauge — mandatory",
      "Push-connect: mark depth, push firmly until seated — works on all PEX types",
      "Expansion (PEX-A): expand pipe with tool, insert fitting, allow 20 min to recover",
    ],
    code:"ASTM F876/F877 (PEX tube) · F1807 (crimp) · F2159 (clamp) · F1960 (expansion).",
    notes:"Never mix fitting systems — expansion fittings will not work on PEX-B/C. Check the pipe for stampings.",
  },

  [compatKey("PEX","ABS")]: {
    level:"ADAPTER",
    summary:"Threaded or push-connect adapter. PEX is supply, ABS is drain — they meet at fixture.",
    dielectric:false,
    fittings:[
      { desc:"PEX × MIP adapter to ABS FIP",       brand:"Watts",     part:"LF3171 series",  search:"PEX male adapter ABS female thread" },
      { desc:"Push-connect PEX to ABS",            brand:"SharkBite", part:"U138LF",         search:"SharkBite PEX ABS transition" },
    ],
    steps:[
      "PEX supply cannot be cemented to ABS drain",
      "Use threaded male adapter on PEX end, thread into ABS female fitting",
      "Teflon tape on male threads only",
      "Or SharkBite push-connect fitting rated for both materials",
    ],
    code:"Approved combination at fixture locations.",
    notes:"Common at sink and shower rough-ins — PEX supply, ABS drain.",
  },

  [compatKey("PEX","Galvanized Steel")]: {
    level:"ADAPTER",
    summary:"Threaded adapter. No dielectric needed — PEX is plastic.",
    dielectric:false,
    fittings:[
      { desc:"PEX × galvanized threaded adapter",  brand:"Watts",     part:"LF3171",         search:"PEX male thread adapter galvanized female" },
      { desc:"Push-connect PEX to galvanized",     brand:"SharkBite", part:"U088LF",         search:"SharkBite PEX galvanized transition" },
    ],
    steps:[
      "Install male threaded PEX adapter, thread into galvanized female fitting",
      "Teflon tape on galvanized male threads when threading into PEX female adapter",
      "PEX plastic isolates — no dielectric union required",
      "Check galvanized pipe ID for scale buildup before reusing — reduced flow",
    ],
    code:"Approved. PEX to galvanized common when re-piping older homes section by section.",
    notes:"When replacing galvanized section by section with PEX — this is your transition at each end.",
  },

  [compatKey("PEX","Cast Iron")]: {
    level:"ADAPTER",
    summary:"PEX supply to cast iron drain at fixture location. Threaded or push-connect.",
    dielectric:false,
    fittings:[
      { desc:"PEX × cast iron adapter",            brand:"Watts",     part:"LF3170",         search:"PEX adapter cast iron connection" },
      { desc:"No-hub cast iron × PEX drain",       brand:"Fernco",    part:"1056-series",    search:"Fernco PEX cast iron flexible drain" },
    ],
    steps:[
      "PEX supply to cast iron drain: use male PEX threaded adapter into cast iron female",
      "Cast iron drain to PEX drain (uncommon): use Fernco flexible coupling",
    ],
    code:"Approved at fixture locations.",
    notes:"Rarely a direct PEX-to-cast-iron connection in supply — usually transitions through copper or galvanized first.",
  },

  /* ── ABS ── */
  [compatKey("ABS","ABS")]: {
    level:"DIRECT",
    summary:"One-step ABS cement — no primer required.",
    dielectric:false,
    fittings:[
      { desc:"ABS coupling",                       brand:"Charlotte", part:"ABS 01100",      search:"Charlotte Pipe ABS coupling" },
    ],
    steps:[
      "Cut square and deburr — bevel recommended but not required",
      "Wipe clean and dry — no primer needed",
      "Apply ABS cement to pipe OD and fitting socket",
      "Insert with ¼ turn, push to bottom, hold 15–30 seconds",
      "Cure: 5 min at 60°F+ before handling, 2 hrs before pressure",
    ],
    code:"ASTM D2235. ABS is drain/waste/vent only — not for pressure supply.",
    notes:"ABS cement is black and one-step — simpler than PVC. Common in West Coast construction.",
  },

  [compatKey("ABS","Galvanized Steel")]: {
    level:"ADAPTER",
    summary:"Threaded adapter — galvanized into ABS female fitting.",
    dielectric:false,
    fittings:[
      { desc:"ABS FPT × galvanized MIP",           brand:"Charlotte", part:"ABS FPT adapter", search:"ABS female thread galvanized male adapter" },
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco ABS galvanized flexible coupling" },
    ],
    steps:[
      "Thread galvanized with pipe dope or Teflon on male threads",
      "Thread into ABS female adapter — hand tight plus 2 turns",
      "ABS is plastic — no galvanic concern with galvanized",
    ],
    code:"Approved. ABS drain/waste/vent only.",
    notes:"Usually seen at cleanout connections or where galvanized drain transitions to ABS.",
  },

  [compatKey("ABS","Cast Iron")]: {
    level:"ADAPTER",
    summary:"Fernco or no-hub coupling — identical to PVC-to-cast-iron.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling",           brand:"Fernco",    part:"1056-series",     search:"Fernco ABS cast iron coupling" },
      { desc:"Mission no-hub coupling",            brand:"Mission",   part:"MC-series",       search:"Mission no-hub ABS cast iron" },
    ],
    steps:[
      "Clean both pipe ends",
      "Slide Fernco or Mission coupling over cast iron end",
      "Insert ABS pipe into other end of coupling",
      "Tighten clamps evenly to 60–80 in-lb",
    ],
    code:"CISPI 310 rated couplings required underground.",
    notes:"Very common in drain renovation — old cast iron main with new ABS branches.",
  },

  /* ── GALVANIZED / BLACK STEEL ── */
  [compatKey("Galvanized Steel","Galvanized Steel")]: {
    level:"DIRECT",
    summary:"Threaded connection with Teflon tape or pipe dope.",
    dielectric:false,
    fittings:[
      { desc:"Galvanized coupling",                brand:"Anvil",     part:"0310 series",    search:"galvanized steel pipe coupling" },
      { desc:"Galvanized union",                   brand:"Anvil",     part:"0390 series",    search:"galvanized steel union fitting" },
    ],
    steps:[
      "Apply 2–3 wraps Teflon tape clockwise on male threads only",
      "Or brush pipe dope on male threads — full coverage",
      "Hand tighten, then 2–3 turns with pipe wrench",
      "Use two wrenches — one on pipe, one on fitting — never twist the pipe",
      "Do not overtighten — cracks cast fittings",
    ],
    code:"ASTM A53. Not recommended for new potable water installation — internal corrosion reduces ID over time.",
    notes:"Galvanized is being phased out of potable water. Replacing with PEX or copper is preferred over extending.",
  },

  [compatKey("Galvanized Steel","Black Steel")]: {
    level:"SPECIAL",
    summary:"Threaded connection works, but clarify application first — black steel is gas only.",
    dielectric:false,
    fittings:[
      { desc:"Steel union",                        brand:"Anvil",     part:"0390 series",    search:"black steel galvanized union fitting" },
    ],
    steps:[
      "If this is a water/gas crossover — stop. Black steel is not approved for potable water",
      "For gas-to-galvanized transition: use black steel threaded to galvanized with dope/tape",
      "Have a licensed gas contractor verify any gas line work",
    ],
    code:"Black steel: gas and steam only (IPC 605.4). Galvanized: water and gas.",
    warning:"Never use black steel for potable water.",
  },

  [compatKey("Black Steel","Black Steel")]: {
    level:"DIRECT",
    summary:"Threaded connection — gas systems only. Licensed gas contractor required.",
    dielectric:false,
    fittings:[
      { desc:"Black steel coupling",               brand:"Anvil",     part:"0310-BLK",       search:"black steel pipe coupling" },
      { desc:"Black steel union",                  brand:"Anvil",     part:"0390-BLK",       search:"black steel union fitting" },
    ],
    steps:[
      "Black steel is for gas and steam — verify application before proceeding",
      "Apply yellow gas-rated Teflon tape or pipe dope to male threads",
      "Assemble hand tight plus 2–3 turns — two wrenches",
      "Pressure test with calibrated gauge — soap bubbles on every joint",
      "Licensed gas contractor required for all gas piping work",
    ],
    code:"NFPA 54 · IFGC. Gas contractor certification required.",
    warning:"All black steel gas work requires a licensed gas contractor and permit in most jurisdictions.",
  },

  [compatKey("Cast Iron","Cast Iron")]: {
    level:"ADAPTER",
    summary:"No-hub coupling or lead-and-oakum joint (legacy).",
    dielectric:false,
    fittings:[
      { desc:"No-hub band coupling",               brand:"Mission",   part:"MC-series",      search:"Mission no-hub cast iron coupling" },
      { desc:"Fernco shielded coupling",           brand:"Fernco",    part:"GS series",      search:"Fernco cast iron shielded coupling" },
    ],
    steps:[
      "Modern method: no-hub band coupling — slide over both ends, tighten clamps",
      "Torque clamps to 60 in-lb (2\") or 80 in-lb (3\"–4\")",
      "Legacy method: lead and oakum — oakum rope packed into hub, molten lead poured",
      "Lead-and-oakum required only when matching existing hub joints in historic/code-protected buildings",
      "Never use lead-and-oakum on new work",
    ],
    code:"CISPI 301 (cast iron pipe) · CISPI 310 (no-hub couplings).",
    notes:"Cast iron is the gold standard for drain noise reduction. No-hub coupling is the modern standard for joining.",
  },

  /* ── SPECIAL / DEPRECATED ── */
  [compatKey("Polybutylene","Polybutylene")]: {
    level:"AVOID",
    summary:"Do not extend or repair polybutylene. Full replacement is the only correct action.",
    dielectric:false,
    fittings:[],
    steps:[
      "Do NOT add to or repair a polybutylene system",
      "Advise full replacement — PEX-A or copper",
      "Document all visible polybutylene and inform the homeowner in writing",
    ],
    code:"Polybutylene is discontinued. No current ASTM or code approval for new work.",
    warning:"Polybutylene has a documented catastrophic failure rate. Extending the system increases liability. Replace it.",
  },

  [compatKey("Polybutylene","Copper")]: {
    level:"AVOID",
    summary:"Transitioning from polybutylene to copper during re-pipe only. Not an extension.",
    dielectric:false,
    fittings:[
      { desc:"SharkBite push-connect (re-pipe transition only)", brand:"SharkBite", part:"U088LF", search:"SharkBite polybutylene copper transition" },
    ],
    steps:[
      "This connection is only appropriate during full or partial re-pipe",
      "Cut polybutylene cleanly — deburr inside and outside",
      "SharkBite push-connect is the easiest transition fitting — no special tools",
      "Replace the entire polybutylene run — do not just repair a section",
    ],
    code:"Only for transition during replacement — not for extending system.",
    warning:"Replacing only one section of polybutylene is not a fix — it is still a failing system.",
  },

  [compatKey("Lead","Copper")]: {
    level:"SPECIAL",
    summary:"Transitioning from lead to copper during replacement only. Health hazard — PPE required.",
    dielectric:false,
    fittings:[
      { desc:"Lead × copper wiped joint (legacy)",  brand:"N/A",      part:"N/A",            search:"lead pipe to copper transition" },
      { desc:"Fernco flexible coupling",            brand:"Fernco",   part:"1056-series",    search:"Fernco lead pipe flexible coupling" },
    ],
    steps:[
      "PPE required — gloves, eye protection, dust mask minimum",
      "Do not cut lead dry — wet cutting reduces lead dust",
      "Fernco flexible coupling over both pipe ends is the safest modern method",
      "Wiped solder joint is the traditional method — requires specialist skill",
      "Replace the entire lead section — do not just transition and leave lead in service",
      "Flush system thoroughly after any work on lead pipe",
      "Contact local utility — many offer free lead service line replacement",
    ],
    code:"Lead pipe banned for new installation since 1986. Replacement required per EPA LCR.",
    warning:"Lead is a health hazard. Do not disturb without PPE. Replacement is required — transitioning to copper without removing the lead section is not an acceptable repair.",
  },


  /* ── COPPER DWV ── */
  [compatKey("Copper DWV","Copper DWV")]: {
    level:"DIRECT",
    summary:"Solder with DWV fittings. Drainage only — never pressure.",
    dielectric:false,
    fittings:[
      { desc:"Copper DWV solder coupling", brand:"Nibco / Mueller", part:"—",
        search:"copper DWV solder coupling ASTM B306" },
    ],
    steps:[
      "Cut square, ream, clean both surfaces to bright copper",
      "Flux, assemble, heat the fitting — not the pipe",
      "Feed solder at the joint gap opposite the flame",
      "Lead-free solder required if the line could ever serve potable water",
    ],
    code:"ASTM B306 tube · ASME B16.23 DWV fittings. Drainage, waste and vent only.",
    notes:'Copper DWV has the same OD as copper pressure at each nominal size but a much '
        + 'thinner wall. It starts at 1¼" — there is no ½" or ¾" DWV.',
    warning:"Copper DWV is NOT pressure rated. Never substitute it for Type M, L or K supply pipe.",
  },
  [compatKey("Copper DWV","Copper")]: {
    level:"SPECIAL",
    summary:"Same OD, same fittings will physically fit — but the wall thickness and rating are different.",
    dielectric:false,
    fittings:[
      { desc:"Copper DWV × pressure adapter", brand:"Nibco", part:"—",
        search:"copper DWV to copper pressure solder adapter" },
    ],
    steps:[
      "Confirm which side is DWV — DWV tube is noticeably thinner and lighter",
      "Solder normally; the OD is identical so the fitting seats correctly",
      "Never carry pressure through the DWV section",
    ],
    code:"ASTM B306 (DWV) vs ASTM B88 (pressure). Different tube standards.",
    warning:"A DWV fitting will slip onto pressure tube and look perfect. It is not rated for it — "
          + "verify before soldering supply into a drainage fitting.",
  },
  [compatKey("Copper DWV","Cast Iron")]: {
    level:"ADAPTER",
    summary:"Standard drain transition — shielded no-hub coupling over both ends.",
    dielectric:false,
    fittings:[
      { desc:"No-hub shielded coupling", brand:"Mission", part:"MC-series",
        search:"Mission no-hub shielded coupling copper DWV cast iron" },
      { desc:"Fernco flexible coupling", brand:"Fernco", part:"1056-series",
        search:"Fernco copper DWV cast iron coupling" },
    ],
    steps:[
      "Cut cast iron clean — snap cutter or grinder",
      "Clean both ends of scale and tar",
      "Slide coupling over cast iron, insert copper DWV, tighten bands evenly",
      'Torque 60 in-lb (2"), 80 in-lb (3"–4")',
    ],
    code:"CISPI 310 shielded couplings for hubless. ASTM C1540 for heavy duty.",
    notes:"Very common in older buildings — copper DWV branches into a cast iron stack.",
  },
  [compatKey("Copper DWV","PVC")]: {
    level:"ADAPTER",
    summary:"Fernco or threaded adapter. No solvent bonds copper to plastic.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling", brand:"Fernco", part:"1056-series",
        search:"Fernco copper DWV to PVC coupling" },
    ],
    steps:[
      "Fernco flexible coupling is the usual method for drain work",
      "Or solder a male adapter to the copper and thread into a PVC female fitting",
      "Tape or dope on male threads only",
    ],
    code:"Approved DWV transition per UPC/IPC.",
    notes:"Typical during partial re-pipes where copper DWV meets new PVC.",
  },
  [compatKey("Copper DWV","ABS")]: {
    level:"ADAPTER",
    summary:"Same as copper DWV to PVC — mechanical coupling only.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling", brand:"Fernco", part:"1056-series",
        search:"Fernco copper DWV to ABS coupling" },
    ],
    steps:["Fernco coupling over both ends","Tighten bands evenly, alternate sides"],
    code:"Approved DWV transition.",
    notes:"West Coast homes often have copper DWV meeting ABS branches.",
  },

  /* ── CPVC SCH 80 ── */
  [compatKey("CPVC Sch 80","CPVC")]: {
    level:"DIRECT",
    summary:"Same material and same cement — Sch 80 simply has a thicker wall.",
    dielectric:false,
    fittings:[
      { desc:"CPVC Sch 80 × Sch 40 coupling", brand:"Spears", part:"—",
        search:"CPVC schedule 80 to schedule 40 coupling" },
    ],
    steps:[
      "Both are CPVC — use CPVC primer (yellow/orange) and CPVC cement",
      "OD is identical at each nominal size, so fittings interchange",
      "Sch 80 has a smaller ID — expect a small flow restriction at the transition",
    ],
    code:"ASTM F441 (Sch 80 pipe) · ASTM F439 (Sch 80 fittings) · ASTM F493 cement.",
    notes:"Grey is Sch 80, tan/cream is Sch 40 CPVC. Same chemistry.",
  },
  [compatKey("CPVC Sch 80","PVC")]: {
    level:"SPECIAL",
    summary:"Different materials — cements are not interchangeable. Mechanical or transition only.",
    dielectric:false,
    fittings:[
      { desc:"PVC × CPVC transition union", brand:"Spears", part:"8830 series",
        search:"PVC CPVC transition union schedule 80" },
    ],
    steps:[
      "Do NOT use PVC cement on CPVC or CPVC cement on PVC",
      "Use a mechanical union — solvent each side with its own correct cement",
      "Or an all-purpose transition cement where local code allows",
    ],
    code:"Verify locally — some jurisdictions prohibit all-purpose transition cement.",
    warning:"Grey Sch 80 CPVC and grey Sch 80 PVC look nearly identical. Check the print line "
          + "before cementing — wrong cement is the number one CPVC joint failure.",
  },

  /* ── AC PIPE (ASBESTOS CEMENT) ── */
  [compatKey("AC Pipe (Asbestos Cement)","AC Pipe (Asbestos Cement)")]: {
    level:"SPECIAL",
    summary:"Heavy duty full-circumferential clamp coupling. Asbestos — wet methods and PPE required.",
    dielectric:false,
    fittings:[
      { desc:"JCM 102 Extended Range Universal Clamp Coupling", brand:"JCM", part:"102-series",
        search:"JCM 102 extended range universal clamp coupling asbestos cement" },
      { desc:"JCM 132 All Stainless Extended Range", brand:"JCM", part:"132-series",
        search:"JCM 132 all stainless extended range clamp coupling asbestos cement" },
    ],
    steps:[
      "STOP — confirm the pipe is asbestos cement before any cutting or grinding",
      "Wet-cut only. Never dry cut, grind, or abrade AC pipe",
      "Full PPE: respirator, disposable coveralls, gloves, eye protection",
      "Determine the actual pipe OD — AC ODs differ from cast iron at the same nominal size",
      "Select clamp by OD and band width, then torque per JCM spec",
      "Bag and dispose of debris per local asbestos regulations",
    ],
    code:"Clamps to ANSI/AWWA C230. Asbestos handling per EPA NESHAP and Cal/OSHA 1529.",
    warning:"ASBESTOS. Cutting, grinding or breaking AC pipe releases friable fibers. "
          + "Licensed abatement may be required. Notify the owner in writing.",
    notes:'JCM 102 and 132 cover AC and cast iron 4"–12" in six clamp sizes.',
  },
  [compatKey("AC Pipe (Asbestos Cement)","PVC")]: {
    level:"SPECIAL",
    summary:"The standard replacement transition — wide-range clamp coupling spans the OD difference.",
    dielectric:false,
    fittings:[
      { desc:"JCM 102 Extended Range Coupling", brand:"JCM", part:"102-series",
        search:"JCM 102 extended range coupling asbestos cement to PVC" },
      { desc:"JCM 132 All Stainless Extended Range", brand:"JCM", part:"132-series",
        search:"JCM 132 stainless coupling AC pipe PVC transition" },
    ],
    steps:[
      "Wet-cut the AC pipe. Full PPE. No dry cutting",
      'AC and PVC ODs differ substantially — 6" AC is 7.100", 6" PVC is far smaller',
      "Use an extended-range clamp rated to span both ODs",
      "Torque evenly and verify the gasket seated on both pipes",
      "Anchor the pipe — clamps do not resist lateral pull-out",
    ],
    code:"ANSI/AWWA C230. Asbestos work per EPA NESHAP and state rules.",
    warning:"ASBESTOS. Most AC-to-PVC work is a main replacement — verify abatement "
          + "requirements before breaking the line.",
    notes:"This is the most common AC transition in the field: failing transite main cut back to new PVC.",
  },
  [compatKey("AC Pipe (Asbestos Cement)","Cast Iron")]: {
    level:"SPECIAL",
    summary:"JCM extended range clamp — designed specifically for mixed AC and cast iron systems.",
    dielectric:false,
    fittings:[
      { desc:"JCM 102 Extended Range Universal Clamp", brand:"JCM", part:"102-series",
        search:"JCM 102 clamp coupling asbestos cement cast iron" },
      { desc:"JCM 132 All Stainless Extended Range", brand:"JCM", part:"132-series",
        search:"JCM 132 stainless clamp coupling AC cast iron" },
    ],
    steps:[
      "Wet methods and PPE on the AC side",
      "Measure both ODs — they differ at the same nominal size",
      "Extended range clamp is required to span both",
    ],
    code:"ANSI/AWWA C230.",
    warning:"ASBESTOS on the AC side. Wet-cut only.",
    notes:'JCM built the 102 and 132 for exactly this — systems running both AC and cast iron.',
  },
  /* ── SDR 35 Sewer ── */
  [compatKey("SDR 35 Sewer","SDR 35 Sewer")]: {
    level:"DIRECT",
    summary:"Gasketed push-on (most common) or solvent weld. Non-pressure gravity sewer only.",
    dielectric:false,
    fittings:[
      { desc:"SDR 35 Gasketed Coupling — push-on",  brand:"Charlotte Pipe", part:"PVC D3034 G-series",  search:"SDR 35 gasketed coupling D3034 sewer" },
      { desc:"SDR 35 Solvent Weld Coupling",         brand:"Charlotte Pipe", part:"PVC 07701 series",    search:"Charlotte Pipe SDR 35 solvent weld coupling" },
    ],
    steps:[
      "GASKETED: Lubricate spigot and gasket with approved lubricant only",
      "Push spigot straight into bell to the insertion mark — do not rock",
      "Verify gasket has not rolled — inspect through bell gap if possible",
      "SOLVENT WELD: Cut square, deburr, bevel, prime with purple primer",
      "Apply heavy-body PVC cement — double coat on pipe OD",
      "Insert with 1/4 turn, hold 30 seconds, wipe excess",
    ],
    code:"ASTM D3034. Non-pressure only. Max 4 PSI exfiltration test. Gravity sewer use only.",
    notes:"Gasketed is faster and dominant on 4\"+ sewer work. Solvent weld for smaller fittings and branch connections. SDR 35 ODs are NOT the same as Schedule 40 — fittings are not interchangeable.",
  },

  [compatKey("SDR 35 Sewer","Cast Iron")]: {
    level:"ADAPTER",
    summary:"Fernco or Mission band coupling — the standard transition at cleanouts and manholes.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling SDR 35 × cast iron", brand:"Fernco",  part:"1056-series", search:"Fernco SDR 35 cast iron sewer flexible coupling" },
      { desc:"Mission no-hub band coupling",                brand:"Mission", part:"MC-series",   search:"Mission band coupling SDR 35 cast iron sewer" },
    ],
    steps:[
      "Clean both pipe ends — remove scale, tar, and debris",
      "Slide Fernco or Mission coupling over cast iron end",
      "Insert SDR 35 pipe into other end of coupling",
      "Tighten clamps alternately to 60 in-lb (4\"), 80 in-lb (6\"+)",
      "Verify pipe is fully seated — no gap inside coupling",
    ],
    code:"CISPI 310 rated couplings required underground. ASTM C1440.",
    notes:"Most common at manhole connections and building cleanouts. SDR 35 OD (4\" = 4.215\") differs from cast iron — use appropriately sized Fernco.",
  },

  [compatKey("SDR 35 Sewer","ABS")]: {
    level:"ADAPTER",
    summary:"Fernco flexible coupling for drain transitions. Common where old ABS meets new sewer lateral.",
    dielectric:false,
    fittings:[
      { desc:"Fernco flexible coupling SDR 35 × ABS", brand:"Fernco", part:"1056-series", search:"Fernco SDR 35 ABS transition coupling" },
    ],
    steps:[
      "Use Fernco flexible coupling — slide over both pipe ends",
      "Tighten clamps evenly — 60 in-lb for 4\"",
      "SDR 35 OD (4.215\") and ABS OD (4.500\") differ — verify Fernco size covers both",
    ],
    code:"Approved DWV transition. Fernco must span both OD sizes.",
    notes:"Check the Fernco sizing chart — the 4\" SDR 35 OD (4.215\") and 4\" ABS OD (4.500\") are different nominal sizes requiring the correct transition Fernco.",
  },

  [compatKey("SDR 35 Sewer","PVC")]: {
    level:"SPECIAL",
    summary:"Different OD systems — SDR 35 and Schedule 40 PVC are NOT interchangeable despite same nominal size.",
    dielectric:false,
    fittings:[
      { desc:"SDR 35 to Sch 40 IPS adapter",         brand:"Charlotte Pipe", part:"PVC D3034 IPS-ADP", search:"SDR 35 schedule 40 PVC IPS adapter transition" },
      { desc:"Fernco flexible coupling (universal)",  brand:"Fernco",         part:"1056-series",        search:"Fernco SDR 35 schedule 40 PVC transition coupling" },
    ],
    steps:[
      "CRITICAL: Do NOT force SDR 35 fittings onto Schedule 40 pipe or vice versa",
      "4\" SDR 35 OD = 4.215\" · 4\" Sch 40 PVC OD = 4.500\" — completely different",
      "Use a Charlotte Pipe IPS adapter fitting designed for this transition",
      "Or use a Fernco flexible coupling sized for both ODs",
      "Verify the transition fitting is rated for the application (gravity sewer only)",
    ],
    code:"SDR 35 is non-pressure sewer only. Schedule 40 PVC has wider applications. Do not use SDR 35 for pressure or DWV above grade.",
    warning:"The biggest mistake in sewer work — assuming SDR 35 and Schedule 40 share fittings because they share a nominal size. They do not. ODs are different.",
  },

  [compatKey("CSST (Gas)","Black Steel")]: {
    level:"SPECIAL",
    summary:"Licensed gas contractor only — CSST to black steel transition at manifold or appliance.",
    dielectric:false,
    fittings:[
      { desc:"CSST fitting to black steel",        brand:"TracPipe",  part:"FGP-series",     search:"TracPipe CSST black steel fitting" },
      { desc:"Gastite CSST termination fitting",   brand:"Gastite",   part:"DGFT-series",    search:"Gastite CSST termination fitting" },
    ],
    steps:[
      "Licensed gas contractor required for all CSST work",
      "Use manufacturer-specific fittings only — CSST brands are not cross-compatible",
      "TracPipe fittings are not compatible with Gastite and vice versa",
      "Verify bonding conductor is installed per NFPA 54",
      "Pressure test entire system after any work",
    ],
    code:"NFPA 54 · IFGC. Gas contractor certification required. Bonding mandatory.",
    warning:"CSST manufacturer fitting systems are NOT interchangeable. Using the wrong brand fitting is a gas leak waiting to happen.",
  },

  /* ── Missing combinations ── */
  [compatKey("CPVC","Cast Iron")]: {
    level:"ADAPTER", method:"Fernco flexible coupling or mechanical joint",
    summary:"CPVC to cast iron is a common drain/vent transition. Use a Fernco neoprene coupling — do not attempt to thread CPVC into cast iron hubs.",
    steps:["Cut both pipes square","Install Fernco flexible coupling — stainless band clamps","Hand-tighten, then torque per Fernco spec"],
    code:"IPC 705.1 permits mechanical joints at material transitions.",
    notes:"Fernco 1056 series covers most size combinations.",
  },
  [compatKey("PEX","PEX-A")]: {
    level:"ADAPTER", method:"Push-connect or crimp adapter",
    summary:"Generic PEX and PEX-A are chemically identical cross-linked polyethylene. Use SharkBite push-connect or a crimp coupling. Cannot use expansion fittings on the non-PEX-A end.",
    steps:["SharkBite push-connect fitting works on both ends","Or crimp coupling with copper rings on both ends","Do NOT use expansion fitting on generic PEX end"],
    code:"ASTM F1960 for PEX-A end only.",
    notes:"Check pipe markings — ASTM F1960 = PEX-A, F1807/F2080 = PEX-B/C.",
  },
  [compatKey("PEX","PEX-B")]: {
    level:"DIRECT", method:"Crimp or push-connect — same system",
    summary:"Generic PEX and PEX-B use the same crimp/clamp fitting system. They are functionally interchangeable for fitting purposes.",
    steps:["Standard crimp fitting works on both","Stainless clamp rings work on both","SharkBite push-connect works on both"],
    code:"ASTM F1807 crimp or ASTM F2080 clamp.",
    notes:"Generic PEX tubing sold at supply houses is typically PEX-B or PEX-C.",
  },
  [compatKey("ABS","CPVC")]: {
    level:"AVOID", method:"Fernco coupling only — do not solvent weld",
    summary:"ABS and CPVC cannot be solvent welded together — different chemistries. Use a Fernco mechanical coupling only.",
    steps:["Never apply solvent cement across ABS-CPVC joint","Use Fernco flexible coupling","Or remove enough pipe to install proper transition fittings"],
    code:"Manufacturer instructions prohibit cross-material solvent welding.",
    warning:"ABS cement and CPVC cement are NOT interchangeable. Cross-welding creates a weak joint that will fail under pressure or temperature cycling.",
  },
  [compatKey("ABS","PEX-A")]: {
    level:"ADAPTER", method:"Threaded or push-connect adapter",
    summary:"ABS drain/vent to PEX supply — different systems that rarely connect directly. Use threaded adapters or push-connect at the transition point.",
    steps:["Typically not a direct connection — ABS is drain/vent, PEX is supply","If a transition is needed: threaded plastic adapter + push-connect","Never thread metal male into ABS female"],
    code:"IPC 705.1 at material transitions.",
    notes:"Verify you actually need this connection — supply and drain systems rarely share fittings.",
  },
  [compatKey("ABS","PEX-B")]: {
    level:"ADAPTER", method:"Same as ABS × PEX-A",
    summary:"ABS and PEX-B connection — use mechanical or threaded adapters only. See ABS × PEX-A guidance.",
    steps:["Threaded plastic adapter if threaded connection needed","Never metal male into ABS female — stress cracking"],
    code:"IPC 705.1.",
    notes:"ABS is typically drain/vent. PEX-B is supply. Verify the connection is needed.",
  },
  [compatKey("ABS","Black Steel")]: {
    level:"AVOID", method:"No direct connection — incompatible systems",
    summary:"ABS is a drain/vent plastic. Black steel is a gas/steam pipe. These systems should never be directly connected.",
    steps:["Do not connect these materials","If a gas line passes through an ABS drain opening, maintain separation","Consult code for sleeve and sealing requirements"],
    code:"NFPA 54 prohibits gas piping connections to drain systems.",
    warning:"Black steel is for gas. ABS is for drain/vent. Direct connection is a code violation and a safety hazard.",
  },
  [compatKey("Black Steel","CPVC")]: {
    level:"AVOID", method:"No direct connection",
    summary:"Black steel is gas piping. CPVC is not approved for gas. These systems must never be directly connected.",
    steps:["Do not connect black steel gas lines to CPVC","If transitioning from gas to water: use approved dielectric fittings at meter/appliance","CPVC is not rated for gas service"],
    code:"IFGC 403.4 — gas piping material requirements.",
    warning:"CPVC is NOT approved for gas piping. Never connect black steel gas lines to CPVC.",
  },
  [compatKey("Black Steel","PVC")]: {
    level:"AVOID", method:"No direct connection",
    summary:"Black steel is gas piping. PVC is not approved for gas service. These must never be directly connected.",
    steps:["Do not connect black steel to PVC","PVC is not rated for gas service at any pressure"],
    code:"IFGC 403.4.",
    warning:"PVC is NOT approved for gas piping. Never connect black steel gas lines to PVC.",
  },
  [compatKey("Black Steel","PEX-A")]: {
    level:"AVOID", method:"No direct connection — wrong application",
    summary:"Black steel is gas piping. PEX-A is not approved for gas. Do not connect these systems.",
    steps:["PEX is not approved for gas service in most jurisdictions","Use only black steel, CSST, or copper for gas lines"],
    code:"IFGC 403.4 — PEX not listed for gas.",
    warning:"PEX is NOT approved for gas piping. Never connect to black steel gas lines.",
  },
  [compatKey("Black Steel","PEX-B")]: {
    level:"AVOID", method:"No direct connection — wrong application",
    summary:"Black steel is gas piping. PEX-B is not approved for gas. Do not connect these systems.",
    steps:["PEX-B is not approved for gas service","Use only black steel, CSST, or copper for gas"],
    code:"IFGC 403.4.",
    warning:"PEX is NOT approved for gas piping.",
  },
  [compatKey("Black Steel","PEX")]: {
    level:"AVOID", method:"No direct connection",
    summary:"PEX is not approved for gas service. Black steel is for gas. Do not connect these.",
    steps:["Do not use PEX for gas piping","Consult a licensed gas fitter for any gas line work"],
    code:"IFGC 403.4.",
    warning:"PEX is NOT approved for gas piping in any form.",
  },
  [compatKey("Black Steel","Cast Iron")]: {
    level:"ADAPTER", method:"Threaded mechanical coupling",
    summary:"Both are ferrous metals. Black steel (gas) rarely connects to cast iron (drain) intentionally. If needed — threaded mechanical coupling with appropriate gasket.",
    steps:["Use a threaded mechanical coupling","Apply pipe dope or PTFE tape on all threaded connections","Verify application — gas and drain systems should not share connections"],
    code:"Verify per application — gas vs drain rules differ.",
    notes:"This connection is unusual. Confirm you are not accidentally crossing gas and drain systems.",
  },
  [compatKey("Cast Iron","PEX-A")]: {
    level:"ADAPTER", method:"Fernco flexible coupling",
    summary:"Cast iron drain to PEX-A supply is an unusual transition. If needed at a drain connection, use a Fernco coupling. For supply connections, use a threaded brass adapter.",
    steps:["Drain connection: Fernco neoprene coupling","Supply connection: brass male adapter + SharkBite or expansion fitting","Cast iron hub: use lead-free oakum or mechanical joint"],
    code:"IPC 705.1 at material transitions.",
    notes:"Verify the application — cast iron is typically drain, PEX-A is supply.",
  },
  [compatKey("Cast Iron","PEX-B")]: {
    level:"ADAPTER", method:"Fernco flexible coupling or threaded brass adapter",
    summary:"Cast iron to PEX-B — Fernco coupling for drain connections, threaded brass adapter for supply connections.",
    steps:["Fernco for drain/vent transitions","Brass threaded adapter + crimp fitting for supply transitions"],
    code:"IPC 705.1.",
    notes:"Same guidance as Cast Iron × PEX-A.",
  },
  [compatKey("Cast Iron","Galvanized Steel")]: {
    level:"ADAPTER", method:"Mechanical coupling — no threading cast iron",
    summary:"Cast iron (drain) to galvanized (supply/drain) transition. Use a Fernco or mechanical coupling — do not attempt to thread into cast iron hubs.",
    steps:["Use Fernco flexible coupling","No-hub coupling for drain transitions","Threaded galvanized adapter if cast iron has threaded outlet"],
    code:"IPC 705.1.",
    notes:"Cast iron drain hubs are not threaded — use no-hub couplings only.",
  },

};

/* ── Lookup function ── */
function getCompat(matA, matB) {
  const key = compatKey(matA, matB);
  return COMPAT_DB[key] || null;
}

/* ═══════════════════════════════════════════════════════════
   COMPAT SCREEN
═══════════════════════════════════════════════════════════ */
function CompatScreen({screen, navigate}) {
  const [matA, setMatA] = useState("Copper");
  const [matB, setMatB] = useState("PEX");
  const [sizeA, setSizeA] = useState('¾"');
  const [sizeB, setSizeB] = useState('¾"');

  const compat = getCompat(matA, matB);
  const lvl    = compat ? COMPAT_LEVEL[compat.level] : null;
  const same   = matA === matB;

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"var(--blk)"}}>
      <ScreenHeader title="Connect"/>

      <div className="scroll" style={{flex:1,minHeight:0,padding:"16px 16px 28px"}}>

        {/* Intro */}
        <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
          border:"1px solid var(--bdr2)",borderLeft:"4px solid var(--grn)",
          padding:"11px 14px",marginBottom:16}}>
          <BC c="Pipe compatibility checker"
            s={{fontSize:16,fontWeight:900,color:"var(--wht)",display:"block",marginBottom:3}}/>
          <div className="body-muted">
            Select two pipe materials to see exactly how to connect them — fittings, steps, dielectric requirements, and code notes.
          </div>
        </div>

        {/* Pipe A + B selectors side by side */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",
          gap:8,alignItems:"start",marginBottom:16}}>

          {/* Pipe A */}
          <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
            border:"1px solid var(--bdr2)",padding:"12px 12px 10px"}}>
            <BC c="Pipe A" s={{fontSize:14,fontWeight:800,color:"var(--w50)",
              letterSpacing:".1em",display:"block",marginBottom:8}}/>
            <select value={matA} onChange={e=>setMatA(e.target.value)}
              style={{width:"100%",padding:"9px 8px",borderRadius:"var(--r)",
                background:"var(--blk3)",border:"1px solid var(--bdr2)",
                color:"var(--wht)",fontSize:15,outline:"none",marginBottom:8,
                fontFamily:"'Barlow',sans-serif"}}>
              {COMPAT_MATERIALS.map(m=>(
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={sizeA} onChange={e=>setSizeA(e.target.value)}
              style={{width:"100%",padding:"8px 8px",borderRadius:"var(--r)",
                background:"var(--blk3)",border:"1px solid var(--bdr2)",
                color:"var(--wht)",fontSize:16,outline:"none",
                fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>
              {NOMINAL_SIZES.map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Arrow */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
            paddingTop:28}}>
            <div style={{fontSize:24,color:"var(--w25)"}}>⇄</div>
          </div>

          {/* Pipe B */}
          <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
            border:"1px solid var(--bdr2)",padding:"12px 12px 10px"}}>
            <BC c="Pipe B" s={{fontSize:14,fontWeight:800,color:"var(--w50)",
              letterSpacing:".1em",display:"block",marginBottom:8}}/>
            <select value={matB} onChange={e=>setMatB(e.target.value)}
              style={{width:"100%",padding:"9px 8px",borderRadius:"var(--r)",
                background:"var(--blk3)",border:"1px solid var(--bdr2)",
                color:"var(--wht)",fontSize:15,outline:"none",marginBottom:8,
                fontFamily:"'Barlow',sans-serif"}}>
              {COMPAT_MATERIALS.map(m=>(
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={sizeB} onChange={e=>setSizeB(e.target.value)}
              style={{width:"100%",padding:"8px 8px",borderRadius:"var(--r)",
                background:"var(--blk3)",border:"1px solid var(--bdr2)",
                color:"var(--wht)",fontSize:16,outline:"none",
                fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>
              {NOMINAL_SIZES.map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Size mismatch warning */}
        {sizeA !== sizeB && compat && compat.level !== "AVOID" && compat.level !== "ILLEGAL" && (
          <div style={{padding:"9px 12px",borderRadius:"var(--r)",
            background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",
            marginBottom:12}}>
            <BC c={`⚠ Size mismatch: ${sizeA} × ${sizeB}`}
              s={{fontSize:15,fontWeight:800,color:"var(--yel)",display:"block",marginBottom:3}}/>
            <div style={{fontSize:15,color:"var(--w50)",lineHeight:1.4}}>
              A reducing fitting or coupling is required in addition to the transition fitting below.
              Specify {sizeA}×{sizeB} when ordering.
            </div>
          </div>
        )}

        {/* No result found */}
        {!compat && (
          <div style={{padding:"20px",textAlign:"center",
            background:"var(--blk2)",borderRadius:"var(--r)",
            border:"1px solid var(--bdr2)"}}>
            <BC c="Combination not in database"
              s={{fontSize:18,fontWeight:800,display:"block",marginBottom:6,color:"var(--w50)"}}/>
            <div style={{fontSize:15,color:"var(--w25)"}}>
              Use a Fernco flexible coupling as a universal fallback for drain connections,
              or consult a licensed plumber for unusual material combinations.
            </div>
          </div>
        )}

        {/* Result */}
        {compat && lvl && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>

            {/* Level badge + summary */}
            <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
              border:`1px solid ${lvl.color}44`,
              borderLeft:`4px solid ${lvl.color}`,
              padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <BC c={lvl.icon} s={{fontSize:24}}/>
                <BC c={lvl.label} s={{fontSize:19,fontWeight:900,color:lvl.color}}/>
                {compat.dielectric&&(
                  <div style={{marginLeft:"auto",padding:"3px 10px",borderRadius:2,
                    background:"rgba(239,68,68,.15)",
                    border:"1px solid rgba(239,68,68,.35)"}}>
                    <BC c="⚡ DIELECTRIC REQUIRED"
                      s={{fontSize:14,fontWeight:900,color:"#ef4444",letterSpacing:".08em"}}/>
                  </div>
                )}
              </div>
              <div style={{fontSize:16,color:"var(--w80)",lineHeight:1.6}}>
                {compat.summary}
              </div>
            </div>

            {/* Dielectric union callout */}
            {compat.dielectric&&(
              <div style={{padding:"12px 14px",borderRadius:"var(--r)",
                background:"rgba(239,68,68,.08)",
                border:"2px solid rgba(239,68,68,.35)"}}>
                <BC c="⚡ Dielectric Union Required"
                  s={{fontSize:16,fontWeight:900,color:"#ef4444",display:"block",marginBottom:6}}/>
                <div style={{fontSize:15,color:"rgba(255,180,180,.85)",lineHeight:1.6}}>
                  {matA} and {matB} are dissimilar metals. Direct contact creates a galvanic cell
                  that corrodes both metals over time. A dielectric union contains a plastic
                  insulating sleeve that breaks electrical contact between the two metals.
                  This is required by IPC Section 605.13.1.
                </div>
              </div>
            )}

            {/* Warning */}
            {compat.warning&&(
              <div style={{padding:"10px 14px",borderRadius:"var(--r)",
                background:"rgba(239,68,68,.08)",
                border:"1px solid rgba(239,68,68,.3)"}}>
                <BC c="⚠ Warning" s={{fontSize:15,fontWeight:900,color:"#ef4444",
                  display:"block",marginBottom:4}}/>
                <div style={{fontSize:15,color:"rgba(255,180,180,.85)",lineHeight:1.5}}>
                  {compat.warning}
                </div>
              </div>
            )}

            {/* Fitting options */}
            {compat.fittings?.length > 0 && (
              <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
                border:"1px solid var(--bdr2)",overflow:"hidden"}}>
                <div style={{padding:"10px 14px 6px"}}>
                  <BC c="Fitting Options" s={{fontSize:14,fontWeight:800,
                    color:"var(--w50)",letterSpacing:".12em",textTransform:"uppercase"}}/>
                </div>
                {compat.fittings.map((f,i)=>{
                  const bc = BRAND_COLORS[f.brand]||"#888";
                  return (
                    <div key={i} style={{padding:"11px 14px",
                      borderTop:"1px solid var(--bdr)",
                      background:i===0?"var(--blk3)":"var(--blk2)"}}>
                      <div style={{display:"flex",alignItems:"flex-start",
                        justifyContent:"space-between",gap:10,marginBottom:6}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",
                            gap:6,marginBottom:4,flexWrap:"wrap"}}>
                            <span style={{fontSize:14,padding:"2px 7px",borderRadius:2,
                              background:`${bc}22`,color:bc,
                              fontFamily:"'Barlow Condensed',sans-serif",
                              fontWeight:800,letterSpacing:".06em"}}>
                              {f.brand}
                            </span>
                            <Mono c={f.part} s={{fontSize:15,color:"var(--w50)"}}/>
                          </div>
                          <BC c={f.desc} s={{fontSize:16,fontWeight:700,color:"var(--wht)"}}/>
                        </div>
                      </div>
                      {/* Retailer links */}
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                        {RETAILERS.map(r=>(
                          <a key={r.id}
                            href={r.url(f.search)}
                            target="_blank" rel="noopener noreferrer"
                            style={{padding:"5px 10px",borderRadius:2,
                              background:r.sponsored?"rgba(201,121,60,.1)":"var(--blk4)",
                              border:`1px solid ${r.sponsored?"rgba(201,121,60,.3)":"var(--bdr)"}`,
                              textDecoration:"none",
                              display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:6,height:6,borderRadius:"50%",
                              background:r.color,flexShrink:0}}/>
                            <BC c={r.short} s={{fontSize:14,fontWeight:800,
                              color:r.sponsored?"var(--cop)":"var(--w50)",
                              letterSpacing:".04em"}}/>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step-by-step */}
            {compat.steps?.length > 0 && (
              <div style={{background:"var(--blk2)",borderRadius:"var(--r)",
                border:"1px solid var(--bdr2)",padding:"12px 14px"}}>
                <BC c="Step-by-step" s={{fontSize:14,fontWeight:800,
                  color:"var(--w50)",letterSpacing:".12em",textTransform:"uppercase",
                  display:"block",marginBottom:10}}/>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {compat.steps.map((step,i)=>(
                    <div key={i} style={{display:"flex",gap:10,
                      background:"var(--blk3)",borderRadius:"var(--r)",
                      padding:"9px 11px",alignItems:"flex-start"}}>
                      <BC c={String(i+1).padStart(2,"0")}
                        s={{fontSize:15,fontWeight:900,color:lvl.color,
                          flexShrink:0,paddingTop:1}}/>
                      <div style={{fontSize:16,color:"var(--w80)",lineHeight:1.6}}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code note */}
            {compat.code&&(
              <div style={{padding:"10px 14px",borderRadius:"var(--r)",
                background:"rgba(74,158,255,.08)",
                border:"1px solid rgba(74,158,255,.2)"}}>
                <BC c="Code Reference" s={{fontSize:14,fontWeight:800,
                  color:"#4a9eff",letterSpacing:".1em",textTransform:"uppercase",
                  display:"block",marginBottom:5}}/>
                <div style={{fontSize:16,color:"var(--w80)",lineHeight:1.6}}>
                  {compat.code}
                </div>
              </div>
            )}

            {/* Notes */}
            {compat.notes&&(
              <div style={{padding:"10px 14px",borderRadius:"var(--r)",
                background:"var(--blk2)",border:"1px solid var(--bdr2)"}}>
                <BC c="Field Notes" s={{fontSize:14,fontWeight:800,
                  color:"var(--w50)",letterSpacing:".1em",textTransform:"uppercase",
                  display:"block",marginBottom:5}}/>
                <div style={{fontSize:15,color:"var(--w80)",lineHeight:1.6}}>
                  {compat.notes}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <NavBar active="connect" navigate={navigate}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME SCREEN — Christy's Red Hot inspired layout
   Bold. Industrial. Direct. No fluff.
═══════════════════════════════════════════════════════════ */
/* ─── HomeTile — tactile 3D press button ────────────────────── */
function HomeTile({tile, navigate}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={() => navigate(tile.id)}
      aria-label={tile.label}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display:"flex",
        alignItems:"center",
        gap:16,
        padding:"0 18px",
        borderRadius:"var(--rm)",
        cursor:"pointer",
        textAlign:"left",
        width:"100%",
        height:"100%",
        background: pressed ? "var(--blk3)" : "var(--blk2)",
        border:`1px solid ${pressed ? "var(--cop)" : "var(--bdr)"}`,
        transition:"background .1s, border-color .1s",
        minHeight:"unset",
      }}>
      <div style={{color: pressed ? "var(--cop)" : "var(--w80)",flexShrink:0,
        transition:"color .1s",display:"flex"}}>{tile.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <BC c={tile.label} s={{
          fontSize:21,
          fontWeight:900,
          color:"var(--wht)",
          display:"block",
          marginBottom:3,
          letterSpacing:".05em",
        }}/>
        <div style={{fontSize:14,color:"var(--w50)",lineHeight:1.35}}>{tile.sub}</div>
      </div>
      <BC c="›" s={{fontSize:26,color:"var(--w25)",flexShrink:0,lineHeight:1}}/>
    </button>
  );
}


function HomeScreen({navigate, screen, trial, onBuy}) {

  const TILES = [
    {
      id:"connect",
      label:"COMPATIBILITY",
      sub:"Can these two pipes connect?",
      icon:(
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h8M8 12h8M8 18h8"/>
          <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
          <path d="M20 9l-3 3 3 3"/>
        </svg>
      ),
      color:"#4a9eff",
      accent:"rgba(74,158,255,.15)",
    },
    {
      id:"fittings",
      label:"FITTINGS",
      sub:"Part numbers + where to buy",
      icon:(
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="16" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
      ),
      color:"#f59e0b",
      accent:"rgba(245,158,11,.15)",
    },
    {
      id:"reference",
      label:"REFERENCE",
      sub:"OD table · solvents · tips · danger",
      icon:(
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <path d="M3 9h18M3 15h18M9 3v18"/>
        </svg>
      ),
      color:"#a78bfa",
      accent:"rgba(167,139,250,.15)",
    },
  ];

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",
      background:"var(--blk)",overflow:"hidden"}}>

      {/* ── HEADER — spec plate ── */}
      <div style={{flexShrink:0,background:"var(--blk)"}}>
        <div style={{height:2,background:"var(--cop)"}}/>
        {trial && <TrialBanner trial={trial} onBuy={onBuy}/>}
        <div style={{padding:"16px 16px 13px",borderBottom:"1px solid var(--bdr)"}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <svg viewBox="0 0 64 96" style={{width:33,height:50,flexShrink:0}} aria-hidden="true">
              <line x1="14" y1="8" x2="14" y2="88" stroke="var(--cop)" strokeWidth="13" strokeLinecap="round"/>
              <path d="M14 14 C44 14 55 26 55 36 C55 46 44 58 14 58" fill="none" stroke="var(--cop)" strokeWidth="13" strokeLinecap="round"/>
            </svg>
            <div style={{minWidth:0}}>
              <BC c="POCKET PLUMBER™" s={{fontSize:29,fontWeight:900,
                letterSpacing:".02em",color:"var(--wht)",display:"block",lineHeight:1}}/>
              <Mono c="CONTRACTOR-GRADE FIELD REFERENCE" s={{fontSize:11,
                color:"var(--w50)",letterSpacing:".13em",display:"block",marginTop:7}}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── MENU GRID ── */}
      <div style={{flex:1,minHeight:0,
        padding:"12px 12px 10px",display:"flex",flexDirection:"column",gap:10}}>

        {/* Tool rows — fill available height */}
        <div style={{flex:1,minHeight:0,display:"grid",
          gridTemplateRows:"repeat(3, minmax(84px, 1fr))",gap:10}}>
          {TILES.map(tile=>(
            <HomeTile key={tile.id} tile={tile} navigate={navigate}/>
          ))}
        </div>

        {/* Minimal version badge */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"6px 10px",borderRadius:"var(--r)",
          background:"var(--blk2)",border:"1px solid var(--bdr)"}}>
          <BC c="CONTRACTOR GRADE · FIELD REFERENCE"
            s={{fontSize:12,fontWeight:800,color:"var(--w25)",letterSpacing:".1em"}}/>
          <Mono c="REV 2.0"
            s={{fontSize:12,color:"var(--w25)",fontWeight:600}}/>
        </div>

      </div>

      <NavBar active="home" navigate={navigate}/>
    </div>
  );
}
