import { S, Chip, CAT_BG, CAT_COLOR } from "../shared";
import AdminCard from "./AdminCard";
import { ChartBarIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import { average, getScoreAggregate } from "../../utils/helpers";

export default function AnalyticsTab({ students, scores, selections, schools }) {
  const studentList = Array.isArray(students) ? students : [];
  const schoolList = Array.isArray(schools) ? schools : [];
  const scoresMap = scores || {};
  const selectionsMap = selections || {};
  
  const total    = studentList.length;
  const approved = Object.values(selectionsMap).filter(s => s.status === "approved" && s.choices && s.choices.length > 0).length;
  const rejected = Object.values(selectionsMap).filter(s => s.status === "rejected").length;
  const pending  = Object.values(selectionsMap).filter(s => s.status === "pending").length;

  // Score distribution
  const allScores = studentList.flatMap(st => Object.values(scoresMap[st.id] || {}));
  const avg = allScores.length ? Math.round(average(allScores)) : 0;
  const passCount = allScores.filter(s => s >= 50).length;
  const failCount = allScores.filter(s => s < 50).length;

  // Subject-wise performance
  const subjectStats = {};
  studentList.forEach(st => {
    const stScores = scoresMap[st.id] || {};
    Object.entries(stScores).forEach(([subject, score]) => {
      if (!subjectStats[subject]) subjectStats[subject] = [];
      subjectStats[subject].push(score);
    });
  });
  const subjectBreakdown = Object.entries(subjectStats)
    .map(([subject, subScores]) => ({
      subject,
      avg: Math.round(average(subScores)),
      count: subScores.length
    }))
    .sort((a, b) => b.avg - a.avg);

  // Category statistics
  const categoryStats = {};
  Object.values(selectionsMap).forEach(sel => {
    const school = schoolList.find(s => s.id === (sel.school_id || sel.schoolId));
    if (school) {
      const cat = school.category || "C";
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    }
  });

  const scoreDistribution = {
    "1": allScores.filter(s => s >= 90).length,
    "2": allScores.filter(s => s >= 80 && s < 90).length,
    "3": allScores.filter(s => s >= 75 && s < 80).length,
    "4": allScores.filter(s => s >= 70 && s < 75).length,
    "5": allScores.filter(s => s >= 65 && s < 70).length,
    "6": allScores.filter(s => s >= 60 && s < 65).length,
    "7": allScores.filter(s => s >= 55 && s < 60).length,
    "8": allScores.filter(s => s >= 50 && s < 55).length,
    "9": allScores.filter(s => s < 50).length
  };

  // Most-chosen schools
  const choiceCounts = {};
  Object.values(selectionsMap).forEach(sel => {
    if (sel.choices && Array.isArray(sel.choices)) {
      sel.choices.forEach(id => { choiceCounts[id] = (choiceCounts[id] || 0) + 1; });
    }
  });
  const topSchools = Object.entries(choiceCounts)
    .sort((a,b) => b[1]-a[1]).slice(0,10)
    .map(([id, count]) => ({ school: schoolList.find(s => s.id === Number(id)), count }));

  return (
    <AdminCard title="Analytics">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Students", value:total, icon:<UsersIcon className="h-6 w-6" />, col:"#3b82f6" },
          { label:"Approved Schools Selections",       value:approved, icon:<CheckCircleIcon className="h-6 w-6" />, col:"#10b981" },
          { label:"Rejected",       value:rejected, icon:<XCircleIcon className="h-6 w-6" />, col:"#ef4444" },
          { label:"Pending",        value:pending,  icon:<ClockIcon className="h-6 w-6" />, col:"#f59e0b" },
          { label:"Overall Avg",    value:avg?`${avg}% (${getScoreAggregate(avg)})`:"—", icon:<ChartBarIcon className="h-6 w-6" />, col:"#6366f1" },
        ].map(({ label, value, icon, col }) => (
          <div key={label} style={{ ...S.card, display:"flex", alignItems:"center", gap:14, background: col+"10", borderLeft: `4px solid ${col}` }}>
            <div style={{ width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, color: col }}>{icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:900, color: col }}>{value}</div>
              <div style={{ fontSize:11, color:"#0f172a" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:14, marginBottom:20 }}>
        {/* Subject-wise Performance */}
        <div style={S.card}>
          <h3 style={S.cardH}>Subject-wise Performance</h3>
          {subjectBreakdown.length === 0 ? (
            <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:20 }}>No subject data yet</div>
          ) : (
            subjectBreakdown.map(({ subject, avg: subAvg, count }) => (
              <div key={subject} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"#000000" }}>{subject}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#06b6d4" }}>{subAvg}% ({count})</span>
                </div>
                <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(subAvg, 100)}%`, background:`hsl(${subAvg > 70 ? 120 : subAvg > 50 ? 45 : 0}, 70%, 50%)`, borderRadius:3 }}/>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Score Distribution */}
        <div style={S.card}>
          <h3 style={S.cardH}>Score Distribution</h3>
          {allScores.length === 0 ? (
            <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:20 }}>No scores yet</div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:14 }}>
                {Object.entries(scoreDistribution).map(([range, count]) => (
                  <div key={range} style={{ background:"rgba(255,255,255,0.04)", padding:12, borderRadius:8, textAlign:"center", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize:12, color:"#000000", marginBottom:4 }}>{range}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:"#2563eb" }}>{count}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#dbeafe", padding:10, borderRadius:6, marginBottom:12, fontSize:11, color:"#1e40af" }}>
                <div style={{ fontWeight:600, marginBottom:6 }}>Score Range Legend:</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:6 }}>
                  <div>1=90-100, 2=80-89, 3=75-79, 4=70-74</div>
                  <div>5=65-69, 6=60-64, 7=55-59, 8=50-54, 9=&lt;50</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:12, fontSize:12 }}>
                <div style={{ flex:1 }}><span style={{ color:"#10b981", fontWeight:700 }}>Passed:</span> {passCount} ({allScores.length ? Math.round(passCount/allScores.length*100) : 0}%)</div>
                <div style={{ flex:1 }}><span style={{ color:"#ef4444", fontWeight:700 }}>Failed:</span> {failCount} ({allScores.length ? Math.round(failCount/allScores.length*100) : 0}%)</div>
              </div>
            </>
          )}
        </div>

        {/* Category Statistics */}
        <div style={S.card}>
          <h3 style={S.cardH}>Placements by Category</h3>
          {Object.keys(categoryStats).length === 0 ? (
            <div style={{ color:"#94a3b8", fontSize:13, textAlign:"center", padding:20 }}>No placements yet</div>
          ) : (
            ["A", "B", "C"].map((cat, idx) => {
              const count = categoryStats[cat] || 0;
              const total_placements = Object.keys(categoryStats).reduce((acc, c) => acc + categoryStats[c], 0);
              const pct = total_placements ? Math.round(count/total_placements*100) : 0;
              return (
                <div key={cat} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <Chip label={`${idx + 1}`} bg={CAT_BG[cat]} color={CAT_COLOR[cat]}/>
                    <span style={{ fontSize:12, fontWeight:700, color:"#e6eef8" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:CAT_COLOR[cat], borderRadius:3 }}/>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {topSchools.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardH}>Most Chosen Schools</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {topSchools.map(({ school, count }, i) => school && (
              <div key={school.id} style={{ ...S.card, display:"flex", flexDirection:"column", gap:14, borderLeft: `4px solid ${CAT_COLOR[school.category] || S.colors.primary}`, background: (CAT_BG[school.category] || S.colors.primary) }}>
                <span style={{ width:22, fontSize:12, fontWeight:700, color:"#94a3b8", textAlign:"right" }}>#{i+1}</span>
                <div style={{ flex:1, fontSize:13, fontWeight:600, color: CAT_COLOR[school.category] || S.colors.primary }}>{school.name}</div>
                <Chip label={`CAT ${school.category}`} bg={CAT_BG[school.category]} color={CAT_COLOR[school.category]}/>
                <span style={{ fontSize:12, fontWeight:700, color:CAT_COLOR[school.category] || "#1d4ed8", minWidth:28, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminCard>
  );
}
