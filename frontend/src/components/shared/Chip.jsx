export function Chip({ label, bg, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: 12, fontSize: 11, fontWeight: 700,
      background: bg, color, flexShrink: 0, whiteSpace: "nowrap"
    }}>
      {label}
    </span>
  );
}
