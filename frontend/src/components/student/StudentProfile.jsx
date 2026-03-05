import { Chip, CAT_BG, CAT_COLOR } from "../shared";
import { statusChipStyle, average } from "../../utils/helpers";
import { GH_SUBJECTS } from "../../data/schools";

export default function StudentProfile({ student, scores, selection, schools }) {
  if (!student) return null;

  const formatDOB = (dob) => {
    try {
      const date = new Date(dob);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dob;
    }
  };

  const vals = GH_SUBJECTS.map(s => scores[s]).filter(v => v != null);
  const avgScore = vals.length ? Math.round(average(vals)) : null;
  const ss = statusChipStyle(selection?.status || "none");

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto" }}>
      {/* Hero Section with Photo and Basic Info */}
      <div style={{ 
        background: "linear-gradient(180deg,#071130 0%,#15306b 100%)",
        borderRadius: 16,
        padding: 32,
        border: "1px solid rgba(96,165,250,0.12)",
        marginBottom: 24,
        textAlign: "center"
      }}>
        {/* Photo */}
        <div style={{ marginBottom: 24 }}>
          {student.photoUrl ? (
            <img 
              src={student.photoUrl} 
              alt={student.fullName} 
              style={{ 
                width: 140, 
                height: 140, 
                borderRadius: 14, 
                objectFit: "cover", 
                border: "4px solid rgba(96,165,250,0.95)",
                boxShadow: "0 8px 24px rgba(37,99,235,0.25)"
              }}
            />
          ) : (
            <div style={{
              width: 140,
              height: 140,
              borderRadius: 14,
              background: "linear-gradient(135deg,#60a5fa 0%,#2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 900,
              color: "white",
              margin: "0 auto",
              boxShadow: "0 8px 24px rgba(37,99,235,0.25)"
            }}>
              {student.fullName ? student.fullName[0].toUpperCase() : "?"}
            </div>
          )}
        </div>

        {/* Name and Status */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#ffffff", marginBottom: 8 }}>{student.fullName}</h1>
          <div style={{ fontSize: 14, color: "#ffffff", fontFamily: "monospace", letterSpacing: "1px" }}>Index Number: {student.indexNumber}</div>
        </div>

        {/* Status Badge */}
        {selection && (selection.status !== "approved" || (selection.choices && selection.choices.length > 0)) && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <Chip label={selection.status} bg={ss.bg} color={ss.col} />
          </div>
        )}
      </div>

      {/* Stats Row */}
      {avgScore !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{
            background: "rgba(16,185,129,0.1)",
            borderRadius: 12,
            padding: 20,
            border: "1px solid rgba(16,185,129,0.3)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 11, color: "#cbd5e1", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Overall Average</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#10b981" }}>{avgScore}%</div>
          </div>
          <div style={{
            background: "rgba(59,130,246,0.1)",
            borderRadius: 12,
            padding: 20,
            border: "1px solid rgba(59,130,246,0.3)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 11, color: "#cbd5e1", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Subjects Taken</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#3b82f6" }}>{vals.length}</div>
          </div>
        </div>
      )}

      {/* Personal Information Card */}
      <div style={{
        background: "linear-gradient(180deg,#071130 0%,#15306b 100%)",
        borderRadius: 14,
        border: "1px solid rgba(96,165,250,0.12)",
        padding: 24,
        marginBottom: 24
      }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>Personal Information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Gender</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e6eef8" }}>{student.gender}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Date of Birth</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e6eef8" }}>{formatDOB(student.dob)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Parent/Guardian</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e6eef8" }}>{student.parentContact || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Enrolled</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{student.createdAt ? formatDOB(student.createdAt) : "—"}</div>
          </div>
        </div>
      </div>

      {/* Subject Scores Card */}
      <div style={{
        background: "linear-gradient(180deg,#071130 0%,#15306b 100%)",
        borderRadius: 14,
        border: "1px solid rgba(96,165,250,0.12)",
        padding: 24,
        marginBottom: 24
      }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>Academic Performance</h2>
        {Object.entries(scores || {}).length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 20px", fontSize: 14 }}>No scores recorded yet</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {Object.entries(scores || {}).map(([subject, score]) => (
              <div 
                key={subject} 
                style={{
                  background: score >= 75 ? "rgba(16,185,129,0.1)" : score >= 50 ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
                  border: score >= 75 ? "1px solid rgba(16,185,129,0.3)" : score >= 50 ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  padding: 16,
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, marginBottom: 8 }}>{subject}</div>
                <div style={{ 
                  fontSize: 28, 
                  fontWeight: 900, 
                  color: score >= 75 ? "#10b981" : score >= 50 ? "#3b82f6" : "#ef4444"
                }}>
                  {score}%
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
                  {score >= 75 ? "Excellent" : score >= 50 ? "Pass" : "Fail"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Status Card */}
      <div style={{
        background: "linear-gradient(180deg,#071130 0%,#15306b 100%)",
        borderRadius: 14,
        border: "1px solid rgba(96,165,250,0.12)",
        padding: 24
      }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>School Directories</h2>
        {selection ? (
          <div>
            {(selection.status !== "approved" || (selection.choices && selection.choices.length > 0)) && (
              <div style={{ marginBottom: 20 }}>
                <Chip label={selection.status} bg={ss.bg} color={ss.col} />
              </div>
            )}
            {selection.choices && selection.choices.length > 0 ? (
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{selection.status === "approved" ? "Approved Schools" : "Submitted Schools"}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selection.choices.map((id, i) => {
                    const schoolList = Array.isArray(schools) ? schools : [];
                    const sc = schoolList.find(s => String(s.id) === String(id));
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 5, background: CAT_COLOR[sc?.category||"C"], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                        <div style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e6eef8" }}>{sc?.name || `School ${id}`}</div>
                        <Chip label={`CAT ${sc?.category||"?"}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 15, color: "#e6eef8", fontWeight: 600 }}>No schools selected</div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            color: "#94a3b8", 
            padding: "40px 20px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 10,
            fontSize: 14
          }}>
            Selection status not available
          </div>
        )}
      </div>
    </div>
  );
}