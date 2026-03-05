import { S, CAT_COLOR, CAT_BG, Chip } from "../shared";
import { useResponsive } from "../../hooks/useResponsive";
import AdminCard from "./AdminCard";
import { average, getScoreAggregate } from "../../utils/helpers";
import { UsersIcon, BuildingLibraryIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function StatCard({ icon, label, value, sub, color, isMobile }) {
  return (
    <div style={{ ...S.card, display:"flex", alignItems:"center", gap:16, borderLeft: `4px solid ${color}`, background: color+"10", flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left", padding: isMobile ? 20 : 16 }}>
      <div style={{ width:52, height:52, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, color: color, marginBottom: isMobile ? 8 : 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:900, color: color, lineHeight:1, marginBottom: isMobile ? 4 : 0 }}>{value}</div>
        <div style={{ fontSize:12, color:"#0f172a", fontWeight:600, marginBottom: isMobile ? 2 : 0 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:"#334155" }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard({ students, schools, scores, selections }) {
  const { isMobile } = useResponsive();
  // Ensure all inputs are proper arrays
  const studentList = Array.isArray(students) ? students : [];
  const schoolList = Array.isArray(schools) ? schools : [];
  const scoresMap = scores || {};
  const selectionsMap = selections || {};
  
  const pending  = Object.values(selectionsMap).filter(s => s.status === "pending").length;
  const approved = Object.values(selectionsMap).filter(s => s.status === "approved" && s.choices && s.choices.length > 0).length;
  const allScores = studentList.flatMap(st => Object.values(scoresMap[st.id] || {}));
  const avg = allScores.length ? Math.round(average(allScores)) : 0;

  // Calculate top 10 performers
  const topPerformers = studentList.map(st => {
    const stScores = Object.values(scoresMap[st.id] || {});
    const avgScore = stScores.length ? Math.round(average(stScores)) : 0;
    return { ...st, avgScore };
  }).filter(s => s.avgScore > 0).sort((a, b) => b.avgScore - a.avgScore).slice(0, 10);

  // Calculate three most selected schools
  const schoolSelectionCount = {};
  Object.values(selectionsMap).forEach(sel => {
    if (sel.school_id || sel.schoolId) {
      const schoolId = sel.school_id || sel.schoolId;
      schoolSelectionCount[schoolId] = (schoolSelectionCount[schoolId] || 0) + 1;
    }
  });
  const topSchools = Object.entries(schoolSelectionCount)
    .map(([schoolId, count]) => {
      const school = schoolList.find(s => s.id === parseInt(schoolId));
      return { ...school, count };
    })
    .filter(s => s && s.name)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <AdminCard title="Dashboard">
      <div style={{ ...S.gridStats, marginBottom:24 }}>
        <StatCard icon={<UsersIcon className="h-8 w-8" />} label="Students Enrolled" value={studentList.length} color="#3b82f6" isMobile={isMobile}/>
        <StatCard icon={<BuildingLibraryIcon className="h-8 w-8" />} label="Schools Available"  value={schoolList.length} color="#0891b2" isMobile={isMobile}/>
        <StatCard icon={<ClockIcon className="h-8 w-8" />} label="Pending Review"     value={pending}        color="#f59e0b" isMobile={isMobile}/>
        <StatCard icon={<CheckCircleIcon className="h-8 w-8" />} label="Approved Schools Selections"           value={approved}       color="#10b981" isMobile={isMobile}/>
        <StatCard icon={<ChartBarIcon className="h-8 w-8" />} label="Avg Score"          value={avg ? `${avg}% (${getScoreAggregate(avg)})` : "—"} color="#6366f1" isMobile={isMobile}/>
      </div>

      <div style={S.gridCards}>
        <div style={S.card}>
          <h3 style={{...S.cardH, color:"#000000"}}>Top 10 Performers</h3>
          {topPerformers.length === 0
            ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:20 }}>No scores recorded yet</div>
            : topPerformers.map((s, idx) => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ width:32, height:32, borderRadius:50, background:`hsl(${(idx * 30) % 360}, 70%, 60%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{idx + 1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e6eef8" }}>{s.fullName}</div>
                    <div style={{ fontSize:11, color:"#cbd5e1" }}>{s.indexNumber}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#10b981" }}>{s.avgScore}%</div>
                  </div>
                </div>
              ))
          }
        </div>
        <div style={S.card}>
          <h3 style={S.cardH}>Most Selected Schools</h3>
          {topSchools.length === 0
            ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:20 }}>No schools selected yet</div>
            : topSchools.map((sch, idx) => (
                <div key={sch.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:CAT_COLOR[sch.category || "C"], display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{idx + 1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e6eef8" }}>{sch.name}</div>
                    <div style={{ fontSize:11, color:"#cbd5e1" }}>Cat {sch.category || "C"}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#06b6d4" }}>{sch.count}</div>
                  </div>
                </div>
              ))
          }
        </div>
        <div style={S.card}>
          <h3 style={{...S.cardH, color:"#000000"}}>Recent Students</h3>
          {studentList.length === 0
            ? <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:20 }}>No students yet</div>
            : studentList.slice(0,5).map(s => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ ...S.avatar }}>{s.fullName ? s.fullName[0] : "?"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#000000" }}>{s.fullName}</div>
                    <div style={{ fontSize:11, color:"#000000" }}>{s.indexNumber}</div>
                  </div>
                </div>
              ))
          }
        </div>
        <div style={S.card}>
          <h3 style={S.cardH}>Schools by Category</h3>
          {["A","B","C"].map(cat => {
            const count = schoolList.filter(s => s.category === cat).length;
            return (
              <div key={cat} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <Chip label={`CAT ${cat}`} bg={CAT_BG[cat]} color={CAT_COLOR[cat]}/> 
                <div style={{ flex:1, height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${schoolList.length > 0 ? (count/schoolList.length)*100 : 0}%`, background:CAT_COLOR[cat], borderRadius:4 }}/>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:"#1e293b", minWidth:30 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AdminCard>
  );
}
