import { useState } from "react";
import { S, Chip } from "../shared";
import AdminCard from "./AdminCard";
import { getGrade, gradeChipStyle } from "../../utils/helpers";
import { GH_SUBJECTS } from "../../data/schools";

export default function ScoresTab({ students, scores, onSave }) {
  const [selId, setSelId]   = useState("");
  const [local, setLocal]   = useState({});
  const [saved, setSaved]   = useState(false);

  const select = (id) => { setSelId(id); setLocal({ ...scores[id] }); setSaved(false); };
  const save = () => { onSave(selId, local); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <AdminCard title="Enter Test Scores">

            <div style={{ marginBottom:20 }}>
        <label style={S.label}>Select Student</label>
        <select style={{ ...S.input, maxWidth:380 }} value={selId} onChange={e => select(e.target.value)}>
          <option value="">-- Choose a student --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.indexNumber})</option>)}
        </select>
      </div>
      {selId && (
        <div style={{ ...S.card, marginTop:16 }}>
          {saved && <div style={S.success}><span style={{marginRight:4}}>✅</span>Scores saved!</div>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {GH_SUBJECTS.map(sub => {
              const val = local[sub] ?? "";
              const gs = val !== "" ? gradeChipStyle(val) : null;
              return (
                <div key={sub} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <label style={{ ...S.label, flex:1, marginBottom:0, fontSize:12 }}>{sub}</label>
                  <input type="number" min={0} max={100} style={{ ...S.input, width:70 }} value={val}
                    onChange={e => setLocal(p => ({ ...p, [sub]: Number(e.target.value) }))}/>
                  {gs && <Chip label={getGrade(val)} bg={gs.bg} color={gs.col}/>}
                </div>
              );
            })}
          </div>
          <button style={{ ...S.btnPrimary, marginTop:18 }} onClick={save}>Save Scores</button>
        </div>
      )}
    </AdminCard>
  );
}
