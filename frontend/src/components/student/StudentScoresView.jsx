import { S, Chip } from "../shared";
import { getGrade, gradeChipStyle } from "../../utils/helpers";
import { GH_SUBJECTS } from "../../data/schools";

export default function StudentScoresView({ scores }) {
  const subjects = GH_SUBJECTS.filter(s => scores[s] != null);
  if (!subjects.length) return (
    <div style={{ textAlign:"center", padding:40, background: "linear-gradient(180deg,#071130 0%,#15306b 100%)", borderRadius:12, border: "1px solid rgba(96,165,250,0.12)" }}>
      <h2 style={{ color:"#60a5fa", marginBottom:8 }}>No Scores Yet</h2>
      <p style={{ color:"#cbd5e1" }}>Your teacher has not entered scores yet.</p>
    </div>
  );
  return (
    <div>

      <h2 style={S.pageH}>My Scores</h2>
      <div style={{ background: "linear-gradient(180deg,#071130 0%,#15306b 100%)", borderRadius:12, padding:20, border: "1px solid rgba(96,165,250,0.12)" }}>
        {subjects.map(sub => {
          const v  = scores[sub];
          const gs = gradeChipStyle(v);
          return (
            <div key={sub} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ flex:1, fontSize:13, fontWeight:600, color: "#e6eef8" }}>{sub}</div>
              <span style={{ fontSize:13, fontWeight:700, color:"#cbd5e1", minWidth:40, textAlign:"right" }}>{v}%</span>
              <Chip label={getGrade(v)} bg={gs.bg} color={gs.col}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}
