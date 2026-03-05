import { useState } from "react";

function PortalCard({ icon, title, desc, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:"white", border:"1px solid #e5e7eb", borderRadius:12, padding:"36px 28px", cursor:"pointer", transition:"all 0.3s ease", transform:hov?"translateY(-8px)":"translateY(0)", boxShadow:hov?"0 24px 48px rgba(0,0,0,0.12)":"0 4px 12px rgba(0,0,0,0.08)", overflow:"hidden", position:"relative", display:"flex", flexDirection:"column", height:"100%", alignItems:"center", textAlign:"center" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:color }}></div>
      <div style={{ fontSize:40, marginBottom:20 }}>{icon}</div>
      <h2 style={{ color:"#1f2937", fontSize:20, fontWeight:700, margin:"0 0 12px", letterSpacing:"-0.5px", minHeight:28 }}>{title}</h2>
      <p style={{ color:"#000", fontSize:14, margin:"0 0 auto", lineHeight:1.6, flex:1 }}>{desc}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:color, color:"#000", padding:"10px 24px", borderRadius:6, fontSize:13, fontWeight:600, transition:"all 0.3s ease", opacity:hov?1:0.9, marginTop:24 }}>Login to Portal →</div>
    </div>
  );
}

export default function Home({ onSelectPortal }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, right:0, width:"40vw", height:"40vw", background:"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, width:"40vw", height:"40vw", background:"radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>
      
      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:900, width:"100%" }}>
        <div style={{ marginBottom:16 }}>
          <span style={{ display:"inline-block", background:"linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%)", color:"#000", padding:"8px 16px", borderRadius:24, fontSize:12, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:0 }}>Comprehensive Student Management System</span>
        </div>
        
        <h1 style={{ color:"#0f172a", fontSize:"clamp(28px,4.5vw,44px)", fontWeight:900, margin:"-12px 0 16px", lineHeight:1.1, letterSpacing:"-1.5px" }}>WUNDEF INTELLIGENT<br/>INTERNET SERVICE</h1>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24, maxWidth:700, margin:"0 auto 48px" }}>
          <PortalCard icon={<span style={{fontSize:32}}>🏫</span>} title="Admin Portal"   desc="Manage enrollments, monitor scores, and review student selections" color="#3b82f6" onClick={() => onSelectPortal("admin")}/>
          <PortalCard icon={<span style={{fontSize:32}}>🎓</span>} title="Student Portal" desc="Access your profile, view scores, and select your preferred institutions" color="#06b6d4" onClick={() => onSelectPortal("student")}/>
        </div>
        
        <p style={{ color:"#64748b", fontSize:12, marginTop:48 }}>© 2026 WUNDEF Intelligent Internet Service. All rights reserved.</p>
      </div>
    </div>
  );
}
