import { useEffect } from "react";
import { C, styles } from '../theme';
import Icon from './Icon';
import UrgencyBadge from './UrgencyBadge';

export default function SRModal({ sr, onClose, onEditInGenerator }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!sr) return null;
  const f = sr.full;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surfaceContainerLowest, borderRadius: 16,
          maxWidth: 640, width: "100%",
          boxShadow: "0px 24px 48px rgba(28,28,26,0.14)",
          overflow: "hidden",
          animation: "fadeUp 0.25s ease",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.surfaceContainer}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>SR Detail View</span>
            <span style={{ marginLeft: 6, fontSize: 11, color: C.onSurfaceVariant, fontWeight: 500 }}>{sr.id}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: C.onSurfaceVariant }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", maxHeight: "65vh", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={styles.moduleChip}>{sr.module}</span>
            <UrgencyBadge urgency={sr.urgency} />
            <span style={{ marginLeft: "auto", fontSize: 11, color: C.onSurfaceVariant }}>{sr.date} · {sr.time}</span>
          </div>
          {[
            ["Short Description", f.short],
            ["Issue", f.issue],
            ["Business Impact", f.impact],
            ["Urgency", f.urgencyDetail],
            ["What We Need from Oracle", f.need],
          ].map(([label, val]) => val ? (
            <div key={label} style={{ marginBottom: 16 }}>
              <p style={{ ...styles.label, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: C.onSurface }}>{val}</p>
            </div>
          ) : null)}
          {f.env && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ ...styles.label, marginBottom: 4 }}>Environment</p>
              <span style={{ background: C.error, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>{f.env}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.surfaceContainer}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ ...styles.toolbarBtn, background: C.surfaceContainerHigh, color: C.onSurfaceVariant }}>Close</button>
          <button
            onClick={() => { onEditInGenerator(sr); onClose(); }}
            style={{ ...styles.toolbarBtn, background: "linear-gradient(135deg,#004e8a,#0066b2)", color: "#fff" }}
          >
            <Icon name="edit" size={14} style={{ color: "#fff" }} /> Edit in Generator
          </button>
        </div>
      </div>
    </div>
  );
}
