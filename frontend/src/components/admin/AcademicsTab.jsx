import { S, Chip } from "../shared";
import { ResponsiveTable, MobileTableRow } from "../shared/ResponsiveTable";
import AdminCard from "./AdminCard";
import { getGrade, gradeChipStyle, average } from "../../utils/helpers";
import { GH_SUBJECTS } from "../../data/schools";

export default function AcademicsTab({ students, scores }) {
  if (!students.length) return <div style={{ ...S.card, textAlign:"center", color:"#94a3b8", padding:32 }}>No students enrolled yet.</div>;

  return (
    <AdminCard title="Academic Records">
      <ResponsiveTable
        headers={["Student", ...GH_SUBJECTS.map(s => s.split(" ")[0]), "Average"]}
        data={students.map(st => {
          const sc = scores[st.id] || {};
          const vals = GH_SUBJECTS.map(s => sc[s]).filter(v => v != null);
          const avg = vals.length ? Math.round(average(vals)) : null;
          return {
            id: st.id,
            cells: [
              <div><div style={{ fontWeight:600, fontSize:12 }}>{st.fullName}</div><div style={{ fontSize:10, color:"#94a3b8" }}>{st.indexNumber}</div></div>,
              ...GH_SUBJECTS.map(s => {
                const v = sc[s];
                return v != null ? <Chip label={`${v}`} bg={gradeChipStyle(v).bg} color={gradeChipStyle(v).col}/> : <span style={{ color:"#e2e8f0" }}>—</span>;
              }),
              avg != null ? <Chip label={`${avg}% ${getGrade(avg)}`} bg={gradeChipStyle(avg).bg} color={gradeChipStyle(avg).col}/> : <span style={{ color:"#94a3b8" }}>—</span>
            ],
            mobileRow: (
              <MobileTableRow
                title={st.fullName}
                subtitle={`Index: ${st.indexNumber}`}
                avatar={<div style={{ width:48, height:48, borderRadius:8, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#94a3b8" }}>{st.fullName ? st.fullName[0] : "?"}</div>}
                details={[
                  { label: "Average Score", value: avg != null ? `${avg}% (${getGrade(avg)})` : "—" },
                  { label: "Subjects Taken", value: vals.length.toString() }
                ]}
                actions={
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 8, width: "100%" }}>
                    {GH_SUBJECTS.map(s => {
                      const v = sc[s];
                      return (
                        <div key={s} style={{ textAlign: "center", padding: "6px", background: "rgba(255,255,255,0.04)", borderRadius: 6 }}>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{s.split(" ")[0]}</div>
                          {v != null ? <Chip label={`${v}`} bg={gradeChipStyle(v).bg} color={gradeChipStyle(v).col} style={{ fontSize: 11, padding: "2px 6px" }}/> : <span style={{ color:"#e2e8f0", fontSize: 11 }}>—</span>}
                        </div>
                      );
                    })}
                  </div>
                }
              />
            )
          };
        })}
        renderRow={(item, index, isMobile) => {
          if (isMobile) {
            return item.mobileRow;
          }
          return item.cells.map((cell, i) => <td key={i} style={S.td}>{cell}</td>);
        }}
      />
    </AdminCard>
  );
}
