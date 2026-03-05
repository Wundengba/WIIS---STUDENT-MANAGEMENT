import React from "react";

const adminStyles = {
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 6px 18px rgba(2,6,23,0.55)",
    color: "#e6eef8",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0 8px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial",
    fontSize: 18,
    fontWeight: 700,
    color: "#000",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  body: {
    paddingTop: 8,
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  }
};

export default function AdminCard({ title, subtitle, actions, children, style }) {
  return (
    <div style={{ ...adminStyles.card, ...(style || {}) }}>
      <div style={adminStyles.header}>
        <div>
          <div style={adminStyles.title}>{title}</div>
          {subtitle && <div style={adminStyles.subtitle}>{subtitle}</div>}
        </div>
        {actions && <div style={adminStyles.actions}>{actions}</div>}
      </div>
      <div style={adminStyles.body}>{children}</div>
    </div>
  );
}
