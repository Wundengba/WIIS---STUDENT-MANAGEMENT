import { useResponsive } from "../../hooks/useResponsive";
import { S } from "./styles";
import './sidebar.css';

export function TopBar({ title, onMenuClick, isMobile, sidebarOpen }) {
  return (
    <div style={{ background:"#fafafa", padding:"clamp(10px, 2vw, 14px) clamp(12px, 3vw, 24px)", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"clamp(8px, 2vw, 16px)", position:"sticky", top:0, zIndex:30, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"clamp(8px, 2vw, 16px)", minWidth:0 }}>
        <button onClick={onMenuClick} style={{ background:"none", border:"none", cursor:"pointer", padding:"clamp(4px, 1vw, 8px)", flexShrink:0, fontSize:"clamp(18px, 3vw, 22px)", ...S.touchTarget }} aria-label="Toggle menu">☰</button>
        <div style={{ width:"clamp(32px, 6vw, 44px)", height:"clamp(32px, 6vw, 44px)", display:isMobile?"flex":"none", alignItems:"center", justifyContent:"center", background:S.colors.primary, borderRadius:"clamp(6px, 1vw, 10px)", boxShadow:"0 2px 8px rgba(16,24,40,0.12)", color:"white", fontSize:"clamp(10px, 2vw, 14px)", fontWeight:700, textAlign:"center", lineHeight:1, flexDirection:"column" }}>
          <div style={{ fontSize:"clamp(10px, 2vw, 14px)", lineHeight:1 }}>WISS</div>
          <div style={{ fontSize:"clamp(6px, 1vw, 9px)", fontWeight:600, textTransform:"uppercase" }}>SM</div>
        </div>
        <span style={{ margin:0, fontSize:"clamp(16px, 2.8vw, 22px)", fontWeight:700, color:S.colors.primary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", padding:"clamp(3px, 0.5vw, 6px) clamp(8px, 1.5vw, 12px)", borderRadius:"clamp(4px, 0.8vw, 8px)", background:S.colors.primary+"22" }}>{title}</span>
      </div>
    </div>
  );
}

export function AppShell({ tabs, activeTab, setActiveTab, title, unread, notifications, markRead, sidebarOpen, setSidebarOpen, onLogout, children }) {
  const { isMobile, isTablet } = useResponsive();
  const collapsed = !sidebarOpen && (isTablet || isMobile);
  const portalType = title?.includes("Admin") ? "ADMIN" : title?.includes("Student") ? "STUDENT" : "";
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f1f5f9", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", position:"relative" }}>
      {/* overlay on mobile/tablet when sidebar is open */}
      {sidebarOpen && (isMobile || isTablet) && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:40 }}/>
      )}
      {/* sidebar slides in/out */}
      <aside className="app-shell-aside" style={{ width: isMobile ? "280px" : (sidebarOpen ? "260px" : "72px"), flexShrink:0, position: isMobile || isTablet ? "fixed" : "sticky", top:0, left:0, height:"100vh", transform: (isMobile || isTablet) ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "none", transition:"width 0.3s ease, transform 0.3s ease", zIndex:50 }}>
        <div className="sidebar-header" style={{ height: (collapsed ? 64 : 96), padding: 0 }}>
          <div className={"logo-wrap" + (collapsed ? " collapsed" : "")} onClick={() => window.location.reload()} style={{ cursor: 'pointer', width: '100%', height: '100%', margin: 0, borderRadius: 0, padding: 0 }}>
            <div className="sidebar-logo" style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(180deg,var(--sidebar-gradient-start) 0%,var(--sidebar-gradient-end) 100%)", color:"white", fontWeight:900, textAlign:"center", lineHeight:1.1, flexDirection:"column", padding:0, boxShadow:"0 6px 18px rgba(2,6,23,0.55)" }}>
              {collapsed ? (
                <div style={{ fontSize:28, lineHeight:1, fontWeight:900 }}>W</div>
              ) : (
                <>
                  <div style={{ fontSize:32, lineHeight:1, fontWeight:900 }}>WISS</div>
                  <div style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", lineHeight:1.1, marginTop:2 }}>School Management<br/>System</div>
                </>
              )}
            </div>
          </div>
        </div>
        {portalType && !collapsed && <div style={{ padding:"8px 16px", textAlign:"center", fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{portalType} PORTAL</div>}
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); if (isMobile || isTablet) setSidebarOpen(false); }} className={activeTab===t.id? 'active' : ''}>
              <span style={{ fontSize:16, flexShrink:0, display:"inline-flex", alignItems:"center", justifyContent:"center", width:24 }}>{t.icon}</span>
              {!collapsed && <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.label}</span>}
              {!collapsed && t.badge > 0 && <span style={{ background:S.colors.red, color:S.colors.white, fontSize:9, fontWeight:800, padding:"2px 5px", borderRadius:10, flexShrink:0 }}>{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-logout">
          <button onClick={onLogout}>{collapsed?"⎋":"Logout"}</button>
        </div>
      </aside>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflowX:"hidden" }}>
        <TopBar title={tabs.find(t=>t.id===activeTab)?.label||""} onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen}/>
        <main style={{ flex:1, width:"100%", overflowY:"auto", padding:"clamp(16px, 3vw, 32px) clamp(12px, 4vw, 32px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
