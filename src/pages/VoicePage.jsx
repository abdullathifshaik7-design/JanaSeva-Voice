import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import { getConversationContext, speakText } from "../services/voiceService";
import VoiceButton from "../components/VoiceButton";
import VoiceWaveform from "../components/VoiceWaveform";
import { VOICE_STATES } from "../services/voiceService";
import { Volume2, RefreshCw, MapPin, PhoneCall, PhoneOff, Check, AlertCircle, Link, Upload, Eye } from "lucide-react";
import DemoNote from "../components/DemoNote";

export default function VoicePage() {
  const { language, t, addFeedback, addApplication, user } = useApp();
  const voice = useVoiceAssistant();
  const context = getConversationContext();

  const [activeTab, setActiveTab] = useState("assistant"); // 'assistant' or 'phone_call'

  // Feedback states
  const [feedbackPromptOpen, setFeedbackPromptOpen] = useState(true);
  const [rateFormOpen, setRateFormOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Phone Call Simulator States
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStage, setCallStage] = useState(1);
  const [callLogs, setCallLogs] = useState([]);
  const [phoneAppScannerOpen, setPhoneAppScannerOpen] = useState(false);
  const [phoneScanFile, setPhoneScanFile] = useState(null);
  const [phoneFileDetected, setPhoneFileDetected] = useState("");
  const [phoneFieldVal, setPhoneFieldVal] = useState("");
  const [isSpeakingCall, setIsSpeakingCall] = useState(false);

  // Chat message feed logs state
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (voice.transcript) {
      setMessages(prev => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].sender === "user") {
          copy[copy.length - 1].text = voice.transcript;
          return copy;
        } else {
          return [...copy, { sender: "user", text: voice.transcript }];
        }
      });
    }
  }, [voice.transcript]);

  useEffect(() => {
    if (voice.response) {
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].sender === "assistant" && prev[prev.length - 1].text === voice.response) {
          return prev;
        }
        return [...prev, { sender: "assistant", text: voice.response }];
      });
    }
  }, [voice.response]);

  // Timer for active calls
  useEffect(() => {
    let interval = null;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  const speakCallAgent = async (text) => {
    setIsSpeakingCall(true);
    // Log agent utterance
    setCallLogs(prev => [...prev, { sender: "agent", text }]);
    await speakText(text, language);
    setIsSpeakingCall(false);
  };

  const startPhoneCall = async () => {
    setCallActive(true);
    setCallStage(1);
    setCallLogs([]);
    setPhoneAppScannerOpen(false);
    setPhoneScanFile(null);
    setPhoneFieldVal("");

    const welcomes = {
      en: "Welcome to JanaSeva Voice Helpline. How can we help you today? Speak or tell us what service you need.",
      te: "జనసేవ వాయిస్ హెల్ప్‌లైన్‌కు స్వాగతం. ఈరోజు మేము మీకు ఎలా సహాయం చేయగలము? మీకు ఏ సేవ కావాలో చెప్పండి.",
      hi: "जनसेवा वॉयस हेल्पलाइन में आपका स्वागत है। आज हम आपकी क्या सहायता कर सकते हैं? बताएं आपको किस सेवा की आवश्यकता है।",
      ta: "ஜனசேவா குரல் உதவி மையத்திற்கு உங்களை வரவேற்கிறோம். இன்று நாங்கள் உங்களுக்கு எவ்வாறு உதவ முடியும்?"
    };

    setTimeout(() => {
      speakCallAgent(welcomes[language] || welcomes.en);
    }, 1000);
  };

  const endPhoneCall = () => {
    setCallActive(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleSimulateUserSpeech = async (userSays) => {
    setCallLogs(prev => [...prev, { sender: "user", text: userSays }]);

    if (callStage === 1) {
      setCallStage(2);
      const responses = {
        en: "Understood. You want to apply for the Old Age Pension. This service requires your Aadhaar Card. I am sending a secure app link to your phone now to scan it. Please click the link to continue.",
        te: "అర్థమైంది. మీరు వృద్ధాప్య పెన్షన్ కోసం దరఖాస్తు చేయాలనుకుంటున్నారు. దీనికి మీ ఆధార్ కార్డ్ అవసరం. దాన్ని స్కాన్ చేయడానికి నేను మీ స్క్రీన్‌కు ఒక లింక్‌ను పంపుతున్నాను. దయచేసి ఆ లింక్‌ను క్లిက် చేయండి.",
        hi: "समझ गया। आप वृद्धावस्था पेंशन के लिए आवेदन करना चाहते हैं। इसके लिए आपके आधार कार्ड की आवश्यकता होगी। इसे स्कैन करने के लिए मैं आपके फोन पर एक लिंक भेज रहा हूँ। जारी रखने के लिए लिंक पर क्लिक करें।",
        ta: "புரிந்துகொண்டேன். முதியோர் ஓய்வூதியத்திற்கு விண்ணப்பிக்க விரும்புகிறீர்கள். இதற்கு ஆதார் அட்டை தேவை. அதை ஸ்கேன் செய்ய உங்கள் திரைக்கு ஒரு லிంக் அனுப்புகிறேன்."
      };
      await speakCallAgent(responses[language] || responses.en);
    } else if (callStage === 4) {
      if (!phoneFieldVal) {
        await speakCallAgent("Please type your Aadhaar number in the field on the screen first.");
        return;
      }
      setCallStage(5);
      const responses = {
        en: "Excellent! Your Aadhaar number has been verified. I am now submitting your application to the Social Welfare Department. You will receive progress notifications. Thank you for calling JanaSeva Voice.",
        te: "చాలా బాగుంది! మీ ఆధార్ నంబర్ ధృవీకరించబడింది. నేను మీ దరఖాస్తును సాంఘిక సంక్షేమ శాఖకు సమర్పిస్తున్నాను. ధన్యవాదాలు.",
        hi: "बहुत बढ़िया! आपका आधार नंबर सत्यापित हो गया है। मैं अब आपका आवेदन समाज कल्याण विभाग को जमा कर रहा हूँ। कॉल करने के लिए धन्यवाद।",
        ta: "மிக நன்று! உங்கள் ஆதார் எண் சரிபார்க்கப்பட்டது. உங்கள் விண்ணப்பம் சமர்ப்பிக்கப்பட்டது. அழைப்பிற்கு நன்றி."
      };
      
      // Register application
      const refId = `JSV-APP-PHN-${Math.floor(100000 + Math.random() * 900000)}`;
      addApplication({
        id: refId,
        schemeId: "s-1",
        schemeName: "NTR Bharosa Pension",
        citizenName: user?.email || user?.phone || "Phone Helpline User",
        status: "Submitted",
        date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
        timeline: [
          { title: "Submitted via Phone Call", done: true, current: true, date: "Today" }
        ]
      });

      await speakCallAgent(responses[language] || responses.en);
      setTimeout(() => endPhoneCall(), 3000);
    }
  };

  const handlePhoneFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoneScanFile(file);
    setTimeout(() => {
      setPhoneFileDetected("Aadhaar Card");
      setCallStage(3);
      speakCallAgent("I see your Aadhaar card is uploaded successfully. Now look at the 12-digit number at the front and fill it in the box on your screen, then tell me when you are done.");
    }, 1500);
  };

  const getTitle = () => {
    switch (voice.state) {
      case VOICE_STATES.LISTENING:
        return t("listening");
      case VOICE_STATES.PROCESSING:
        return t("processing");
      case VOICE_STATES.FINDING_LOCATION:
        return `📍 ${t("findingLocationTitle")}`;
      case VOICE_STATES.RESPONSE:
        return t("response");
      default:
        return `🎤 ${t("appName")}`;
    }
  };

  const getDesc = () => {
    switch (voice.state) {
      case VOICE_STATES.LISTENING:
        return t("listeningDesc");
      case VOICE_STATES.PROCESSING:
        return t("processingDesc");
      case VOICE_STATES.FINDING_LOCATION:
        return t("findingLocationDesc");
      case VOICE_STATES.RESPONSE:
        return t("responseDesc");
      default:
        return t("askPrompt");
    }
  };

  const langLabels = {
    en: "English", te: "తెలుగు", hi: "हिंदी", ta: "தமிழ்", kn: "ಕನ್ನಡ", ml: "മലയാളം", mr: "मराठी", bn: "বাংলা", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", or: "ଓଡ଼ିଆ", as: "অসমীয়া", ur: "اردو"
  };

  const handleHelpfulness = (val) => {
    addFeedback({
      type: "scheme",
      schemeName: context.category ? `${context.category} Inquiry` : "General Voice Inquiry",
      helpfulness: val
    });
    alert(t("thankYouFeedback") || "Thank you for your feedback!");
    setFeedbackPromptOpen(false);
  };

  const handleAppFeedback = (e) => {
    e.preventDefault();
    addFeedback({
      type: "app",
      rating: ratingVal,
      comment: commentVal
    });
    setRateFormOpen(false);
    setFeedbackSubmitted(true);
    alert(t("thankYouExperience") || "Thank you for sharing your experience!");
  };

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="page-title">
        <h1>🎙️ Voice Helpline</h1>
        <p>Talk directly with the JanaSeva Voice AI assistant or simulate a telephone agent phone call experience.</p>
      </div>

      {/* Tabs segment */}
      <div style={{ display: "flex", gap: "5px", background: "#f1f5f9", padding: "4px", borderRadius: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeTab === "assistant" ? "#ffffff" : "transparent",
            color: activeTab === "assistant" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => { setActiveTab("assistant"); endPhoneCall(); }}
        >
          🗣️ Voice Assistant
        </button>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeTab === "phone_call" ? "#ffffff" : "transparent",
            color: activeTab === "phone_call" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => setActiveTab("phone_call")}
        >
          📞 Phone Call Mode
        </button>
      </div>

      {/* TAB 1: Voice Assistant */}
      {activeTab === "assistant" && (
        <div className="card voice-page-card text-center">
          <div className="voice-header-meta">
            <span className="badge">{t("activeLangLabel")}: {langLabels[language] || "English"}</span>
          </div>

          <h2 className="voice-state-title mt-2">{getTitle()}</h2>
          <p className="voice-state-desc">{getDesc()}</p>

          <VoiceWaveform active={voice.isListening || voice.isProcessing || voice.isFindingLocation} />

          <VoiceButton
            listening={voice.isListening}
            processing={voice.isProcessing || voice.isFindingLocation}
            onClick={voice.activate}
            label={
              voice.isListening 
                ? `${t("listening") || "Listening..."} ("మీరు మాట్లాడండి...")`
                : voice.isProcessing || voice.isFindingLocation
                  ? `${t("processing") || "Understanding..."}`
                  : `${t("tapToSpeak") || "Tap to Speak"}`
            }
          />

          {/* Clean scrolling chat conversation list */}
          <div className="chat-messages-container" style={{
            margin: "20px 0",
            padding: "15px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            minHeight: "200px",
            maxHeight: "350px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {messages.length === 0 && (
              <div style={{ color: "#64748b", margin: "auto", fontSize: "14px" }}>
                🎤 Tap the microphone button above and start speaking to search schemes.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                textAlign: "left"
              }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "3px" }}>
                  {msg.sender === "user" ? `🗣️ ${t("you") || "You"}` : `🤖 ${t("assistant") || "Assistant"}`}
                </span>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: msg.sender === "user" ? "#0ea5e9" : "#ffffff",
                  color: msg.sender === "user" ? "#ffffff" : "#1e293b",
                  border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                  whiteSpace: "pre-wrap",
                  fontSize: "15px"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {voice.locationResults && voice.locationResults.length > 0 && (
            <div className="location-results-box mt-4 text-left card p-3" style={{ background: "#f8fafc" }}>
              <h4 style={{ display: "flex", gap: "8px", alignItems: "center", margin: "0 0 10px 0" }}>
                <MapPin size={18} className="text-primary" />
                <span>{t("nearbyCenters")}</span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {voice.locationResults.map((center, idx) => (
                  <div key={idx} className="card p-3 bg-white border">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <strong>{center.name} ({center.distance.toFixed(1)} km away)</strong>
                      <span className="badge">{center.type}</span>
                    </div>
                    <p className="small text-secondary mb-1" style={{ margin: "5px 0" }}>{center.address}</p>
                    <p className="small text-success mb-2" style={{ margin: "0 0 8px 0" }}>{t("openHours")}</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`}
                      target="_blank" rel="noreferrer" className="text-btn text-success" style={{ fontWeight: "700", textDecoration: "none" }}
                    >
                      📍 {t("directions")}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

              {feedbackPromptOpen && (
                <div className="card mt-3 p-3 bg-light border-warning text-left animate-slide-up">
                  <h4 style={{ margin: "0 0 8px 0" }}>💬 {t("wasHelpful")}</h4>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button type="button" className="secondary-btn" onClick={() => handleHelpfulness("helpful")}>{t("helpful")}</button>
                    <button type="button" className="secondary-btn" onClick={() => handleHelpfulness("somewhat")}>{t("somewhat")}</button>
                    <button type="button" className="secondary-btn" onClick={() => handleHelpfulness("notHelpful")}>{t("notHelpful")}</button>
                  </div>
                  <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "8px" }}>
                    <p className="small mb-2">{t("askFeedback")}</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" className="primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setRateFormOpen(true)}>{t("giveFeedbackBtn")}</button>
                      <button type="button" className="secondary-btn" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setFeedbackPromptOpen(false)}>{t("skipBtn")}</button>
                    </div>
                  </div>
                </div>
              )}

              {rateFormOpen && (
                <div className="card mt-3 p-3 text-left animate-slide-up">
                  <h3>💬 {t("appFeedbackTitle")}</h3>
                  <form onSubmit={handleAppFeedback} className="admin-form mt-2">
                    <div>
                      <label>{t("ratingLabel")}</label>
                      <select value={ratingVal} onChange={(e) => setRatingVal(parseInt(e.target.value))}>
                        <option value="5">⭐⭐⭐⭐⭐ ({t("excellent")})</option>
                        <option value="4">⭐⭐⭐⭐ ({t("good")})</option>
                        <option value="3">⭐⭐⭐ ({t("average")})</option>
                        <option value="2">⭐⭐ ({t("poor")})</option>
                        <option value="1">⭐ ({t("veryBad")})</option>
                      </select>
                    </div>
                    <div>
                      <label>{t("commentLabel")}</label>
                      <textarea value={commentVal} onChange={(e) => setCommentVal(e.target.value)} placeholder={t("commentPlaceholder")} rows="2" />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }} className="mt-2">
                      <button type="submit" className="primary">{t("submitFeedback")}</button>
                      <button type="button" className="secondary-btn" onClick={() => setRateFormOpen(false)}>{t("cancelBtn")}</button>
                    </div>
                  </form>
                </div>
              )}


          {voice.error && <div className="demo-note error-note mt-3">{voice.error}</div>}

          <div className="context-visualizer card mt-4 text-left">
            <h3>🧠 {t("contextTitle")}</h3>
            <p className="text-secondary small">{t("contextSub")}</p>
            <div className="context-grid mt-2">
              <div className="context-chip"><strong>{t("contextState")}:</strong> <span>{context.state || t("notSpecified")}</span></div>
              <div className="context-chip"><strong>{t("contextAge")}:</strong> <span>{context.age || t("notSpecified")}</span></div>
              <div className="context-chip"><strong>{t("contextOccupation")}:</strong> <span>{context.occupation || t("notSpecified")}</span></div>
              <div className="context-chip"><strong>{t("contextCategory")}:</strong> <span>{context.category || t("notSpecified")}</span></div>
            </div>
          </div>
          <DemoNote>{t("demoMicDisclaimer")}</DemoNote>
        </div>
      )}

      {/* TAB 2: Helpline Phone Call Mode */}
      {activeTab === "phone_call" && (
        <div className="card text-center p-4">
          <h2>📞 Helpline Call Simulator</h2>
          <p className="card-sub">Simulate a voice call with the JanaSeva Voice helpline (14567).</p>
          <hr style={{ margin: "15px 0", borderColor: "#e2e8f0" }} />

          {!callActive ? (
            <div className="py-4">
              <PhoneCall size={64} className="text-success mx-auto mb-3 animate-pulse" />
              <button type="button" className="primary" style={{ padding: "12px 24px", fontSize: "16px" }} onClick={startPhoneCall}>
                Start Helpline Phone Call
              </button>
            </div>
          ) : (
            <div className="animate-fade-in text-left">
              {/* Call HUD */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="success-icon animate-ping" style={{ background: "#22c55e", width: "12px", height: "12px", borderRadius: "50%" }} />
                  <strong>Connected - JanaSeva Agent (14567)</strong>
                </div>
                <div>
                  Time: <b>{Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}</b>
                </div>
                <button type="button" className="secondary-btn" style={{ color: "#ef4444", borderColor: "#fca5a5" }} onClick={endPhoneCall}>
                  <PhoneOff size={16} /> Hang Up
                </button>
              </div>

              {/* Call conversation logs */}
              <div style={{ margin: "20px 0", padding: "15px", background: "#f1f5f9", borderRadius: "8px", height: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                {callLogs.map((log, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: log.sender === "agent" ? "flex-start" : "flex-end" }}>
                    <span className="small text-secondary">{log.sender === "agent" ? "📞 Agent" : "🗣️ You"}</span>
                    <div style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: log.sender === "agent" ? "#ffffff" : "#0ea5e9",
                      color: log.sender === "agent" ? "#1e293b" : "#ffffff",
                      maxWidth: "80%",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      {log.text}
                    </div>
                  </div>
                ))}
                {isSpeakingCall && (
                  <p className="small text-secondary animate-pulse text-left">Agent is speaking...</p>
                )}
              </div>

              {/* Interactive steps helper */}
              <div className="card p-3 bg-light border-info">
                <h4>Interactive Call Actions</h4>
                <p className="small text-secondary mb-3">Perform actions based on the voice agent's verbal instructions.</p>

                {callStage === 1 && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="secondary-btn" onClick={() => handleSimulateUserSpeech("I need help with Old Age Pension")}>
                      🗣️ Speak: "I need help with Old Age Pension"
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => handleSimulateUserSpeech("I want to check agricultural schemes")}>
                      🗣️ Speak: "I want agricultural schemes"
                    </button>
                  </div>
                )}

                {callStage === 2 && (
                  <div>
                    <div className="demo-note success-note mb-3 text-left" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      <strong>🔗 Secure Scan Link Sent</strong>
                      <p className="small">The agent has pushed a secure link to verify your documents.</p>
                    </div>
                    <button 
                      type="button" 
                      className="primary"
                      onClick={() => setPhoneAppScannerOpen(true)}
                    >
                      <Link size={16} /> Open Secure App Scan Window
                    </button>
                  </div>
                )}

                {/* Handshake: Mock Scanner App Modal */}
                {phoneAppScannerOpen && callStage < 5 && (
                  <div className="card mt-3 p-3 border text-left bg-white">
                    <h3>📷 Camera / Gallery Document Scan</h3>
                    <p className="small text-secondary mb-3">Secure verification link: <code>https://janaseva.gov.in/verify/handshake</code></p>
                    
                    {!phoneScanFile ? (
                      <div style={{ position: "relative" }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="call-file-upload" 
                          style={{ display: "none" }}
                          onChange={handlePhoneFileUpload} 
                        />
                        <label 
                          htmlFor="call-file-upload"
                          style={{ display: "flex", flexDirection: "column", gap: "8px", border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", cursor: "pointer", textAlign: "center" }}
                        >
                          <Upload size={24} className="mx-auto text-secondary" />
                          <span>Choose Aadhaar Card Photo</span>
                        </label>
                      </div>
                    ) : (
                      <div className="demo-note success-note" style={{ background: "#f0fdf4", color: "#166534" }}>
                        <strong>✓ Document detected: {phoneFileDetected}</strong>
                        <p className="small">Information has been successfully bridged to the call agent session.</p>
                      </div>
                    )}
                  </div>
                )}

                {callStage === 3 && (
                  <div className="mt-3 text-left">
                    <label>Aadhaar 12-Digit Number</label>
                    <input 
                      type="text" 
                      value={phoneFieldVal} 
                      onChange={(e) => setPhoneFieldVal(e.target.value)} 
                      placeholder="Enter 12 digits"
                    />
                    <button 
                      type="button" 
                      className="primary mt-2" 
                      onClick={() => { setCallStage(4); handleSimulateUserSpeech("I have entered my Aadhaar ID number"); }}
                    >
                      Confirm Entry Completed
                    </button>
                  </div>
                )}

                {callStage === 5 && (
                  <div className="demo-note success-note text-left" style={{ background: "#f0fdf4", color: "#166534" }}>
                    <strong>✓ Call Finished & Application Submitted!</strong>
                    <p className="small">The agent has successfully submitted your registration. You can track this in your profile history.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
