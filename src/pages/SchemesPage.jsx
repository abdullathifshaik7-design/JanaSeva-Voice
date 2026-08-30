import { useState } from "react";
import { Sparkles, Volume2, BookOpen, ExternalLink, ShieldAlert, X, Upload, CheckCircle, Play, Eye } from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, STATES } from "../data/db";
import { speakText } from "../services/voiceService";
import DemoNote from "../components/DemoNote";

const ALL_STATES_AND_UTS = [
  "National / Central",
  "Andhra Pradesh",
  "Telangana",
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Delhi"
];

export default function SchemesPage() {
  const {
    selectedState,
    setSelectedState,
    addApplication,
    language,
    categoryFilter: activeCategory,
    setCategoryFilter: setActiveCategory,
    schemes,
    t,
    user
  } = useApp();

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [activeTab, setActiveTab] = useState("central"); // "central", "state", "recommended"
  
  // Profile Wizard states
  const [wizardOpen, setWizardOpen] = useState(false);
  const [profile, setProfile] = useState({
    state: selectedState,
    age: "65",
    occupation: "farmer",
    income: "150000",
    disability: "no",
    caste: "General"
  });
  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [showMatches, setShowMatches] = useState(false);

  // AI Document Assistant states
  const [showAssistant, setShowAssistant] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [docDetectionType, setDocDetectionType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFormGuide, setShowFormGuide] = useState(false);
  const [isGuideSpeaking, setIsGuideSpeaking] = useState(false);

  // Filter schemes
  const tabFilteredSchemes = schemes.filter(s => {
    if (s.status !== "Active") return false;
    const categoryMatch = activeCategory === "all" || s.category === activeCategory;
    if (!categoryMatch) return false;

    if (activeTab === "central") {
      return s.governmentLevel === "Central" || s.state === null;
    } else if (activeTab === "state") {
      return s.governmentLevel === "State" && s.state === selectedState;
    }
    return true;
  });

  const runProfileMatching = () => {
    const ageNum = parseInt(profile.age) || 0;
    const incomeNum = parseInt(profile.income) || 9999999;
    const isFarmer = profile.occupation === "farmer";
    
    const matches = schemes.filter((scheme) => {
      if (scheme.status !== "Active") return false;
      const stateMatch = scheme.state === null || scheme.state === profile.state;
      if (!stateMatch) return false;

      if (scheme.ageCriteria) {
        if (ageNum < scheme.ageCriteria.min || ageNum > scheme.ageCriteria.max) return false;
      }
      if (scheme.incomeCriteria) {
        if (incomeNum > scheme.incomeCriteria.max) return false;
      }
      if (scheme.category === "farmers" && !isFarmer) return false;
      return true;
    });

    setMatchedSchemes(matches);
    setShowMatches(true);
    setActiveTab("recommended");
    setWizardOpen(false);
  };

  const handleListenScheme = (scheme) => {
    const descText = scheme.description;
    const benefitsText = scheme.benefits;
    const eligibilityText = scheme.eligibility;
    const docsText = scheme.requiredDocuments.join(", ");
    
    const readText = `${scheme.name}. ${descText}. Benefits: ${benefitsText}. Eligibility: ${eligibilityText}. Required documents: ${docsText}`;
    speakText(readText, language);
  };

  const handleExplainSimply = (scheme) => {
    const langCode = language || "en";
    const simpleText = scheme.simpleExplanation[langCode] || scheme.simpleExplanation.en || scheme.benefits;
    speakText(simpleText, language);
  };

  // Mock document scanning detection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setUploadedFile(file);
    setShowFormGuide(false);

    setTimeout(() => {
      const fileNameLower = file.name.toLowerCase();
      let detected = "Aadhaar Card"; // default

      if (fileNameLower.includes("pan")) {
        detected = "PAN Card";
      } else if (fileNameLower.includes("income")) {
        detected = "Income Certificate";
      } else if (fileNameLower.includes("caste")) {
        detected = "Caste Certificate";
      } else if (fileNameLower.includes("patta") || fileNameLower.includes("land")) {
        detected = "Land Patta Document";
      } else if (fileNameLower.includes("ration")) {
        detected = "Ration Card";
      } else {
        // Fallback to the first required document of selected scheme
        detected = selectedScheme?.requiredDocuments?.[0] || "Aadhaar Card";
      }

      setDocDetectionType(detected);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Speech guidance voice player
  const handlePlayVoiceInstructions = async () => {
    if (isGuideSpeaking) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsGuideSpeaking(false);
      return;
    }

    setIsGuideSpeaking(true);
    const textGuides = {
      en: `Step 1. Please photograph your ${docDetectionType}. Step 2. Locate the alphanumeric identifier on the middle-front part. Step 3. Locate the field matching this identifier in the digital form. Step 4. Carefully enter these letters and numbers. Step 5. Click the submit button to complete your application.`,
      te: `స్టెప్ 1. దయచేసి మీ ${docDetectionType} ను ఫోటో తీయండి. స్టెప్ 2. కార్డు ముందు భాగంలో ఉన్న సంఖ్యను గుర్తించండి. స్టెప్ 3. ఈ ఐడెంటిఫైయర్ కు సరిపోయే ఖాళీ బాక్స్ ను డిజిటల్ ఫారమ్ లో కనుగొనండి. స్టెప్ 4. ఈ నంబర్ ను జాగ్రత్తగా బాక్స్ లో నమోదు చేయండి. స్టెప్ 5. సమర్పించండి బటన్ పై క్లిక్ చేయండి.`,
      hi: `चरण 1. कृपया अपने ${docDetectionType} का फोटो लें। चरण 2. कार्ड के मध्य-सामने वाले भाग पर संख्या को ढूंढें। चरण 3. डिजिटल फॉर्म में इस पहचानकर्ता से मेल खाने वाले क्षेत्र को खोजें। चरण 4. इस नंबर को बॉक्स में दर्ज करें। चरण 5. आवेदन पूरा करने के लिए सबमिट बटन पर क्लिक करें।`,
      ta: `படி 1. தயவுசெய்து உங்கள் ${docDetectionType} ஐ புகைப்படம் எடுக்கவும். படி 2. அட்டை முன்பகுதியின் நடுவில் உள்ள எண்ணைக் கண்டறியவும். படி 3. விண்ணப்ப படிவத்தில் அதற்குரிய பெட்டியைக் கண்டறியவும். படி 4. அந்த எண்ணை கவனமாக உள்ளிடவும். படி 5. சமர்ப்பி பொத்தானைக் கிளிக் செய்யவும்.`
    };

    const guideStr = textGuides[language] || textGuides.en;
    await speakText(guideStr, language);
    setIsGuideSpeaking(false);
  };

  const handleApplyNow = (scheme) => {
    const refId = `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp = {
      id: refId,
      schemeId: scheme.id,
      schemeName: scheme.name,
      citizenName: user?.email || user?.phone || "Guest User",
      status: "Submitted",
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      timeline: [
        { title: "Application Submitted", done: true, current: true, date: "Today" },
        { title: "Verification", done: false, current: false, date: "Pending" },
        { title: "Approval", done: false, current: false, date: "Pending" }
      ]
    };
    
    addApplication(newApp);
    alert(`Demo Application Registered Successfully!\nReference ID: ${refId}\n\nYou can track this application on your Profile or Status tracker.`);
    
    // Reset states
    setSelectedScheme(null);
    setShowAssistant(false);
    setUploadedFile(null);
    setShowFormGuide(false);
  };

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1>{t("schemes")}</h1>
          <p>Explore central & state welfare benefits or find schemes matching your profile.</p>
        </div>
        <button
          type="button"
          className="primary wizard-toggle-btn"
          onClick={() => {
            setWizardOpen(!wizardOpen);
            setShowMatches(false);
          }}
        >
          <Sparkles size={16} /> {t("findSchemesForMe")}
        </button>
      </div>

      {/* State Filter bar */}
      <div className="card filter-card">
        <div className="state-inline-filter">
          <span>{t("activeStateFilter")}: </span>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="state-select-inline"
          >
            {ALL_STATES_AND_UTS.filter(s => s !== "National / Central").map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Eligibility Wizard Modal/Block */}
      {wizardOpen && (
        <div className="card wizard-card animate-fade-in text-left">
          <div className="modal-head">
            <h2>🔮 Personal Scheme Finder (Wizard)</h2>
            <button type="button" className="text-btn" onClick={() => setWizardOpen(false)}>Close</button>
          </div>
          <p className="card-sub">Answer a few basic eligibility questions to filter matched schemes.</p>
          
          <div className="wizard-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
            <div>
              <label>Select State</label>
              <select 
                value={profile.state} 
                onChange={(e) => setProfile({...profile, state: e.target.value})}
              >
                {ALL_STATES_AND_UTS.filter(s => s !== "National / Central").map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Age group / Age (Years)</label>
              <input 
                type="number" 
                value={profile.age} 
                onChange={(e) => setProfile({...profile, age: e.target.value})}
              />
            </div>

            <div>
              <label>Primary Occupation</label>
              <select 
                value={profile.occupation} 
                onChange={(e) => setProfile({...profile, occupation: e.target.value})}
              >
                <option value="farmer">Farmer / Agriculturalist</option>
                <option value="student">Student / Education Pursuer</option>
                <option value="senior">Senior Citizen (60+)</option>
                <option value="worker">Worker / Labourer</option>
                <option value="woman">Woman / Mother</option>
                <option value="other">Other / General</option>
              </select>
            </div>
          </div>

          <button type="button" className="primary full mt-3" onClick={runProfileMatching}>
            🔍 Search Schemes You May Be Eligible For
          </button>
        </div>
      )}

      {/* Tabs Row */}
      <div className="category-tabs border-bottom mb-2">
        <button 
          type="button" 
          className={activeTab === "central" ? "active" : ""} 
          onClick={() => { setActiveTab("central"); setShowMatches(false); }}
        >
          🇮🇳 {t("centralGovTab")}
        </button>
        <button 
          type="button" 
          className={activeTab === "state" ? "active" : ""} 
          onClick={() => { setActiveTab("state"); setShowMatches(false); }}
        >
          🏛️ {selectedState} {t("stateGovTab")}
        </button>
        {showMatches && (
          <button 
            type="button" 
            className={activeTab === "recommended" ? "active" : ""} 
            onClick={() => setActiveTab("recommended")}
          >
            ⭐ {t("recommendedTab")} ({matchedSchemes.length})
          </button>
        )}
      </div>

      {/* Category selector */}
      <div className="category-tabs">
        <button type="button" className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>
          {t("allSchemes")}
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            type="button" 
            className={activeCategory === cat.id ? "active" : ""} 
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.emoji} {t(`cat_${cat.id}`)}
          </button>
        ))}
      </div>

      {/* Scheme Listing Grid */}
      <div className="grid scheme-grid mt-3">
        {(activeTab === "recommended" ? matchedSchemes : tabFilteredSchemes).map((scheme) => (
          <article key={scheme.id} className="card scheme-card-detailed hover-grow" onClick={() => setSelectedScheme(scheme)}>
            <div className="scheme-badge-row">
              <span className="gov-level-badge">{scheme.governmentLevel}</span>
              {scheme.state && <span className="state-badge">{scheme.state}</span>}
            </div>
            <h3>{scheme.name}</h3>
            <p className="scheme-desc-truncate">{scheme.description}</p>
            <div className="scheme-card-details">
              <strong>Benefits:</strong> {scheme.benefits}
            </div>
            <div className="scheme-card-actions">
              <span className="text-btn">{t("viewDetails")} &rarr;</span>
            </div>
          </article>
        ))}
      </div>

      {/* Scheme Detail Modal & Document Form Assistant */}
      {selectedScheme && (
        <div className="modal-backdrop" onClick={() => { setSelectedScheme(null); setShowAssistant(false); setUploadedFile(null); }}>
          <div className="modal scheme-detail-modal animate-slide-up text-left" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px", width: "95%" }}>
            
            <div className="modal-head">
              <h2>{selectedScheme.name}</h2>
              <button type="button" className="text-btn" onClick={() => { setSelectedScheme(null); setShowAssistant(false); setUploadedFile(null); }}>Close</button>
            </div>
            
            <div className="modal-scroll-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              
              {!showAssistant ? (
                <>
                  <div className="gov-level-row mb-3">
                    <span className="badge">{selectedScheme.governmentLevel} Government</span>
                    {selectedScheme.state && <span className="badge info">{selectedScheme.state}</span>}
                    <span className="badge success">{selectedScheme.status}</span>
                  </div>

                  <div className="tts-control-bar card">
                    <button type="button" className="secondary-btn" onClick={() => handleListenScheme(selectedScheme)}>
                      <Volume2 size={16} /> 🔊 {t("listenScheme")}
                    </button>
                    <button type="button" className="secondary-btn simplify-btn" onClick={() => handleExplainSimply(selectedScheme)}>
                      💡 {t("explainSimply")}
                    </button>
                  </div>

                  <div className="detail-section">
                    <h3><BookOpen size={18} /> Description</h3>
                    <p>{selectedScheme.description}</p>
                  </div>

                  <div className="detail-section">
                    <h3>🎁 Benefits</h3>
                    <p className="highlight-text">{selectedScheme.benefits}</p>
                  </div>

                  <div className="detail-section">
                    <h3>👥 Eligibility</h3>
                    <p>{selectedScheme.eligibility}</p>
                  </div>

                  <div className="detail-section">
                    <h3>📋 Required Documents</h3>
                    <ul>
                      {selectedScheme.requiredDocuments.map(doc => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h3>🌐 Official Portal Details</h3>
                    <p>Website: <a href={selectedScheme.officialWebsite} target="_blank" rel="noreferrer">{selectedScheme.officialWebsite} <ExternalLink size={14} /></a></p>
                    <p>Helpline: {selectedScheme.helpline}</p>
                  </div>

                  <div className="modal-actions-footer mt-4" style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="primary full" onClick={() => setShowAssistant(true)}>
                      🤖 Scan & Apply with AI Assistant
                    </button>
                  </div>
                </>
              ) : (
                /* AI Document and Form Assistant Flow */
                <div className="animate-fade-in">
                  <div className="tts-control-bar card" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <h3 style={{ margin: "0", color: "#166534" }}>🤖 AI Document Assistant</h3>
                    <p className="small" style={{ color: "#1b5e20", margin: "5px 0 0 0" }}>Ensure your documents match the program criteria before submitting.</p>
                  </div>

                  {/* 1. Document Upload Widget */}
                  <div className="card p-3 mt-3 text-center border" style={{ background: "#f8fafc" }}>
                    <h4>Step 1: Upload Required Verification Document</h4>
                    <p className="small text-secondary mb-3">Attach a photo or scan of your: <b>{selectedScheme.requiredDocuments[0]}</b></p>
                    
                    <div style={{ position: "relative" }}>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        style={{ display: "none" }} 
                        id="document-upload-file"
                        onChange={handleFileUpload}
                      />
                      <label 
                        htmlFor="document-upload-file"
                        style={{ display: "flex", flexDirection: "column", gap: "8px", border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", cursor: "pointer" }}
                      >
                        <Upload size={24} className="mx-auto text-secondary" />
                        <span className="small text-secondary">📷 Scan / Upload Document</span>
                        <span className="badge" style={{ fontSize: "10px", padding: "4px 8px" }}>Supports JPG, PNG, PDF</span>
                      </label>
                    </div>

                    {isAnalyzing && (
                      <p className="small mt-2 text-primary animate-pulse">🤖 Reading and analyzing document metadata...</p>
                    )}

                    {uploadedFile && !isAnalyzing && (
                      <div className="demo-note success-note mt-3 text-left" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                        <strong>✓ Document detected: {docDetectionType}</strong>
                        <p className="small" style={{ margin: "5px 0 0 0" }}>File name: {uploadedFile.name}</p>
                      </div>
                    )}
                  </div>

                  {/* 2. Document Check & form assistance details */}
                  {uploadedFile && !isAnalyzing && (
                    <div className="card mt-3 p-3 border">
                      <h4>📋 Document Check Results</h4>
                      <hr style={{ margin: "8px 0", borderColor: "#f1f5f9" }} />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className="small">
                        <div>✓ <b>Document type:</b> {docDetectionType}</div>
                        <div>✓ <b>Required status:</b> Required for {selectedScheme.name}</div>
                        <div>✓ <b>Readability check:</b> Text appears clear and fully readable.</div>
                        <div>✓ <b>Needed information:</b> Unique Identification Key and Citizen Name details.</div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "15px" }}>
                        <button 
                          type="button" 
                          className="primary" 
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                          onClick={() => setShowFormGuide(true)}
                        >
                          🤖 How do I fill this?
                        </button>
                        <button 
                          type="button" 
                          className="secondary-btn" 
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                          onClick={() => setUploadedFile(null)}
                        >
                          Scan/Upload Different File
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Form Guide (Steps 1 to 5) */}
                  {showFormGuide && (
                    <div className="card mt-3 p-3 border animate-slide-up" style={{ background: "#fef8e6", borderColor: "#fef3c7" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4>📋 AI Form Guide Steps</h4>
                        <button 
                          type="button" 
                          className="secondary-btn" 
                          style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={handlePlayVoiceInstructions}
                        >
                          <Volume2 size={13} /> {isGuideSpeaking ? "Stop" : "🔊 Listen"}
                        </button>
                      </div>
                      <hr style={{ margin: "8px 0", borderColor: "#fef3c7" }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }} className="small">
                        <div>
                          <strong>STEP 1: Document verification</strong>
                          <p className="text-secondary">Attach your {docDetectionType} using the scan/upload button above.</p>
                        </div>
                        <div>
                          <strong>STEP 2: Find document identifier</strong>
                          <p className="text-secondary">Look at the middle part of the front page on your {docDetectionType} to find the identification number.</p>
                        </div>
                        <div>
                          <strong>STEP 3: Field selection</strong>
                          <p className="text-secondary">Enter the matching identifier inside the {docDetectionType} Number field below.</p>
                        </div>
                        <div>
                          <strong>STEP 4: Entry verification</strong>
                          <p className="text-secondary">Double check the spelling and digits to prevent verification delays.</p>
                        </div>
                        <div>
                          <strong>STEP 5: What to do next</strong>
                          <p className="text-secondary">Press the Submit button below to upload the data for local panchayat block inspections.</p>
                        </div>
                      </div>

                      {/* Mock Form fields */}
                      <div className="admin-form mt-3 text-left">
                        <label>{docDetectionType} ID Number</label>
                        <input type="text" placeholder={`Enter unique ${docDetectionType} code`} required />
                        
                        <label className="mt-2">Applicant Full Name</label>
                        <input type="text" placeholder="As written in document" required />
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                        <button type="button" className="primary full" onClick={() => handleApplyNow(selectedScheme)}>
                          Complete Application Submission
                        </button>
                        <button type="button" className="secondary-btn" onClick={() => setShowAssistant(false)}>
                          Back to Details
                        </button>
                      </div>
                    </div>
                  )}

                  {!uploadedFile && (
                    <button type="button" className="secondary-btn full mt-3" onClick={() => setShowAssistant(false)}>
                      Back to Scheme Details
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DemoNote>
        AI document scanner and form guides are simulated for demonstration. Uploads checks evaluate local heuristics.
      </DemoNote>
    </>
  );
}
