import { useState } from "react";
import { Landmark, Mic, ShieldCheck, Search, Volume2, PhoneCall, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";
import { STATES, CATEGORIES } from "../data/db";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import VoiceWaveform from "../components/VoiceWaveform";
import VoiceButton from "../components/VoiceButton";
import DemoNote from "../components/DemoNote";
import Logo from "../components/Logo";

export default function HomePage() {
  const {
    setPage,
    setVoiceTab,
    selectedState,
    setSelectedState,
    seniorMode,
    setSeniorMode,
    language,
    setCategoryFilter,
    schemes,
    services,
    addFeedback,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const voice = useVoiceAssistant();

  // Senior feedback states
  const [seniorFbSubmitted, setSeniorFbSubmitted] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = query.toLowerCase();
    
    // Search across schemes and services
    const matchingSchemes = schemes.filter(s => 
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.alternateNames.some(alt => alt.toLowerCase().includes(lower)) ||
      s.category.toLowerCase().includes(lower)
    );

    const matchingServices = services.filter(s => 
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.alternateNames.some(alt => alt.toLowerCase().includes(lower)) ||
      s.category.toLowerCase().includes(lower)
    );

    setSearchResults([...matchingSchemes.map(s => ({ ...s, type: "scheme" })), ...matchingServices.map(s => ({ ...s, type: "service" }))]);
  };

  const handleSeniorHelpfulness = (val) => {
    addFeedback({
      type: "scheme",
      schemeName: "Senior Citizen Voice Inquiry",
      helpfulness: val
    });
    setSeniorFbSubmitted(true);
    alert("ధన్యవాదాలు! / Thank you!");
  };

  // Senior Citizen Dashboard Layout
  if (seniorMode) {
    return (
      <div className="senior-dashboard animate-fade-in">
        <div className="senior-hero text-center card" style={{ borderColor: "#d97706" }}>
          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center" }}>
            <Logo size={64} />
          </div>
          <h1>{t("seniorTitle")}</h1>
          <p className="large-lead" style={{ fontSize: "20px" }}>{t("seniorSub")}</p>
          <div className="demo-note">{t("activeState")}: <b>{selectedState}</b> | {t("activeLanguage")}: <b>{language.toUpperCase()}</b></div>
        </div>

        {/* Voice Assistant Interaction Block */}
        <div className="card text-center voice-action-card">
          <h2>{voice.isListening ? `🔴 ${t("listening")}` : voice.isFindingLocation ? "📍 Finding near me..." : `🎤 ${t("seniorSpeakPrompt")}`}</h2>
          <p className="text-secondary" style={{ fontSize: "16px", fontWeight: "600" }}>{t("seniorSpeakExample")}</p>
          
          <VoiceWaveform active={voice.isListening || voice.isProcessing || voice.isFindingLocation} />

          {voice.transcript && (
            <div className="voice-bubble user-speech mt-2 mb-2" style={{ background: "#f1f5f9" }}>
              <span className="user-label">{t("youSpoke")}:</span>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>&ldquo;{voice.transcript}&rdquo;</p>
            </div>
          )}
          
          {voice.hasResponse && (
            <div className="senior-response-block card mt-2" style={{ background: "#f8fafc" }}>
              <h3 style={{ fontSize: "20px" }}>{t("response")}</h3>
              <p className="senior-response-text" style={{ fontSize: "20px", color: "#1e3a5f" }}>{voice.response}</p>
              
              {/* Geolocation results inside Senior Mode */}
              {voice.locationResults.length > 0 && (
                <div className="mt-3 text-left">
                  <h4 style={{ fontSize: "18px" }}>📍 Nearest Centers Found:</h4>
                  {voice.locationResults.slice(0, 2).map((center, idx) => (
                    <div key={idx} className="card p-3 mb-2 bg-white" style={{ border: "1px solid #cbd5e1" }}>
                      <strong>{center.name} ({center.distance.toFixed(1)} km away)</strong>
                      <p className="small text-secondary mb-1">{center.address}</p>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-btn text-success"
                        style={{ fontWeight: "800", fontSize: "16px" }}
                      >
                        📍 Directions
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {voice.error && <div className="demo-note error-note mt-2 mb-2">{voice.error}</div>}

          {/* Large Action Buttons specific for Senior Citizens */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
            
            {/* 1. SPEAK */}
            <button 
              type="button" 
              className="senior-big-btn mic-btn" 
              onClick={voice.activate}
              aria-label="Start speaking"
              style={{ width: "100%", margin: "0" }}
            >
              <Mic size={32} />
              <span>🎤 {t("speakBtn")} / మాట్లాడండి</span>
            </button>

            <div className="grid grid-2" style={{ gap: "15px" }}>
              {/* 2. REPEAT */}
              <button 
                type="button" 
                className="senior-big-btn secondary" 
                onClick={voice.repeatResponse}
                disabled={!voice.response}
                style={{ width: "100%", margin: "0", opacity: voice.response ? 1 : 0.6 }}
              >
                <Volume2 size={24} />
                <span>{t("repeatBtn")}</span>
              </button>

              {/* 3. FIND NEAR ME */}
              <button 
                type="button" 
                className="senior-big-btn" 
                onClick={() => voice.activate()} 
                style={{ width: "100%", margin: "0", background: "#0369a1", color: "white" }}
              >
                <MapPin size={24} />
                <span>📍 Find Near Me</span>
              </button>
            </div>

            {/* 4. CALL HELPLINE 14567 */}
            <a 
              href="tel:14567" 
              className="senior-big-btn" 
              style={{ 
                width: "100%", 
                margin: "0", 
                background: "#16a34a", 
                color: "white", 
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
              onClick={() => alert("Calling Official Senior Citizen Helpline — 14567")}
            >
              <PhoneCall size={24} />
              <span>📞 Call Official Helpline 14567</span>
            </a>

            {/* 4b. CALL JANA SEVA AI SIMULATOR */}
            <button 
              type="button" 
              className="senior-big-btn" 
              style={{ 
                width: "100%", 
                margin: "0", 
                background: "#0284c7", 
                color: "white", 
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
              onClick={() => {
                if (setVoiceTab) setVoiceTab("phone_call");
                setPage("voice");
              }}
            >
              <PhoneCall size={24} />
              <span>🎙️ Call JanaSeva AI</span>
            </button>

            {/* 5. FEEDBACK */}
            {voice.response && !seniorFbSubmitted && (
              <div className="card p-3 border-warning mt-2 text-left bg-light">
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Was this information helpful?</h4>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="secondary-btn" onClick={() => handleSeniorHelpfulness("helpful")}>👍 Helpful</button>
                  <button type="button" className="secondary-btn" onClick={() => handleSeniorHelpfulness("somewhat")}>😐 Somewhat</button>
                  <button type="button" className="secondary-btn" onClick={() => handleSeniorHelpfulness("unhelpful")}>👎 Not Helpful</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exit Option */}
        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          <button type="button" className="senior-card exit-card" style={{ flex: 1, padding: "15px" }} onClick={() => setSeniorMode(false)}>
            <span className="senior-emoji">🚪</span>
            <h3>{t("exitSeniorBtn")}</h3>
          </button>
        </div>
      </div>
    );
  }

  // Standard Dashboard Layout
  return (
    <>
      <section className="hero animate-fade-in">
        <div className="eyebrow-row">
          <Logo size={32} showText={true} />
          <div className="state-selector-wrapper">
            <label htmlFor="state-filter">State: </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="state-select"
            >
              {STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <h1>{t("homeTitle")}</h1>
        <p>
          <b>{t("tagline")}</b>
          <br />
          {t("homeSub")}
        </p>
        <div className="hero-actions">
          <button type="button" className="primary" onClick={() => setPage("voice")}>
            <Mic size={18} aria-hidden="true" /> {t("startSpeaking")}
          </button>
          <button type="button" className="secondary" onClick={() => setPage("schemes")}>
            <Landmark size={17} aria-hidden="true" /> {t("exploreServices")}
          </button>
          <button type="button" className="senior-trigger-btn" onClick={() => setSeniorMode(true)}>
            👵 {t("seniorModeBtn")}
          </button>
        </div>
      </section>

      {/* Main Helpline Banner & Call JanaSeva AI Section */}
      <div className="card p-3 mb-4 border-warning" style={{ background: "#fef8e6", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "14px" }}>
        <div style={{ textAlign: "left", flex: "1 1 300px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📞</span>
            <strong style={{ fontSize: "17px", color: "#92400e" }}>Call JanaSeva — AI Voice Call</strong>
          </div>
          <p className="text-secondary small mt-1 mb-0" style={{ fontSize: "13px", lineHeight: "1.4" }}>
            Voice assistance available in <b>Telugu, Hindi, Tamil, and English</b>.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary"
            style={{ background: "#16a34a", padding: "10px 18px", borderRadius: "8px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            onClick={() => {
              if (setVoiceTab) setVoiceTab("phone_call");
              setPage("voice");
            }}
          >
            <PhoneCall size={16} /> <b>🎙️ Try Call Simulator</b>
          </button>
        </div>
      </div>

      {/* Universal Search Bar */}
      <section className="card search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search schemes and services"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="search-results-box">
            <h3>{t("searchResultsTitle")} ({searchResults.length})</h3>
            <div className="search-results-list">
              {searchResults.map(res => (
                <div 
                  key={res.id} 
                  className="search-result-item"
                  onClick={() => {
                    setCategoryFilter(res.category);
                    setPage("schemes");
                  }}
                >
                  <div className="result-header">
                    <strong>{res.name}</strong>
                    <span className="badge">{res.type.toUpperCase()}</span>
                  </div>
                  <p>{res.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="voice-card hero-voice">
        <div className="voice-copy">
          <h2>{t("howCanHelp")}</h2>
          <p>{t("tapMicSpeak")}</p>
          <VoiceWaveform active={voice.isListening || voice.isProcessing} />
          <div className="demo-note inline">Try speaking: &ldquo;నాకు 60 సంవత్సరాలు. వృద్ధాప్య పెన్షన్ ఎలా పొందాలి?&rdquo;</div>
        </div>
        <VoiceButton
          onClick={() => setPage("voice")}
          label="🎤 Tap to Speak"
        />
      </section>

      <div className="section-head">
        <div>
          <h2>{t("exploreCategory")}</h2>
          <p>{t("askPrompt")}</p>
        </div>
      </div>
      
      <div className="grid category-grid-home">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat.id} 
            type="button" 
            className="card category-home-card"
            onClick={() => {
              setCategoryFilter(cat.id);
              setPage("schemes");
            }}
          >
            <span className="cat-emoji">{cat.emoji}</span>
            <h3>{t(`cat_${cat.id}`)}</h3>
            <p>{cat.desc}</p>
          </button>
        ))}
      </div>

      <div className="section-head mt-4">
        <div>
          <h2>{t("importantTools")}</h2>
        </div>
      </div>
      
      <div className="updates">
        <div className="card">
          <div className="update" onClick={() => setPage("status")}>
            <div className="badge success">TRACK</div>
            <div>
              <b>{t("trackApp")}</b>
              <div className="update-text">{t("trackAppSub")}</div>
            </div>
          </div>
          <div className="update" onClick={() => setPage("help")}>
            <div className="badge info">HELP</div>
            <div>
              <b>{t("serviceCentersNearMe")}</b>
              <div className="update-text">{t("serviceCentersNearMeSub")}</div>
            </div>
          </div>
        </div>
        
        <div className="card trust-card">
          <ShieldCheck color="#198754" size={24} aria-hidden="true" />
          <div>
            <b>{t("trustTitle")}</b>
            <div className="trust-card-text">{t("trustDesc")}</div>
          </div>
        </div>
      </div>
    </>
  );
}
