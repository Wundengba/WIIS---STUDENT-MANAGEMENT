import { useState } from "react";
import { S, Chip, CAT_BG, CAT_COLOR } from "../shared";
import { ResponsiveTable, MobileTableRow } from "../shared/ResponsiveTable";
import AdminCard from "./AdminCard";
import { getGrade, gradeChipStyle, statusChipStyle, average } from "../../utils/helpers";
import { GH_SUBJECTS } from "../../data/schools";
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function StudentsTab({ students, scores, selections, schools, onStudentUpdate }) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const studentList = Array.isArray(students) ? students.sort((a, b) => {
    const aIndex = parseInt(a.indexNumber) || 0;
    const bIndex = parseInt(b.indexNumber) || 0;
    return aIndex - bIndex;
  }) : [];
  const scoresMap = scores || {};
  const selectionsMap = selections || {};
  const filtered = studentList.filter(s =>
    (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.indexNumber || "").includes(search)
  );

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedStudent.fullName}?`)) return;
    setLoading(true);
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/students/${selectedStudent.id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Delete failed");
      onStudentUpdate?.();
      setSelectedStudent(null);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
    setLoading(false);
  };

  const handleEditOpen = () => {
    setEditForm({
      fullName: selectedStudent.fullName,
      gender: selectedStudent.gender,
      parentContact: selectedStudent.parentContact || selectedStudent.parent_contact,
      dob: selectedStudent.dob
    });
    setEditMode(true);
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editForm.fullName,
          gender: editForm.gender,
          parent_contact: editForm.parentContact,
          dob: editForm.dob
        })
      });
      if (!resp.ok) throw new Error("Update failed");
      onStudentUpdate?.();
      setEditMode(false);
      setSelectedStudent(null);
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
    setLoading(false);
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const currentSelection = selectionsMap[selectedStudent.id];
      if (!currentSelection) throw new Error("No selection found");
      
      const updatedChoices = (currentSelection.choices || []).filter(id => String(id) !== String(schoolId));
      
      const resp = await fetch(`${API_URL}/selections/${currentSelection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choices: updatedChoices
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete school");
      }
      onStudentUpdate?.();
    } catch (err) {
      alert("Failed to delete school: " + err.message);
    }
    setLoading(false);
  };

  const handleDeleteAllSchools = async () => {
    if (!selectedStudent) return;
    if (!window.confirm("Delete all approved schools for this student?")) return;
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const currentSelection = selectionsMap[selectedStudent.id];
      if (!currentSelection) throw new Error("No selection found");
      
      const resp = await fetch(`${API_URL}/selections/${currentSelection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choices: []
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete schools");
      }
      onStudentUpdate?.();
    } catch (err) {
      alert("Failed to delete schools: " + err.message);
    }
    setLoading(false);
  };

  const formatDOB = (dob) => {
    if (!dob) return "—";
    try {
      const date = new Date(dob);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dob;
    }
  };
  return (
    <AdminCard title={`All Students (${studentList.length})`}>
      <input style={{ ...S.input, maxWidth:320, marginBottom:14 }} placeholder="Search by name or index…" value={search} onChange={e => setSearch(e.target.value)}/> 
      {filtered.length === 0
        ? <div style={{ ...S.card, textAlign:"center", color:"#94a3b8", padding:32 }}>No students found</div>
        : <ResponsiveTable
            headers={["Student", "Photo", "Index No.", "Gender", "Parent Contact", "Enrolled", "Avg Score", "Selection", "Action"]}
            data={filtered.map(s => {
              const sc = Object.values(scoresMap[s.id] || {});
              const avg = sc.length ? Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) : null;
              const sel = selectionsMap[s.id];
              const ss = statusChipStyle(sel?.status || "none");
              return {
                id: s.id,
                cells: [
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={S.avatar}>{s.fullName ? s.fullName[0] : "?"}</div><span style={{ fontWeight:600, color:"#000000" }}>{s.fullName}</span></div>,
                  s.photoUrl ? <img src={s.photoUrl} alt="student" style={{ width:40, height:40, borderRadius:6, objectFit:"cover" }}/> : <div style={{ width:40, height:40, borderRadius:6, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#94a3b8" }}>—</div>,
                  <code style={{ fontSize:12, color:"#000000" }}>{s.indexNumber}</code>,
                  <span style={{ color:"#000000" }}>{s.gender}</span>,
                  <span style={{ color:"#000000" }}>{s.parentContact || s.parent_contact || <span style={{ color:"#94a3b8" }}>—</span>}</span>,
                  <span style={{ fontSize:12, color:"#000000" }}>{s.createdAt ? formatDOB(s.createdAt) : "—"}</span>,
                  avg != null ? <Chip label={`${avg}% (${getGrade(avg)})`} bg={gradeChipStyle(avg).bg} color={gradeChipStyle(avg).col}/> : <span style={{ color:"#94a3b8" }}>—</span>,
                  sel && (sel.status !== "approved" || (sel.choices && sel.choices.length > 0)) ? <Chip label={sel.status} bg={ss.bg} color={ss.col}/> : <span style={{ color:"#94a3b8" }}>—</span>,
                  <button onClick={() => setSelectedStudent(s)} style={{ ...S.btnSec, fontSize:11, padding:"5px 10px" }}>View</button>
                ],
                mobileRow: (
                  <MobileTableRow
                    title={s.fullName}
                    subtitle={`Index: ${s.indexNumber}`}
                    avatar={s.photoUrl ? <img src={s.photoUrl} alt="student" style={{ width:48, height:48, borderRadius:8, objectFit:"cover" }}/> : <div style={{ width:48, height:48, borderRadius:8, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"#94a3b8" }}>—</div>}
                    details={[
                      { label: "Gender", value: s.gender },
                      { label: "Parent Contact", value: s.parentContact || s.parent_contact || "—" },
                      { label: "Enrolled", value: s.createdAt ? formatDOB(s.createdAt) : "—" },
                      { label: "Avg Score", value: avg != null ? `${avg}% (${getGrade(avg)})` : "—" },
                      { label: "Selection", value: sel && (sel.status !== "approved" || (sel.choices && sel.choices.length > 0)) ? sel.status : "—" }
                    ]}
                    actions={<button onClick={() => setSelectedStudent(s)} style={{ ...S.btnSec, fontSize:12, padding:"6px 12px", width:"100%" }}>View Details</button>}
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
      }
      {selectedStudent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
          <div style={{ background:"#0f172a", borderRadius:14, maxWidth:900, width:"100%", maxHeight:"90vh", overflowY:"auto", border:"1px solid rgba(255,255,255,0.1)" }}>
            {/* Close Button */}
            <div style={{ position:"sticky", top:0, right:0, padding:16, display:"flex", justifyContent:"flex-end", borderBottom:"1px solid rgba(255,255,255,0.1)", background:"#0f172a", zIndex:10 }}>
              <button onClick={() => { setSelectedStudent(null); setEditMode(false); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24 }}><XMarkIcon className="h-6 w-6" style={{ color: "#94a3b8" }}/></button>
            </div>

            <div style={{ padding:32 }}>
              {/* Hero Section */}
              <div style={{ background: "linear-gradient(180deg,#071130 0%,#15306b 100%)", borderRadius: 16, padding: 32, border: "1px solid rgba(96,165,250,0.12)", marginBottom: 24, textAlign: "center" }}>
                {/* Photo */}
                <div style={{ marginBottom: 24 }}>
                  {selectedStudent.photoUrl ? (
                    <img src={selectedStudent.photoUrl} alt={selectedStudent.fullName} style={{ width: 140, height: 140, borderRadius: 14, objectFit: "cover", border: "4px solid rgba(96,165,250,0.95)", boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}/>
                  ) : (
                    <div style={{ width: 140, height: 140, borderRadius: 14, background: "linear-gradient(135deg,#60a5fa 0%,#2563eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 900, color: "white", margin: "0 auto", boxShadow: "0 8px 24px rgba(37,99,235,0.25)" }}>
                      {selectedStudent.fullName ? selectedStudent.fullName[0].toUpperCase() : "?"}
                    </div>
                  )}
                </div>

                {/* Name and Status */}
                {editMode ? (
                  <div style={{ marginBottom: 16 }}>
                    <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} style={{ ...S.input, padding: "8px 12px", fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 12 }}/>
                    <div style={{ fontSize: 14, color: "#ffffff", fontFamily: "monospace", letterSpacing: "1px" }}>Index Number: {selectedStudent.indexNumber}</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#ffffff", marginBottom: 8 }}>{selectedStudent.fullName}</h1>
                    <div style={{ fontSize: 14, color: "#ffffff", fontFamily: "monospace", letterSpacing: "1px" }}>Index Number: {selectedStudent.indexNumber}</div>
                  </div>
                )}

                {/* Status Badge */}
                {selections[selectedStudent.id] && (selections[selectedStudent.id].status !== "approved" || (selections[selectedStudent.id].choices && selections[selectedStudent.id].choices.length > 0)) && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <Chip label={selections[selectedStudent.id].status} bg={statusChipStyle(selections[selectedStudent.id].status).bg} color={statusChipStyle(selections[selectedStudent.id].status).col} />
                  </div>
                )}
              </div>

              {/* Stats Row */}
              {(() => {
                const vals = GH_SUBJECTS.map(s => scoresMap[selectedStudent.id]?.[s]).filter(v => v != null);
                const avgScore = vals.length ? Math.round(average(vals)) : null;
                return avgScore !== null ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                    <div style={{ background: "rgba(16,185,129,0.1)", borderRadius: 12, padding: 20, border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#cbd5e1", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Overall Average</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "#10b981" }}>{avgScore}%</div>
                    </div>
                    <div style={{ background: "rgba(59,130,246,0.1)", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.3)", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#cbd5e1", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Subjects Taken</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: "#3b82f6" }}>{vals.length}</div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Personal Information Card */}
              <div style={{ background: "linear-gradient(180deg,#071130 0%,#15306b 100%)", borderRadius: 14, border: "1px solid rgba(96,165,250,0.12)", padding: 24, marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>Personal Information</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Gender</div>
                    {editMode ? (
                      <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} style={{ ...S.input, padding: "8px 12px" }}>
                        <option value="">Select…</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#e6eef8" }}>{selectedStudent.gender}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Date of Birth</div>
                    {editMode ? (
                      <input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} style={{ ...S.input, padding: "8px 12px" }}/>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#e6eef8" }}>{formatDOB(selectedStudent.dob)}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Parent/Guardian</div>
                    {editMode ? (
                      <input type="text" value={editForm.parentContact} onChange={e => setEditForm({...editForm, parentContact: e.target.value})} style={{ ...S.input, padding: "8px 12px" }}/>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#e6eef8" }}>{selectedStudent.parentContact || selectedStudent.parent_contact || "—"}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>Enrolled</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{selectedStudent.createdAt ? formatDOB(selectedStudent.createdAt) : "—"}</div>
                  </div>
                </div>
              </div>

              {/* Academic Performance Card */}
              <div style={{ background: "linear-gradient(180deg,#071130 0%,#15306b 100%)", borderRadius: 14, border: "1px solid rgba(96,165,250,0.12)", padding: 24, marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>Academic Performance</h2>
                {Object.entries(scoresMap[selectedStudent.id] || {}).length === 0 ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 20px", fontSize: 14 }}>No scores recorded yet</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                    {Object.entries(scoresMap[selectedStudent.id] || {}).map(([subject, score]) => (
                      <div key={subject} style={{
                        background: score >= 75 ? "rgba(16,185,129,0.1)" : score >= 50 ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
                        border: score >= 75 ? "1px solid rgba(16,185,129,0.3)" : score >= 50 ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(239,68,68,0.3)",
                        borderRadius: 10,
                        padding: 16,
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600, marginBottom: 8 }}>{subject}</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: score >= 75 ? "#10b981" : score >= 50 ? "#3b82f6" : "#ef4444" }}>{score}%</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>{score >= 75 ? "Excellent" : score >= 50 ? "Pass" : "Fail"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selection Status Card */}
              <div style={{ background: "linear-gradient(180deg,#071130 0%,#15306b 100%)", borderRadius: 14, border: "1px solid rgba(96,165,250,0.12)", padding: 24, marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>School Directories</h2>
                {selections[selectedStudent.id] ? (
                  <div>
                    <div style={{ marginBottom: 20 }}>
                      <Chip label={selections[selectedStudent.id].status} bg={statusChipStyle(selections[selectedStudent.id].status).bg} color={statusChipStyle(selections[selectedStudent.id].status).col} />
                    </div>
                    {selections[selectedStudent.id].choices && selections[selectedStudent.id].choices.length > 0 ? (
                      <div>
                        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{selections[selectedStudent.id].status === "approved" ? "Approved Schools" : "Submitted Schools"}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                          {selections[selectedStudent.id].choices.map((id, i) => {
                            const schoolList = Array.isArray(schools) ? schools : [];
                            const sc = schoolList.find(s => String(s.id) === String(id));
                            return (
                              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 5, background: CAT_COLOR[sc?.category||"C"], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                                <div style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#e6eef8" }}>{sc?.name || `School ${id}`}</div>
                                <Chip label={`CAT ${sc?.category||"?"}`} bg={CAT_BG[sc?.category||"C"]} color={CAT_COLOR[sc?.category||"C"]}/>
                                {selections[selectedStudent.id].status === "approved" && (
                                  <button onClick={() => handleDeleteSchool(id)} disabled={loading} title="Delete school" style={{ background: "#ef4444", border: "none", cursor: loading ? "not-allowed" : "pointer", padding: "6px 8px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", opacity: loading ? 0.6 : 1, transition: "all 0.2s", minWidth: 32, minHeight: 32 }}>
                                    <TrashIcon className="h-4 w-4" style={{ color: "#ffffff" }} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {selections[selectedStudent.id].status === "approved" && (
                          <button onClick={handleDeleteAllSchools} disabled={loading} style={{ background: "#ef4444", border: "none", color: "white", padding: "10px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, width: "100%", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}>
                            Delete All Schools
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 15, color: "#e6eef8", fontWeight: 600 }}>No schools selected</div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 10, fontSize: 14 }}>No selection yet</div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {editMode ? (
                  <>
                    <button onClick={handleEditSave} disabled={loading} style={{ ...S.btnSec, background: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>Save</button>
                    <button onClick={() => setEditMode(false)} disabled={loading} style={{ ...S.btnGhost, background: "#6b7280", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleEditOpen} disabled={loading} style={{ ...S.btnSec, background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>Edit</button>
                    <button onClick={handleDelete} disabled={loading} style={{ ...S.btnDanger, background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>Delete</button>
                  </>
                )}
                <button onClick={() => { setSelectedStudent(null); setEditMode(false); }} disabled={loading} style={{ ...S.btnGhost, background: "#1d4ed8", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminCard>
  );
}
