import { useState, useRef, useEffect } from "react";
import { C, styles } from '../theme';
import Icon from '../components/Icon';
import Toast from '../components/Toast';
import { BASE_URL } from '../utils/baseurl';

export default function GeneratorPage({ onAddSR, prefill }) {
  const [issue, setIssue] = useState(() => localStorage.getItem("draft_issue") || "");
  const [module, setModule] = useState(() => localStorage.getItem("draft_module") || "Procurement");
  const [urgency, setUrgency] = useState(() => localStorage.getItem("draft_urgency") || "Medium");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [timeoutErr, setTimeoutErr] = useState(false);
  const [hasRegenerated, setHasRegenerated] = useState(false);
  const [quotaCount, setQuotaCount] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("api_quota"));
      if (stored && stored.date === new Date().toDateString()) return stored.count;
    } catch(e) {}
    return 0;
  });
  const outputRef = useRef();

  useEffect(() => {
    localStorage.setItem("draft_issue", issue);
    localStorage.setItem("draft_module", module);
    localStorage.setItem("draft_urgency", urgency);
  }, [issue, module, urgency]);

  useEffect(() => {
    const wakeUpAPI = async () => {
      try {
        const res = await fetch(`${BASE_URL}/`);
        if (res.ok) {
          const data = await res.json();
          console.log("Status:", data);
        }
      } catch (err) {
        console.error("API failed:", err);
      }
    };
    wakeUpAPI();
  }, []);

  const handleGenerate = async (isRegenerate = false) => {
    if (!issue.trim()) { setInputError(true); setTimeout(() => setInputError(false), 2000); return; }

    const today = new Date().toDateString();
    let quota = { date: today, count: 0 };
    try {
      const stored = JSON.parse(localStorage.getItem("api_quota"));
      if (stored && stored.date === today) quota = stored;
    } catch(e) {}

    if (quota.count >= 10) {
      alert("Daily limit reached. You can only generate 10 service requests per day.");
      return;
    }

    setLoading(true);
    if (!isRegenerate) { setOutput(null); setHasRegenerated(false); }
    else { setHasRegenerated(true); }

    let outputData = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${BASE_URL}/api/generator?user_input=${encodeURIComponent(issue)}&module=${encodeURIComponent(module)}&urgency=${encodeURIComponent(urgency)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      outputData = data.output;
      
      quota.count += 1;
      localStorage.setItem("api_quota", JSON.stringify(quota));
      setQuotaCount(quota.count);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);
      setLoading(false);
      if (err.name === 'AbortError') {
        setTimeoutErr(true);
        setTimeout(() => setTimeoutErr(false), 3000);
      }
      return; 
    }
    // console.log(outputData)
    const short = outputData?.short_description || outputData?.["Short Description"] || "";

    const result = {
      short,
      issue: outputData?.issue || outputData?.["Issue"] || "",
      impact: outputData?.business_impact || outputData?.["Business impact"] || outputData?.["Business Impact"] || "",
      env: "PROD",
      urgencyDetail: outputData?.urgency || outputData?.["Urgency"] || "",
      need: outputData?.solution_required_from_oracle || outputData?.["What we need from Oracle"] || outputData?.["What We Need from Oracle"] || "",
    };
    setOutput(result);
    setLoading(false);

    const now = new Date();
    onAddSR({
      id: `SR-${Date.now()}`,
      timestamp: Date.now(),
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " GMT",
      module, urgency,
      desc: short,
      full: { ...result },
    });
  };

  const handleCopy = () => {
    if (!output) return;
    const text = [
      `Short Description: ${output.short}`,
      `Issue: ${output.issue}`,
      `Business Impact: ${output.impact}`,
      `Environment: ${output.env}`,
      `Urgency: ${output.urgencyDetail}`,
      `What We Need from Oracle: ${output.need}`,
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    setIssue("");
    setModule("Procurement");
    setUrgency("High");
  };

  return (
    <>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8, color: C.onSurface }}>Service Request Generator</h2>
        <p style={{ color: C.onSurfaceVariant, fontSize: 16 }}>Generate structured Oracle Fusion SR descriptions instantly with AI precision.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 32, alignItems: "start" }}>

        {/* ── LEFT: Input Panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, color: C.primary, flexWrap: "wrap" }}>
              <Icon name="input" size={20} style={{ color: C.primary }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Input Details</span>
              
              <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, backgroundColor: C.surfaceContainerHighlight || "#eff6ff", color: C.primary, padding: "4px 10px", borderRadius: 9999, letterSpacing: "0.02em" }}>
                {Math.max(0, 10 - quotaCount)} / 10 Requests Remaining
              </div>
            </div>

            {/* Issue textarea */}
            <div style={{ marginBottom: 18 }}>
              <label style={styles.label}>Issue Description</label>
              <textarea
                rows={8}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe the issue in detail. Include steps to reproduce, affected users, and any error messages..."
                style={{
                  ...styles.inputField,
                  boxShadow: inputError ? `0 0 0 2px ${C.error}` : "none",
                  transition: "box-shadow 0.2s",
                }}
                onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.primaryContainer}`}
                onBlur={(e) => e.target.style.boxShadow = "none"}
              />
            </div>

            {/* Module + Urgency */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={styles.label}>Module</label>
                <select value={module} onChange={(e) => setModule(e.target.value)} style={styles.select}>
                  {["PIM", "Procurement", "SCM", "HCM", "Financials", "Inventory", "Others"].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Urgency Level</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={styles.select}>
                  {["Low", "Medium", "High", "Critical"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              style={{
                ...styles.generateBtn,
                filter: loading ? "brightness(0.85)" : "brightness(1)",
                transform: "scale(1)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.filter = "brightness(1.08)")}
              onMouseOut={(e) => e.currentTarget.style.filter = loading ? "brightness(0.85)" : "brightness(1)"}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {loading ? (
                <>
                  <Icon name="hourglass_top" size={20} style={{ color: "#fff" }} />
                  Generating...
                </>
              ) : (
                <>
                  <Icon name="auto_awesome" size={20} style={{ color: "#fff" }} />
                  Generate SR
                </>
              )}
            </button>
          </div>

          {/* Pro Tip */}
          <div style={{
            background: C.surfaceContainerHigh,
            borderRadius: 12,
            padding: "18px 20px",
            borderLeft: `4px solid ${C.tertiary}`,
          }}>
            <div style={{ display: "flex", gap: 14 }}>
              <Icon name="lightbulb" size={20} style={{ color: C.tertiary, flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: C.onTertiaryFixedVariant, lineHeight: 1.7, margin: 0 }}>
                <strong style={{ display: "block", marginBottom: 3 }}>Pro Tip:</strong>
                Including specific <strong>Error Message IDs</strong> (e.g., ORA-00001) helps the generator provide more accurate troubleshooting steps for Oracle Support engineers.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Output Panel ── */}
        <div style={{
          background: C.surfaceContainerLow,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0px 12px 32px rgba(28,28,26,0.06)",
          border: `0.5px solid ${C.outlineVariant}20`,
        }}>
          {/* Toolbar */}
          <div style={styles.outputToolbar}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: output ? "#22c55e" : loading ? "#f59e0b" : "#d1d5db",
                display: "inline-block",
                animation: loading ? "pulse 1s infinite" : output ? "pulse 2s infinite" : "none",
              }} />
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>Structured Output</span>
              {output && (
                <span style={{ marginLeft: 6, background: C.error, color: "#fff", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                  PROD
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleCopy}
                disabled={!output}
                style={{
                  ...styles.toolbarBtn,
                  background: "none",
                  color: output ? C.primary : C.outlineVariant,
                  cursor: output ? "pointer" : "not-allowed",
                }}
                onMouseOver={(e) => output && (e.currentTarget.style.background = C.primaryFixed)}
                onMouseOut={(e) => e.currentTarget.style.background = "none"}
              >
                <Icon name="content_copy" size={15} style={{ color: output ? C.primary : C.outlineVariant }} />
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button
                onClick={() => handleGenerate(true)}
                disabled={!output || loading || hasRegenerated}
                style={{
                  ...styles.toolbarBtn,
                  background: "none",
                  color: output ? C.onSurfaceVariant : C.outlineVariant,
                  border: `0.5px solid ${C.outlineVariant}40`,
                  cursor: output ? "pointer" : "not-allowed",
                }}
                onMouseOver={(e) => output && (e.currentTarget.style.background = C.surfaceContainerHighest)}
                onMouseOut={(e) => e.currentTarget.style.background = "none"}
              >
                <Icon name="refresh" size={15} style={{ color: output ? C.onSurfaceVariant : C.outlineVariant }} />
                {hasRegenerated ? "Regenerated" : "Regenerate"}
              </button>
            </div>
          </div>

          {/* Output Content */}
          <div
            ref={outputRef}
            style={{
              padding: "32px",
              background: C.surfaceContainerLowest,
              minHeight: 500,
              display: "flex",
              flexDirection: "column",
              alignItems: !output && !loading ? "center" : "stretch",
              justifyContent: !output && !loading ? "center" : "flex-start",
            }}
          >
            {/* Empty state */}
            {!output && !loading && (
              <div style={{ textAlign: "center", color: C.outlineVariant }}>
                <Icon name="description" size={48} style={{ color: C.outlineVariant, opacity: 0.5, marginBottom: 12 }} />
                <p style={{ fontSize: 13.5, fontWeight: 500, opacity: 0.6, marginBottom: 4 }}>Your structured SR will appear here</p>
                <p style={{ fontSize: 12, opacity: 0.35 }}>Fill in the details and click Generate SR</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 18, padding: "60px 0" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span key={i} style={{
                      width: 9, height: 9, borderRadius: "50%", background: C.primaryContainer,
                      animation: `pulseDot 1.4s ease-in-out ${delay}s infinite`,
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: C.onSurfaceVariant, fontWeight: 500 }}>Generating structured SR...</p>
              </div>
            )}

            {/* Output */}
            {output && !loading && (
              <div style={{ animation: "fadeUp 0.35s ease" }}>
                {[
                  ["Short Description", output.short],
                  ["Issue", output.issue],
                  ["Business Impact", output.impact],
                  ["Environment", output.env],
                  ["Urgency", output.urgencyDetail],
                  ["What We Need from Oracle", output.need],
                ].map(([label, val]) => (
                  <p key={label} style={{ marginBottom: 20, fontSize: 13.5, lineHeight: 1.8, color: C.onSurface }}>
                    <strong style={{ fontWeight: 700 }}>{label}:</strong>{" "}
                    {label === "Environment"
                      ? <span style={{ background: C.error, color: "#fff", padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>{val}</span>
                      : val}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <Toast show={copied} message="Copied to clipboard" />
      <Toast show={timeoutErr} message="Request timed out after 30 seconds. Please try again." />

      <style>{`
        @keyframes pulseDot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </>
  );
}
