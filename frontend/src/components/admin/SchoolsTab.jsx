import { useState } from "react";
import { S, Chip, CAT_BG, CAT_COLOR } from "../shared";
import AdminCard from "./AdminCard";

export default function SchoolsTab({ schools, regions = [] }) {
  const [search, setSearch]  = useState("");
  const [region, setRegion]  = useState("all");
  const [cat,    setCat]     = useState("all");

  const filtered = schools.filter(s =>
    (cat === "all" || s.category === cat) &&
    (region === "all" || s.region === region) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AdminCard title={`Schools Directory (${schools.length})`} style={{ padding:0 }}>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
        <input style={{ ...S.input, flex:1, minWidth:140 }} placeholder="Search schools…" value={search} onChange={e => setSearch(e.target.value)}/>
        <select style={{ ...S.input, width:170 }} value={region} onChange={e => setRegion(e.target.value)}>
          <option value="all">All Regions</option>{regions.map(r => <option key={r}>{r}</option>)}
        </select>
        <select style={{ ...S.input, width:140 }} value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="A">Category A</option><option value="B">Category B</option><option value="C">Category C</option>
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
        {filtered.map(s => (
          <div key={s.id} style={{ ...S.card, padding:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
              <div style={{ fontWeight:600, fontSize:12, color:"#1e293b", flex:1 }}>{s.name}</div>
              <Chip label={`CAT ${s.category}`} bg={CAT_BG[s.category]} color={CAT_COLOR[s.category]}/>
            </div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>📍{s.region}</div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
