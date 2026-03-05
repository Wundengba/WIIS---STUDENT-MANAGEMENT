import { useResponsive } from "../../hooks/useResponsive";
import { S } from "./styles";

export function ResponsiveTable({ headers, data, renderRow, keyExtractor, emptyMessage = "No data available" }) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Mobile: Stack cards vertically
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vw, 16px)" }}>
        {data.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center", color: "#94a3b8", padding: "clamp(24px, 5vw, 32px)" }}>
            {emptyMessage}
          </div>
        ) : (
          data.map((item, index) => (
            <div key={keyExtractor ? keyExtractor(item) : index} style={{
              ...S.card,
              display: "flex",
              flexDirection: "column",
              gap: "clamp(8px, 1.5vw, 12px)"
            }}>
              {renderRow(item, index, true)}
            </div>
          ))
        )}
      </div>
    );
  }

  // Desktop: Traditional table
  return (
    <div style={{ overflowX: "auto", borderRadius: "clamp(10px, 2vw, 14px)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <table style={S.table}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={S.th}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: "clamp(24px, 5vw, 32px)" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={keyExtractor ? keyExtractor(item) : index}>
                {renderRow(item, index, false)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper component for mobile table rows
export function MobileTableRow({ title, subtitle, avatar, details = [], actions, style = {} }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "clamp(12px, 2vw, 16px)",
      padding: "clamp(16px, 3vw, 20px)",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "clamp(8px, 1.5vw, 12px)",
      border: "1px solid rgba(255,255,255,0.06)",
      ...style
    }}>
      {/* Header with avatar and title/subtitle */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 16px)" }}>
        {avatar && (
          <div style={{ flexShrink: 0 }}>
            {avatar}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: 700, color: "#000000", marginBottom: "4px" }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: "clamp(12px, 1.5vw, 14px)", color: "#94a3b8", fontWeight: 500 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      {details.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 1vw, 8px)" }}>
          {details.map((detail, index) => (
            <div key={index} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "clamp(4px, 0.5vw, 6px) 0"
            }}>
              <span style={{ fontSize: "clamp(12px, 1.5vw, 14px)", color: "#94a3b8", fontWeight: 500 }}>
                {detail.label}
              </span>
              <span style={{ fontSize: "clamp(13px, 1.5vw, 15px)", color: "#000000", fontWeight: 600, textAlign: "right", flex: 1 }}>
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div style={{ marginTop: "clamp(8px, 1.5vw, 12px)" }}>
          {actions}
        </div>
      )}
    </div>
  );
}