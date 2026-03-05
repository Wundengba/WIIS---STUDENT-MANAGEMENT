import { useState } from "react";
import { S, Chip, CAT_BG, CAT_COLOR } from "../shared";
import AdminCard from "./AdminCard";

export default function PendingTab({ students, schools, selections, onReview }) {
  const [reason, setReason] = useState({});
  const studentList = Array.isArray(students) ? students : [];
  const schoolList = Array.isArray(schools) ? schools : [];
  const selectionsMap = selections || {};
  const pending = studentList.filter(s => selectionsMap[s.id]?.status === "pending");

  if (!pending.length) return (
    <div style={{ ...S.card, textAlign:"center", padding:40 }}>
        <div style={{fontSize:48,marginBottom:8}}>✅</div>
      <h2 style={{ color:"#10b981" }}>All caught up!</h2>
      <p style={{ color:"#64748b" }}>No pending selections to review.</p>
    </div>
  );

  return (
    <AdminCard title={`Pending Selections (${pending.length})`}>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {pending.map(st => {
          const sel = selectionsMap[st.id];
          return (
            <div key={st.id} style={S.card}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ ...S.avatar, width:40, height:40, fontSize:16 }}>{st.fullName ? st.fullName[0] : "?"}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#000000" }}>{st.fullName}</div>
                  <div style={{ fontSize:12, color:"#000000" }}>{st.indexNumber} · Submitted {sel.submittedAt?.split("T")[0]}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:14 }}>
                {sel.choices && sel.choices.map((id, i) => {
                  const sc = schoolList.find(s => String(s.id) === String(id));
                  return (
                    <div key={id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"#f8fafc", borderRadius:7 }}>
                      <div style={{ width:22, height:22, borderRadius:5, background:CAT_COLOR[sc?.category||"C"], color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                      <span style={{ flex:1, fontSize:12, fontWeight:600, color:"#000000" }}>{sc?.name || `School ${id}`}</span>
                      <Chip label={`CAT ${sc?.category||"?"}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
                    </div>
                  );
                })}
              </div>
              <input style={{ ...S.input, marginBottom:10, fontSize:12 }} placeholder="Reason for rejection (optional)…"
                value={reason[st.id]||""} onChange={e => setReason(p => ({ ...p, [st.id]: e.target.value }))}/>
              <div style={{ display:"flex", gap:10 }}>
                <button style={S.btnSuccess} onClick={() => onReview(st.id, "approved", "")}><span style={{marginRight:4}}>✅</span>Approve</button>
                <button style={S.btnDanger}  onClick={() => onReview(st.id, "rejected", reason[st.id]||"")}><span style={{marginRight:4}}>❌</span>Reject</button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}
