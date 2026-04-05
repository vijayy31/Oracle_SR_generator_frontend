import { useState } from "react";
import { C, styles } from '../theme';
import Icon from '../components/Icon';
import UrgencyBadge from '../components/UrgencyBadge';
import SRModal from '../components/SRModal';

export default function HistoryPage({ srList, onEditInGenerator }) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalSR, setModalSR] = useState(null);

  const filtered = srList.filter((r) => {
    const matchModule = moduleFilter === "all" || r.module.toLowerCase() === moduleFilter;
    const matchSearch = !search || r.desc.toLowerCase().includes(search.toLowerCase()) || r.module.toLowerCase().includes(search.toLowerCase());
    return matchModule && matchSearch;
  });

  const modules = ["all", ...Array.from(new Set(srList.map((r) => r.module.toLowerCase())))];

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10, color: C.onSurface }}>
          Service Request History
        </h1>
        <p style={{ color: C.onSurfaceVariant, maxWidth: 560, fontSize: 13.5, lineHeight: 1.6 }}>
          Track, review, and manage all previously generated enterprise service requests. Use filters to narrow down by module or priority.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        <div style={styles.statCard()}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.onSurfaceVariant, marginBottom: 6 }}>Total Requests</p>
            <p style={{ fontSize: 44, fontWeight: 700, color: C.primary, lineHeight: 1 }}>{srList.length.toLocaleString()}</p>
          </div>
        </div>
        <div style={{ ...styles.statCard(), background: C.surfaceContainerLow, border: `0.5px solid ${C.outlineVariant}20` }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.onSurfaceVariant, marginBottom: 6 }}>Active Critical</p>
          <p style={{ fontSize: 44, fontWeight: 700, color: C.error, lineHeight: 1 }}>
            {srList.filter(sr => sr.urgency === "Critical").length.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: C.surfaceContainerLowest, borderRadius: 8, boxShadow: "0px 12px 32px rgba(28,28,26,0.06)", overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.surfaceContainerHigh}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {modules.map((mod) => (
              <button key={mod} onClick={() => setModuleFilter(mod)} style={styles.filterChip(moduleFilter === mod)}>
                {mod === "all" && <Icon name="filter_list" size={12} />}
                {mod === "all" ? "All Modules" : mod.charAt(0).toUpperCase() + mod.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <Icon name="search" size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.outlineVariant }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter descriptions..."
              style={{
                ...styles.inputField,
                width: 220,
                paddingLeft: 32,
                fontSize: 13,
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.primaryContainer}40`}
              onBlur={(e) => e.target.style.boxShadow = "none"}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: `${C.surfaceContainerLow}80` }}>
                {["Date", "Module", "Short Description", "Urgency", "Action"].map((h, i) => (
                  <th key={h} style={{
                    padding: "14px 24px",
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.09em", color: C.onSurfaceVariant,
                    textAlign: i >= 3 ? (i === 3 ? "center" : "right") : "left",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 24px", textAlign: "center", color: C.onSurfaceVariant, fontSize: 13 }}>
                    No service requests found.
                  </td>
                </tr>
              ) : filtered.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => setModalSR(row)}
                  style={{
                    borderTop: `1px solid ${C.surfaceContainer}`,
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = C.surfaceContainerLow}
                  onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{row.date}</div>
                    <div style={{ fontSize: 10, color: C.onSurfaceVariant }}>{row.time}</div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={styles.moduleChip}>{row.module}</span>
                  </td>
                  <td style={{ padding: "18px 24px", maxWidth: 320 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.desc}</p>
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "center" }}>
                    <UrgencyBadge urgency={row.urgency} />
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalSR(row); }}
                      style={{ background: "none", border: "none", color: C.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "6px 14px", borderRadius: 8, fontFamily: "'Inter',sans-serif", transition: "background 0.12s" }}
                      onMouseOver={(e) => e.currentTarget.style.background = C.primaryFixed}
                      onMouseOut={(e) => e.currentTarget.style.background = "none"}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.surfaceContainer}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: C.onSurfaceVariant, fontWeight: 500 }}>
            Showing 1 to {filtered.length} of {filtered.length} entries
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", padding: 6, borderRadius: 8, cursor: "pointer", color: C.onSurfaceVariant }}>
              <Icon name="chevron_left" size={18} />
            </button>
            <button style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#004e8a,#0066b2)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>1</button>
            <button style={{ background: "none", border: "none", padding: 6, borderRadius: 8, cursor: "pointer", color: C.onSurfaceVariant }}>
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalSR && (
        <SRModal
          sr={modalSR}
          onClose={() => setModalSR(null)}
          onEditInGenerator={(sr) => { onEditInGenerator(sr); }}
        />
      )}
    </>
  );
}
