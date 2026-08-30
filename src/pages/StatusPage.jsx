import { useState } from "react";
import { Search, Volume2, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ApplicationTimeline } from "../components/ComplaintTimeline";
import { speakText } from "../services/voiceService";
import DemoNote from "../components/DemoNote";
import TrustBadge from "../components/TrustBadge";

export default function StatusPage() {
  const { applications, language, t } = useApp();
  const [appId, setAppId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = () => {
    setError("");
    const matched = applications.find(
      (app) => app.id.trim().toUpperCase() === appId.trim().toUpperCase()
    );

    if (matched) {
      setResult(matched);
    } else {
      setResult(null);
      setError(t("errorNoAppFound"));
    }
  };

  const handleHearStatus = () => {
    if (result?.voiceSummary) {
      const summaryText = result.voiceSummary[language] || result.voiceSummary.en || result.voiceSummary;
      speakText(summaryText, language);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>{t("status")}</h1>
        <p>{t("appTrackerSub")}</p>
      </div>

      <div className="grid status-main-grid">
        {/* Left column: Search and Details */}
        <div className="card status-card">
          <h2>🔍 {t("queryRefId")}</h2>
          <div className="status-input-row mt-2">
            <input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="APP-2026-08321"
              aria-label="Application reference ID"
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
            <button type="button" className="primary" onClick={handleCheck}>
              <Search size={17} aria-hidden="true" /> {t("checkBtn")}
            </button>
          </div>
          <DemoNote>{t("preloadedIdPrompt")}: <strong>APP-2026-08321</strong>. Or submit an application on the Schemes page to get a new ID.</DemoNote>

          {error && <div className="demo-note error-note mt-3">{error}</div>}

          {result && (
            <div className="result-details-box mt-3 animate-fade-in">
              <div className="result-header-row">
                <h3>{result.type}</h3>
                <span className="badge" style={{ backgroundColor: `${result.statusColor}22`, color: result.statusColor, border: `1px solid ${result.statusColor}` }}>
                  {result.status}
                </span>
              </div>
              <p><strong>Service:</strong> {result.serviceName}</p>
              <p><strong>State Jurisdiction:</strong> {result.state}</p>
              <p><strong>Last Update:</strong> {result.lastUpdate}</p>
              <p><strong>Next Step:</strong> {result.nextStep}</p>

              <div className="timeline-container mt-3">
                <ApplicationTimeline steps={result.timeline} />
              </div>

              <div className="response-actions mt-3">
                <button type="button" className="primary" onClick={handleHearStatus}>
                  <Volume2 size={17} aria-hidden="true" /> {t("hearStatusSummary")}
                </button>
              </div>

              <div className="trust-row-inline mt-2">
                <TrustBadge type="demo" />
                <TrustBadge type="ai" />
              </div>
            </div>
          )}
        </div>

        {/* Right column: Active Applications list */}
        <div className="card active-apps-card">
          <h2>📋 {t("myActiveApps")} ({applications.length})</h2>
          <p className="card-sub">Click an application reference to load its timeline.</p>
          <div className="apps-list mt-2">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className={`app-item-row ${result?.id === app.id ? 'active' : ''}`}
                onClick={() => {
                  setAppId(app.id);
                  setResult(app);
                  setError("");
                }}
              >
                <div className="app-meta">
                  <strong>{app.id}</strong>
                  <div>{app.serviceName}</div>
                  <small className="text-secondary"><Calendar size={12} className="inline-icon" /> {app.date}</small>
                </div>
                <span className="app-status-pill" style={{ color: app.statusColor }}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
