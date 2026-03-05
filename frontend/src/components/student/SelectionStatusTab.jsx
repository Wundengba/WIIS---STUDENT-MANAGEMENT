import { S, Chip, CAT_BG, CAT_COLOR } from "../shared";
import { statusChipStyle } from "../../utils/helpers";
import SchoolSelectionTab from "./SchoolSelectionTab";

export default function SelectionStatusTab({ student, schools, selection, onSubmit, onClear, regions = [] }) {
  // guard missing student
  if (!student) {
    return <div style={{ padding:20, textAlign:"center" }}>Loading student...</div>;
  }

  // show submitted schools status for pending/rejected/approved
  if (selection && selection.status) {
    // Don't show "approved" status if choices are empty (schools deleted)
    if (selection.status === "approved" && (!selection.choices || selection.choices.length === 0)) {
      return (
        <div>
          <div style={{ ...S.card, marginBottom:16 }}>
            <div style={{ color:"#94a3b8", fontSize:13, padding:20, textAlign:"center" }}>No schools selected</div>
          </div>
          {selection.status !== "approved" && (
            <div style={{ ...S.card, background:"#f0f9ff", borderLeft:"4px solid #0284c7" }}>
              <h3 style={{ ...S.cardH, color:"#0284c7", marginBottom:12 }}>Modify Selection</h3>
              <p style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>You can edit your selection below:</p>
              <SchoolSelectionTab student={student} schools={schools} selections={{ [student?.id]: selection }} onSubmit={onSubmit} onClear={onClear} regions={regions} />
            </div>
          )}
        </div>
      );
    }
    
    const ss    = statusChipStyle(selection.status);
    const icons = { approved:"✅", rejected:"❌", pending:"⏳" };
    const choices = selection.choices || [];
    
    return (
      <div>
        <div style={{ ...S.card, borderLeft:`4px solid ${ss.col}`, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ fontSize:32 }}>{icons[selection.status]}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:ss.col, textTransform:"capitalize" }}>{selection.status}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>Selection Status</div>
            </div>
          </div>
          {selection.reason && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:10, fontSize:13, color:"#dc2626", marginBottom:16 }}>
              <strong>Reason:</strong> {selection.reason}
            </div>
          )}
          {choices.length > 0 && (
            <h3 style={S.cardH}>{selection.status === "approved" ? "Approved Schools" : "Submitted Schools"}</h3>
          )}
          {choices.length === 0 ? (
            <div style={{ color:"#94a3b8", fontSize:13, padding:20, textAlign:"center" }}>No schools selected</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {choices.map((id, i) => {
                const sc = schools && schools.length > 0 ? schools.find(s => String(s.id) === String(id)) : null;
                return (
                  <div key={id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#f8fafc", borderRadius:8 }}>
                    <div style={{ width:24, height:24, borderRadius:5, background:CAT_COLOR[sc?.category||"C"], color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#000000" }}>{sc?.name || `School ${id}`}</div>
                    <Chip label={`CAT ${sc?.category||"?"}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Show edit option for pending/rejected */}
        {selection.status !== "approved" && (
          <div style={{ ...S.card, background:"#f0f9ff", borderLeft:"4px solid #0284c7" }}>
            <h3 style={{ ...S.cardH, color:"#0284c7", marginBottom:12 }}>Modify Selection</h3>
            <p style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>You can edit your selection below:</p>
            <SchoolSelectionTab student={student} schools={schools} selections={{ [student?.id]: selection }} onSubmit={onSubmit} onClear={onClear} regions={regions} />
          </div>
        )}
      </div>
    );
  }

  // No selection yet, show selection UI
  return (
    <SchoolSelectionTab student={student} schools={schools} selections={{ [student?.id]: selection }} onSubmit={onSubmit} onClear={onClear} regions={regions} />
  );
}
