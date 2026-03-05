export function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#000", marginBottom:4 }}>
        {label}
      </label>
      {children}
      {error && <div style={{ color:"#ef4444", fontSize:11, marginTop:2 }}>{error}</div>}
    </div>
  );
}
