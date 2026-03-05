import { useState } from "react";
import { S } from "../shared";
import AdminCard from "./AdminCard";
import { Field } from "../shared/Field";

export default function EnrollTab({ onRegister }) {
  const init = { fullName:"", indexNumber:"", gender:"", dob:"", parentContact:"", photo:null, photoUrl:"" };
  const [form, setForm] = useState(init);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName    = "Full name is required";
    if (form.indexNumber.length !== 12) e.indexNumber = "Must be 12 digits";
    if (!form.gender)             e.gender      = "Select gender";
    if (!form.dob)                e.dob         = "Date of birth required";
    if (!/^0[0-9]{9}$/.test(form.parentContact)) e.parentContact = "Must be valid 10-digit Ghana number (e.g. 024XXXXXXX)";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    let photoUrl = form.photoUrl;
    if (form.photo) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("photo", form.photo);
        const resp = await fetch(`${process.env.REACT_APP_API_URL}/students/upload`, {
          method: "POST",
          body: formData
        });
        if (!resp.ok) throw new Error("Upload failed");
        const { photoUrl: url } = await resp.json();
        photoUrl = url;
      } catch (err) {
        setErrors({ photo: "Failed to upload photo: " + err.message });
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    onRegister({ ...form, photoUrl, photo: undefined });
    setSuccess(`Student "${form.fullName}" enrolled successfully!`);
    setForm(init);
    setErrors({});
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <AdminCard title="Enroll New Student">
      {success && <div style={S.success}><span style={{marginRight:4}}>✅</span>{success}</div>}
      <div style={{ ...S.card, display:"flex", flexDirection:"column", gap:16, marginTop:16 }}>
        <Field label="Full Name" error={errors.fullName}>
          <input style={S.input} value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Kwame Mensah"/>
        </Field>
        <Field label="Index Number (12 digits)" error={errors.indexNumber}>
          <input style={S.input} value={form.indexNumber} maxLength={12} onChange={e => set("indexNumber", e.target.value.replace(/\D/g,""))} placeholder="000000000000"/>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Gender" error={errors.gender}>
            <select style={S.input} value={form.gender} onChange={e => set("gender", e.target.value)}>
              <option value="">Select…</option>
              <option>Male</option><option>Female</option>
            </select>
          </Field>
          <Field label="Date of Birth" error={errors.dob}>
            <input type="date" style={S.input} value={form.dob} onChange={e => set("dob", e.target.value)}/>
          </Field>
        </div>
        <Field label="Parent/Guardian Contact" error={errors.parentContact}>
          <input style={S.input} maxLength={10} value={form.parentContact} onChange={e => set("parentContact", e.target.value.replace(/\D/g, ""))} placeholder="0244000000"/>
        </Field>
        <Field label="Student Photo (Optional)">
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <input type="file" accept="image/*" onChange={e => {
              if (e.target.files?.[0]) {
                set("photo", e.target.files[0]);
                const reader = new FileReader();
                reader.onload = (evt) => set("photoUrl", evt.target.result);
                reader.readAsDataURL(e.target.files[0]);
              }
            }} style={{ ...S.input, flex:1 }}/>
            {form.photoUrl && <img src={form.photoUrl} alt="preview" style={{ width:50, height:50, borderRadius:8, objectFit:"cover" }}/>}
          </div>
        </Field>
        <button style={S.btnPrimary} onClick={handleSubmit} disabled={uploading}><span style={{marginRight:4}}>👤+</span>{uploading ? "Uploading..." : "Enroll Student"}</button>
      </div>
    </AdminCard>
  );
}
