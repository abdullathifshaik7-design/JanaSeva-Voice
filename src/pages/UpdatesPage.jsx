import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { speakText } from "../services/voiceService";
import { Volume2, Landmark, CheckCircle, ExternalLink, X, AlertCircle } from "lucide-react";
import DemoNote from "../components/DemoNote";

export default function UpdatesPage() {
  const { userProfile, schemes, addApplication, user, t, t_db } = useApp();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [successApplyMsg, setSuccessApplyMsg] = useState("");

  const profession = userProfile?.profession || "Farmer";

  // Match profession to scheme categories
  const getCategoryForProfession = (prof) => {
    switch (prof) {
      case "Farmer": return "farmers";
      case "Student": return "education";
      case "Senior Citizen": return "pension";
      case "Worker": return "employment";
      case "Woman": return "women";
      default: return "all";
    }
  };

  const targetCategory = getCategoryForProfession(profession);

  // Filter schemes: prioritize targetCategory, then show others
  const targetedSchemes = schemes.filter(s => s.category === targetCategory);
  const otherSchemes = schemes.filter(s => s.category !== targetCategory);
  const sortedSchemes = [...targetedSchemes, ...otherSchemes];

  const handleSpeak = async (scheme) => {
    if (isSpeaking) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const speechText = `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefits}. Eligibility: ${scheme.eligibility}.`;
    await speakText(speechText, "en");
    setIsSpeaking(false);
  };

  const handleApplyDemo = (scheme) => {
    const refId = `JSV-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    addApplication({
      id: refId,
      schemeId: scheme.id,
      schemeName: scheme.name,
      citizenName: user?.email || user?.phone || "Guest User",
      status: "Submitted",
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      timeline: [
        { title: "Application Submitted", done: true, current: true, date: "Today" },
        { title: "Document Verification", done: false, current: false, date: "Pending" },
        { title: "Sanction Status", done: false, current: false, date: "Pending" }
      ]
    });
    setSuccessApplyMsg(`Applied successfully! Reference ID: ${refId}. You can track status on the Application Status tab.`);
    setTimeout(() => setSuccessApplyMsg(""), 5000);
  };

  return (
    <div>
      <div className="page-title">
        <h1>🔔 {t("updates") || "Personalized Alerts"}</h1>
        <p>Targeted alerts prioritized based on your profile profession: <b>{profession}</b>.</p>
      </div>

      {successApplyMsg && (
        <div className="demo-note success-note mb-3" style={{ background: "#f0fdf4", color: "#166534" }}>
          {successApplyMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }} className="text-left">
        {sortedSchemes.map((scheme) => {
          const isTargeted = scheme.category === targetCategory;
          return (
            <div 
              key={scheme.id} 
              className="card notification-card" 
              style={{ 
                borderLeft: isTargeted ? "4px stroke #0ea5e9" : "4px stroke #94a3b8",
                borderColor: isTargeted ? "#0ea5e9" : "#e2e8f0",
                cursor: "pointer" 
              }}
              onClick={() => setSelectedScheme(scheme)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge" style={{ background: isTargeted ? "#e0f2fe" : "#f1f5f9", color: isTargeted ? "#0369a1" : "#475569" }}>
                  {isTargeted ? `🎯 ${t("recommendedForYou") || "Recommended for You"}` : `🔔 ${t("newScheme") || "New Scheme"}`}
                </span>
                <span className="small text-secondary">{scheme.lastVerified || "28 Aug 2026"}</span>
              </div>
              <h3 style={{ margin: "10px 0 5px 0" }}>{t_db(scheme.id, "name", scheme.name)}</h3>
              <p className="small text-secondary" style={{ margin: "0 0 10px 0" }}>
                {t("state") || "State"}: <b>{scheme.state || t("nationalCentral") || "Central"}</b> | {t("level") || "Level"}: <b>{scheme.governmentLevel}</b>
              </p>
              <p className="text-secondary small" style={{ lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {t_db(scheme.id, "description", scheme.description)}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <span style={{ fontSize: "12px", color: "#0ea5e9", fontWeight: "700" }}>{t("clickViewDetails") || "Click to view details & apply →"}</span>
                <span className="badge">{t(`cat_${scheme.category}`) || scheme.category.toUpperCase()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Scheme Details Modal */}
      {selectedScheme && (
        <div className="modal-backdrop" onClick={() => setSelectedScheme(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "95%" }}>
            <div className="modal-head">
              <div>
                <h2>{t_db(selectedScheme.id, "name", selectedScheme.name)}</h2>
                <div className="small text-secondary">{t("state") || "State"}: {selectedScheme.state || t("nationalCentral") || "Central"} | {t("level") || "Level"}: {selectedScheme.governmentLevel}</div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setSelectedScheme(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="text-left" style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "70vh", overflowY: "auto", padding: "10px 0" }}>
              <div>
                <h4>{t("description") || "Description"}</h4>
                <p>{t_db(selectedScheme.id, "description", selectedScheme.description)}</p>
              </div>

              <div>
                <h4>{t("benefits") || "Benefits"}</h4>
                <p>{t_db(selectedScheme.id, "benefits", selectedScheme.benefits)}</p>
              </div>

              <div>
                <h4>{t("eligibility") || "Eligibility Rules"}</h4>
                <p>{t_db(selectedScheme.id, "eligibility", selectedScheme.eligibility)}</p>
              </div>

              <div>
                <h4>{t("requiredDocuments") || "Required Documents"}</h4>
                <ul style={{ paddingLeft: "20px" }}>
                  {selectedScheme.requiredDocuments?.map((doc, idx) => (
                    <li key={idx}>{t(doc) || doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4>{t("officialInfo") || "Official Information"}</h4>
                <p className="small">
                  {t("department") || "Department"}: <b>{selectedScheme.department}</b><br />
                  {t("helpline") || "Helpline"}: <b>{selectedScheme.helpline || "1800-xxx-xxxx"}</b>
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="primary" onClick={() => { handleApplyDemo(selectedScheme); setSelectedScheme(null); }}>
                  {t("applyNow") || "Apply Now (Demo)"}
                </button>
                <button type="button" className="secondary-btn" onClick={() => handleSpeak(selectedScheme)}>
                  <Volume2 size={16} /> {isSpeaking ? (t("stopListening") || "Stop Listening") : `🔊 ${t("listenScheme") || "Listen Details"}`}
                </button>
                {selectedScheme.officialWebsite && (
                  <a 
                    href={selectedScheme.officialWebsite} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="secondary-btn"
                    style={{ display: "inline-flex", alignItems: "center", gap: "5px", textDecoration: "none", color: "inherit" }}
                  >
                    {t("visitPortal") || "Visit Portal"} <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DemoNote>Personalized alerts ensure relevant programs (like agriculture or pension support) are prioritized based on profile configurations.</DemoNote>
    </div>
  );
}
