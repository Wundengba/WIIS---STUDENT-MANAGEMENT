import { useState, useEffect } from "react";
import { S, Chip, CAT_COLOR } from "../shared";
import { validateSelections } from "../../utils/helpers";

export default function SchoolSelectionTab({ student, schools, selections, onSubmit, regions = [], onClear }) {
  const existing = student ? selections[student.id] : null;
  // maintain seven numbered slots (null = empty)
  const [slots, setSlots] = useState(() => Array(7).fill(null));
  const [activeSlot, setActiveSlot] = useState(null); // which slot is currently being edited
  const [searchQ,  setSearchQ]  = useState("");
  const [regionF,  setRegionF]  = useState("all");
  const [catF,     setCatF]     = useState("all");
  const [err,      setErr]      = useState("");
  const [success,  setSuccess]  = useState("");
  const [submitted,setSubmitted]= useState(false);

  // keep slots in sync with existing selection (allow editing while pending)
  useEffect(() => {
    if (existing && Array.isArray(existing.choices)) {
      const arr = existing.choices.slice(0, 7);
      setSlots([...arr, ...Array(7 - arr.length).fill(null)]);
    }
  }, [existing]);

  // If selection gets rejected, allow student to edit/resubmit
  useEffect(() => {
    if (existing?.status === "rejected") {
      setSubmitted(false);
      setErr(existing.reason ? `Selection rejected: ${existing.reason}` : "Your previous selection was rejected. You may revise and resubmit.");
    }
  }, [existing?.status, existing?.reason]);

  // derive clean choices array from slots
  const choices = slots.filter(Boolean);
  const catA = choices.filter(id => schools.find(s => String(s.id) === String(id))?.category === "A").length;
  const catB = choices.filter(id => schools.find(s => String(s.id) === String(id))?.category === "B").length;
  const catC = choices.filter(id => schools.find(s => String(s.id) === String(id))?.category === "C").length;

  const filtered = schools.filter(s =>
    (catF === "all" || s.category === catF) &&
    (regionF === "all" || s.region === regionF) &&
    s.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  // sort by category A -> B -> C, then by name
  const catOrder = { A: 1, B: 2, C: 3 };
  const sortedFiltered = filtered.slice().sort((a, b) => {
    const ca = catOrder[a.category] || 99;
    const cb = catOrder[b.category] || 99;
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });

  const pickSchool = (slot, id) => {
    // id comes from HTML select as a string, ensure it stays as-is for comparison
    const school = schools.find(s => String(s.id) === String(id));
    if (!school) {
      setErr("School not found.");
      return;
    }

    // count current selections by category (excluding this slot if being changed)
    const nextSlots = slots.slice();
    nextSlots[slot] = null; // temporarily remove current slot
    const futureA = nextSlots.filter(x => schools.find(s => String(s.id) === String(x))?.category === "A").length;
    const futureB = nextSlots.filter(x => schools.find(s => String(s.id) === String(x))?.category === "B").length;

    // check if adding this school would exceed limits
    if (school.category === "A" && futureA >= 1) {
      setErr("Maximum 1 Category A school allowed.");
      return;
    }
    if (school.category === "B" && futureB >= 2) {
      setErr("Maximum 2 Category B schools allowed.");
      return;
    }

    setErr("");
    // remove id from any other slot
    setSlots(prev => {
      const next = prev.slice();
      for (let j = 0; j < next.length; j++) {
        if (String(next[j]) === String(id)) next[j] = null;
      }
      next[slot] = id;
      return next;
    });
    setActiveSlot(null);
  };

  const clearSlot = (slot) => {
    setErr("");
    setSlots(prev => {
      const next = prev.slice();
      next[slot] = null;
      return next;
    });
    setActiveSlot(null);
  };

  const mapServerMessage = (msg) => {
    if (!msg) return "Failed to submit selection.";
    if (msg.includes("Select exactly 7")) return "Please select exactly 7 schools.";
    if (msg.includes("Invalid category combination")) return "Invalid mix of categories. Allowed: 7 CAT C; 1A+6C; 1B+6C; 2B+5C.";
    if (msg.includes("not found")) return "One or more selected schools were not found.";
    return msg;
  };

  const handleSubmit = async () => {
    const e = validateSelections(choices, schools);
    if (e) { setErr(e); return; }
    setErr("");

    // If there is an existing pending selection, confirm overwrite
    if (existing?.status === "pending") {
      const prev = JSON.stringify(existing.choices || []);
      const curr = JSON.stringify(choices || []);
      if (prev === curr) { setErr("No changes to submit."); return; }
      const ok = window.confirm("You already have a pending selection. Resubmitting will overwrite your previous submission. Continue?");
      if (!ok) return;
    }

    try {
      await onSubmit(student.id, choices);
      setSuccess("✓ Selection submitted successfully!");
      setErr("");
      setSubmitted(true);
      setTimeout(() => setSuccess(""), 5000); // hide success message after 5 seconds
    } catch (err) {
      const friendly = mapServerMessage(err?.message || String(err));
      setErr(friendly);
      setSuccess("");
      setSubmitted(false);
    }
  };

  const resetAll = () => {
    setSlots(Array(7).fill(null));
    setActiveSlot(null);
    setSearchQ("");
    setRegionF("all");
    setCatF("all");
    setErr("");
    setSuccess("");
    setSubmitted(false);
  };

  // (no per-slot query needed for select-based slots)

  if (existing?.status === "approved") return (
    <div style={S.card}><div style={{ textAlign:"center", padding:40 }}>
      <h2 style={{ color:"#10b981" }}>Selection Approved!</h2>
      <p style={{ color:"#64748b" }}>Your selections have been confirmed.</p>
    </div></div>
  );

  return (
    <div>
      <div style={{ ...S.card, marginBottom:16, padding:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8", marginBottom:8 }}>Selection Rules</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
          {['Exactly 7 schools','Max 1 CAT A','Max 2 CAT B','4+ CAT C'].map(r => (
            <span key={r} style={{ fontSize:12, color:"#334155" }}>{r}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Chip label={`A: ${catA}/1`} bg="#dbeafe" color="#1d4ed8"/>
          <Chip label={`B: ${catB}/2`} bg="#cffafe" color="#0891b2"/>
          <Chip label={`C: ${catC}`}   bg="#e0e7ff" color="#6366f1"/>
          <Chip label={`Total: ${choices.length}/7`} bg={choices.length===7?"#dcfce7":"#fef3c7"} color={choices.length===7?"#166534":"#92400e"}/>
        </div>
            {err && <div style={{ color:"#ef4444", fontSize:12, marginTop:8, fontWeight:600 }}>{err}</div>}
            {success && <div style={{ color:"#10b981", fontSize:12, marginTop:8, fontWeight:600, padding:8, background:"#dcfce7", borderRadius:4 }}>{success}</div>}
            {(submitted || existing?.status === "pending") && (
              <div style={{ color:"#92400e", fontSize:12, marginTop:8, fontWeight:700 }}>
                Selection submitted — you cannot change your choices while the submission is under review. You may clear the submission while it's pending.
              </div>
            )}
            {existing?.status === "rejected" && <div style={{ color:"#b91c1c", fontSize:12, marginTop:8, fontWeight:700 }}>Selection rejected. You may revise and resubmit.</div>}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <input style={{ ...S.input, minWidth:140 }} placeholder="Search schools…" value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
        <select style={{ ...S.input, width:170, flexShrink:0 }} value={regionF} onChange={e => setRegionF(e.target.value)}>
          <option value="all">All Regions</option>{regions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select style={{ ...S.input, width:140, flexShrink:0 }} value={catF} onChange={e => setCatF(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="A">CAT A</option><option value="B">CAT B</option><option value="C">CAT C</option>
        </select>
        <button onClick={resetAll} style={{ ...S.btnSec, flexShrink:0 }}>Reset</button>
      </div>

      {/* slot grid rendered as per-slot selects (like region filter) */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
        {slots.map((id, i) => {
          const sc = schools.find(s => String(s.id) === String(id));
          const takenIds = slots.map(x => x).filter(x => x && x !== id);
          return (
            <div key={i} style={{ minWidth:180 }}>
              <div style={{ minHeight:64, padding:10, borderRadius:8, display:"flex", alignItems:"center", gap:8, background: id ? "#f1f5f9" : "#ffffff", border: "1px solid #cbd5e1" }}>
                <div style={{ width:28, height:28, borderRadius:6, background: id ? CAT_COLOR[sc?.category||"C"] : "#f1f1f2", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#000" }}>{i+1}</div>
                
                {id ? (
                  // Show selected school details
                  sc ? (
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#1e293b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sc.name}</div>
                      <div style={{ fontSize:11, color:"#64748b" }}>CAT {sc.category} • {sc.region}</div>
                    </div>
                  ) : (
                    <div style={{ flex:1, fontSize:12, color:"#ef4444", fontWeight:600 }}>School not found</div>
                  )
                ) : (
                  // Show select when empty
                  <select
                    value=""
                    onChange={e => {
                      const v = e.target.value || null;
                      if (v) pickSchool(i, v);
                    }}
                    style={{ ...S.input, flex:1 }}>
                    <option value="">-- Slot {i+1} -- choose --</option>
                    {sortedFiltered.map(s => (
                      <option key={s.id} value={s.id} disabled={takenIds.some(tid => String(tid) === String(s.id))}>{s.name} — CAT {s.category}</option>
                    ))}
                  </select>
                )}
                
                {id && <button onClick={e => { e.stopPropagation(); clearSlot(i); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:16, fontWeight:"bold", padding:0 }}>×</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* submission footer */}
      <div style={S.card}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button style={{ ...S.btnPrimary, opacity:choices.length===7?1:0.55, cursor:choices.length===7?"pointer":"default" }} onClick={handleSubmit}>
            Submit Selection ({choices.length}/7)
          </button>
          {(existing && existing.status !== "approved") && (
            <button onClick={async () => {
              try {
                setErr("");
                await onClear(student.id);
                resetAll();
              } catch (e) {
                setErr(e?.message || String(e));
              }
            }} style={{ ...S.btnSec }}>Clear Submission</button>
          )}
        </div>
        {choices.length < 7 && <div style={{ fontSize:12, color:"#94a3b8", marginTop:6 }}>Select {7-choices.length} more school{7-choices.length!==1?"s":""}</div>}
      </div>
    </div>
  );
}
