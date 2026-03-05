import { useState } from "react";
import { S, CAT_COLOR } from "../shared";

export default function SchoolDirectoriesTab({ schools = [] }) {
  const [searchQ, setSearchQ] = useState("");

  // Group schools by category
  const schoolsByCategory = { A: [], B: [], C: [] };
  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  filtered.forEach(s => {
    if (schoolsByCategory[s.category]) {
      schoolsByCategory[s.category].push(s);
    }
  });

  // Sort each category alphabetically by name
  Object.keys(schoolsByCategory).forEach(cat => {
    schoolsByCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
  });

  const CategorySection = ({ category, label, schools }) => {
    if (schools.length === 0) return null;
    return (
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#60a5fa" }}>
          Category {category} ({schools.length})
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {schools.map(school => (
            <div key={school.id} style={{
              background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: 16,
              transition: "all 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: CAT_COLOR[school.category],
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {school.category}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                    {school.name}
                  </h3>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                    {school.region || "—"}
                  </div>
                </div>
              </div>
              {school.location && (
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, lineHeight: 1.4 }}>
                  {school.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search schools by name…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          style={{ ...S.input, maxWidth: "100%", padding: "10px 14px" }}
        />
      </div>

      {/* Category A */}
      <CategorySection
        category="A"
        label="First Choice"
        schools={schoolsByCategory.A}
      />

      {/* Category B */}
      <CategorySection
        category="B"
        label="Safety/Balanced"
        schools={schoolsByCategory.B}
      />

      {/* Category C */}
      <CategorySection
        category="C"
        label="Safety"
        schools={schoolsByCategory.C}
      />

      {/* No Results */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: "center",
          color: "#94a3b8",
          padding: "40px 20px",
          background: "rgba(15, 23, 42, 0.04)",
          borderRadius: 10,
          fontSize: 14
        }}>
          No schools match your search
        </div>
      )}
    </div>
  );
}
