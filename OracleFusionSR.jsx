import { useState, useEffect } from "react";
import { C, styles } from './theme';
import Icon from './components/Icon';
import GeneratorPage from './pages/GeneratorPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [page, setPage] = useState("generator");
  const [srList, setSrList] = useState(() => {
    const saved = localStorage.getItem('sr_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        // Keep only entries from the last 15 days, max 15 entries
        return parsed.filter(sr => sr.timestamp && (now - sr.timestamp <= 15 * 24 * 60 * 60 * 1000)).slice(0, 15);
      } catch (e) {
        console.error("Failed to parse SR history", e);
        return [];
      }
    }
    return [];
  });
  const [prefill, setPrefill] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("isDark") === "true");

  useEffect(() => {
    localStorage.setItem('sr_history', JSON.stringify(srList));
  }, [srList]);

  const handleAddSR = (sr) => setSrList((prev) => [sr, ...prev].slice(0, 15));

  const handleEditInGenerator = (sr) => {
    setPrefill(sr);
    setPage("generator");
  };

  return (
    <>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div style={{ ...styles.app, filter: isDark ? "invert(1) hue-rotate(180deg)" : "none", transition: "filter 0.3s ease" }}>

        {/* ── HEADER ── */}
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="diamond" size={32} fill={1} style={{ color: C.primaryContainer }} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "#1e40af", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                SR Generator
              </h1>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.onSurfaceVariant, opacity: 0.6 }}>
                Precision Architect Suite
              </p>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <button onClick={() => setPage("generator")} style={styles.topTab(page === "generator")}>Dashboard</button>
            <button onClick={() => setPage("history")} style={styles.topTab(page === "history")}>History</button>
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("support"); }} style={styles.topTab(page === "support")}>Support</a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setPage("history")}
              style={{ background: "linear-gradient(135deg,#004e8a,#0066b2)", color: "#fff", padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}
            >
              History
            </button>
            <button 
              onClick={() => { setIsDark(!isDark); localStorage.setItem("isDark", !isDark); }} 
              style={{ background: "none", border: "none", padding: 8, borderRadius: "50%", cursor: "pointer", color: C.onSurfaceVariant }}
            >
              <Icon name="dark_mode" size={20} />
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ display: "flex", paddingTop: 64, minHeight: "100vh" }}>

          {/* ── SIDEBAR ── */}
          <aside style={styles.sidebar}>
            {page === "generator" ? (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.onSurfaceVariant, padding: "0 8px", marginBottom: 10 }}>
                  Main Menu
                </p>
                <button onClick={() => setPage("generator")} style={styles.navItem(page === "generator")}>
                  <Icon name="edit_note" size={20} style={{ color: page === "generator" ? C.primary : C.onSurfaceVariant }} />
                  Generator
                </button>
                <button onClick={() => setPage("history")} style={styles.navItem(page === "history")}>
                  <Icon name="history" size={20} style={{ color: C.onSurfaceVariant }} />
                  SR History
                </button>
              </>
            ) : (
              <>
                <div style={{ padding: "0 6px", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 900, color: "#1e3a8a" }}>Service Portal</h2>
                  <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280" }}>Enterprise SR</p>
                </div>
                <button onClick={() => setPage("generator")} style={styles.histNavItem(false)}>
                  <Icon name="bolt" size={18} style={{ color: C.onSurfaceVariant }} />
                  Generator
                </button>
                <button onClick={() => setPage("history")} style={styles.histNavItem(true)}>
                  <Icon name="history" size={18} fill={1} style={{ color: C.primary }} />
                  SR History
                </button>
              </>
            )}
          </aside>

          {/* ── MAIN ── */}
          <main style={styles.mainContent}>
            {page === "generator" && <GeneratorPage key={prefill?.id} onAddSR={handleAddSR} prefill={prefill} />}
            {page === "history" && <HistoryPage srList={srList} onEditInGenerator={handleEditInGenerator} />}
            {page === "support" && (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <Icon name="support_agent" size={64} style={{ color: C.primary, opacity: 0.8, marginBottom: 16 }} />
                <h2 style={{ fontSize: 28, fontWeight: 800, color: C.onSurface, marginBottom: 12 }}>Contact Support</h2>
                <p style={{ fontSize: 16, color: C.onSurfaceVariant, lineHeight: 1.6 }}>
                  If you have any queries regarding the application, please reach out.<br/><br/>
                  Contact: <a href="mailto:vijayybala.31@gmail.com" style={{ color: C.primaryContainer, fontWeight: 700, textDecoration: "none", filter: isDark ? "invert(1) hue-rotate(180deg)" : "none" }}>vijayybala.31@gmail.com</a>
                </p>
              </div>
            )}
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
          background: "#fff", display: "flex", justifyContent: "space-around", alignItems: "center",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
          borderTop: `0.5px solid ${C.outlineVariant}30`,
          zIndex: 50,
        }}>
          {[
            { icon: "edit_note", label: "Generate", p: "generator" },
            { icon: "history", label: "History", p: "history" },
          ].map(({ icon, label, p }) => (
            <button
              key={label}
              onClick={() => p && setPage(p)}
              style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", color: page === p ? C.primary : "#9ca3af", fontFamily: "'Inter',sans-serif" }}
            >
              <Icon name={icon} size={22} style={{ color: page === p ? C.primary : "#9ca3af" }} />
              <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
            </button>
          ))}
        </nav>

      </div>
    </>
  );
}
