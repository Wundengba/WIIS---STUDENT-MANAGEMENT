// Shared inline-style tokens used across the app
const PRIMARY = "#1d4ed8"; // used below to avoid circular reference
export const S = {
  colors: { primary: PRIMARY, indigo: "#6366f1", purple: "#7c3aed", green: "#10b981", blue: "#2563eb", teal: "#14b8a6", yellow: "#f59e0b", red: "#ef4444", muted: "#475569", slate: "#64748b", white: "#ffffff" },
  card:       { background:"linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))", borderRadius:"clamp(12px, 2vw, 16px)", padding:"clamp(16px, 3vw, 24px)", boxShadow:"0 6px 18px rgba(2,6,23,0.55)", borderLeft:"4px solid rgba(29,78,216,0.14)", color:"#e6eef8" },
  cardH:      { margin:"0 0 16px", fontSize:"clamp(14px, 2vw, 16px)", fontWeight:700, color:"#2563eb" },
  pageH:      { margin:"0 0 24px", fontSize:"clamp(18px, 3vw, 24px)", fontWeight:800, color:"#e6eef8", padding:"clamp(6px, 1vw, 10px) clamp(12px, 2vw, 20px)", borderRadius:"clamp(6px, 1vw, 10px)", background:"rgba(29,78,216,0.24)" },
  input:      { display:"block", width:"100%", padding:"clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)", border:"1px solid #374151", borderRadius:"clamp(6px, 1vw, 8px)", fontSize:"clamp(13px, 2vw, 14px)", outline:"none", boxSizing:"border-box", background:"rgba(255,255,255,0.04)", color:"#000", fontFamily:"inherit", minHeight:"44px" },
  label:      { display:"block", fontSize:"clamp(11px, 1.5vw, 13px)", fontWeight:600, color:"#cbd5e1", marginBottom:"clamp(6px, 1vw, 8px)" },
  btnPrimary: { padding:"clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)", background:"#1d4ed8", color:"#000", border:"none", borderRadius:"clamp(6px, 1vw, 8px)", cursor:"pointer", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:700, fontFamily:"inherit", minHeight:"44px", transition:"all 0.2s ease" },
  btnSec:     { padding:"clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)", background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:"clamp(6px, 1vw, 8px)", cursor:"pointer", fontSize:"clamp(11px, 1.5vw, 13px)", fontWeight:600, fontFamily:"inherit", whiteSpace:"nowrap", minHeight:"40px", transition:"all 0.2s ease" },
  btnGhost:   { padding:"clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)", background:"white", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:"clamp(6px, 1vw, 8px)", cursor:"pointer", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:600, fontFamily:"inherit", minHeight:"44px", transition:"all 0.2s ease" },
  btnSuccess: { padding:"clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)", background:"#10b981", color:"white", border:"none", borderRadius:"clamp(6px, 1vw, 8px)", cursor:"pointer", fontSize:"clamp(11px, 1.5vw, 13px)", fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap", minHeight:"40px", transition:"all 0.2s ease" },
  btnDanger:  { padding:"clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)", background:"#ef4444", color:"white", border:"none", borderRadius:"clamp(6px, 1vw, 8px)", cursor:"pointer", fontSize:"clamp(11px, 1.5vw, 13px)", fontWeight:700, fontFamily:"inherit", whiteSpace:"nowrap", minHeight:"40px", transition:"all 0.2s ease" },
  avatar:     { width:"clamp(28px, 5vw, 36px)", height:"clamp(28px, 5vw, 36px)", borderRadius:"clamp(5px, 1vw, 7px)", background:"#dbeafe", color:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"clamp(12px, 3vw, 16px)", flexShrink:0 },
  btnLogout:  { width:"100%", padding:"clamp(10px, 2vw, 12px) clamp(14px, 2vw, 18px)", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"#cbd5e1", borderRadius:"clamp(6px, 1vw, 8px)", cursor:"pointer", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:600, display:"flex", alignItems:"center", gap:"clamp(6px, 1vw, 8px)", transition:"all 0.2s ease" },
  table:      { width:"100%", borderCollapse:"collapse", fontSize:"clamp(12px, 1.5vw, 14px)", background:"rgba(255,255,255,0.02)", borderRadius:"clamp(10px, 2vw, 14px)", overflow:"hidden", color:"#e6eef8" },
  th:         { padding:"clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)", textAlign:"left", fontWeight:700, color:"#000000", borderBottom:"2px solid rgba(255,255,255,0.08)", whiteSpace:"nowrap", fontSize:"clamp(11px, 1.5vw, 13px)" },
  td:         { padding:"clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)", borderBottom:"1px solid rgba(255,255,255,0.04)", verticalAlign:"middle", color:"#000000" },
  success:    { background:"#dcfce7", border:"1px solid #bbf7d0", color:"#166534", padding:"clamp(10px, 2vw, 12px) clamp(14px, 2vw, 16px)", borderRadius:"clamp(6px, 1vw, 8px)", marginBottom:"clamp(14px, 2vw, 18px)", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:600 },
  // Responsive grid utilities
  gridResponsive: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(clamp(280px, 25vw, 320px), 1fr))", gap:"clamp(16px, 3vw, 24px)" },
  gridCards: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(clamp(240px, 20vw, 300px), 1fr))", gap:"clamp(12px, 2vw, 20px)" },
  gridStats: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(clamp(160px, 15vw, 200px), 1fr))", gap:"clamp(10px, 2vw, 16px)" },
  // Mobile-first responsive containers
  container: { maxWidth:"1200px", margin:"0 auto", padding:"0 clamp(16px, 4vw, 32px)" },
  section: { marginBottom:"clamp(24px, 5vw, 40px)" },
  // Touch-friendly spacing
  touchTarget: { minHeight:"44px", minWidth:"44px" }
};

// derive a few tokens that reference the palette so components can use S.pageH
S.btnPrimary.background = S.colors.primary;

// Make card accents more visible by default (can be overridden per-card)
S.card.borderLeft = `4px solid ${S.colors.primary}`;

export const CAT_COLOR = { A:"#1d4ed8", B:"#0891b2", C:"#6366f1" };
export const CAT_BG    = { A:"#dbeafe", B:"#cffafe", C:"#e0e7ff" };
