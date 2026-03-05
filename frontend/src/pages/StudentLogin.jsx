import { useState } from "react";
import { S } from "../components/shared";

export default function StudentLogin({ students, onLogin, onBack }) {
  const [idx, setIdx] = useState("");
  const [contact, setContact] = useState("");
  const [err, setErr] = useState("");
  const handle = () => {
    const i = idx.trim();
    const iDigits = i.replace(/\D/g, "");
    const c = contact.trim();
    const cDigits = c.replace(/\D/g, "");

    // validation: index must be exactly 12 digits, contact required (digits)
    if (!iDigits || iDigits.length !== 12) {
      setErr("Index number must be exactly 12 digits.");
      return;
    }
    if (!cDigits || cDigits.length !== 10) {
      setErr("Enter a valid parent/guardian contact (10 digits).");
      return;
    }
    const s = students.find(x => {
      const storedIdx = String(x.indexNumber || x.index || "").trim();
      const storedIdxDigits = storedIdx.replace(/\D/g, "");
      const storedContact = String(x.parent_contact || x.parentContact || x.parentcontact || "").trim();
      const storedContactDigits = storedContact.replace(/\D/g, "");
      return (storedIdx === i || storedIdxDigits === iDigits) && (storedContact === c || storedContactDigits === cDigits);
    });
    if (!s) { setErr("Invalid index number or parent/guardian contact. Please check and try again."); return; }
    onLogin(s.id);
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0c1445,#1e3a8a,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"white", borderRadius:20, padding:"clamp(24px,5vw,48px) clamp(20px,5vw,40px)", maxWidth:420, width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:48 }}>🎓</div>
          <h2 style={{ color:"#1d4ed8", fontSize:22, fontWeight:800, margin:"8px 0 4px" }}>Student Login</h2>
          <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Enter your index number and parent/guardian contact</p>
        </div>
        <label style={S.label}>Index Number</label>
        <input style={S.input} placeholder="000000000000" maxLength={12} value={idx}
          onChange={e => setIdx(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && handle()}/>
        <label style={{...S.label, marginTop:16}}>Parent/Guardian Contact</label>
        <input style={S.input} placeholder="0201234567" maxLength={10} value={contact}
          onChange={e => setContact(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && handle()}/>
        {err && <p style={{ color:"#ef4444", fontSize:12, margin:"4px 0 0" }}>{err}</p>}
        <button style={{ ...S.btnPrimary, width:"100%", marginTop:16, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }} onClick={handle}>Login →</button>
        <button style={{ ...S.btnGhost, width:"100%", marginTop:10, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }} onClick={onBack}>← Back to Home</button>
      </div>
    </div>
  );
}
