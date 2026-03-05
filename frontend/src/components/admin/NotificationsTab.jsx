export default function NotificationsTab({ notifications = [] }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>Notifications</h1>
        <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Stay updated with system activities</p>
      </div>

      {notifications.length === 0 ? (
        <div style={{
          background: "linear-gradient(135deg, #f1f5f9 0%, #ecf0f5 100%)",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 48,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No Notifications</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>You're all caught up! There are no new notifications at this time.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n, idx) => (
            <div key={idx} style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              gap: 16,
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              {/* Icon */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 20
              }}>
                {n.icon || "📬"}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                  {n.title || n.msg || "Notification"}
                </div>
                {n.body && (
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    {n.body}
                  </div>
                )}
                {n.timestamp && (
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Close button */}
              <button style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 18,
                flexShrink: 0,
                padding: 4
              }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
