import { useState, useEffect } from "react";
import { Sparkles, Volume2, BookOpen, ExternalLink, ShieldAlert, X, Upload, CheckCircle, Play, Eye, ArrowRight, ArrowLeft } from "lucide-react";
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
    user,
    activeScheme,
    setActiveScheme
  } = useApp();

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [activeTab, setActiveTab] = useState("central"); // "central", "state", "recommended"

  useEffect(() => {
    if (activeScheme) {
      setSelectedScheme(activeScheme);
      setApplyStep("form"); // Go directly to the apply form!
      setActiveScheme(null); // Clear context reference
    }
  }, [activeScheme, schemes]);
  
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

  // Apply Form states
  const [applyStep, setApplyStep] = useState("details"); // "details", "form", "review", "success"
  const [applyFormData, setApplyFormData] = useState({
    fullName: "",
    mobile: "",
    village: "",
    district: "",
    landDetails: "",
    cropDetails: "",
    age: "",
    address: "",
    pensionType: "",
    studentName: "",
    dob: "",
    educationLevel: "",
    institution: "",
    course: "",
    income: "",
    generalDetail: ""
  });
  const [generatedRef, setGeneratedRef] = useState("");

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
  const handleApplyFormSubmit = (scheme) => {
    const refId = `JSV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedRef(refId);

    const citizenNameVal = scheme.category === "education" 
      ? applyFormData.studentName 
      : applyFormData.fullName || user?.email || user?.phone || "Guest User";

    const newApp = {
      id: refId,
      schemeId: scheme.id,
      schemeName: scheme.name,
      citizenName: citizenNameVal,
      status: "Submitted",
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      timeline: [
        { title: "Application Submitted", done: true, current: true, date: "Today" },
        { title: "Verification", done: false, current: false, date: "Pending" },
        { title: "Approval", done: false, current: false, date: "Pending" }
      ]
    };
    
    addApplication(newApp);
    setApplyStep("success");
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

      {selectedScheme && (
        <div className="modal-backdrop" onClick={() => { setSelectedScheme(null); setApplyStep("details"); }}>
          <div className="modal scheme-detail-modal animate-slide-up text-left" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px", width: "95%" }}>
            
            <div className="modal-head">
              <h2>{applyStep === "form" ? `Apply for ${selectedScheme.name}` : applyStep === "review" ? "Review Application" : applyStep === "success" ? "Application Success" : selectedScheme.name}</h2>
              <button type="button" className="text-btn" onClick={() => { setSelectedScheme(null); setApplyStep("details"); }}>Close</button>
            </div>
            
            <div className="modal-scroll-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              
              {applyStep === "details" && (
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
                    <button type="button" className="primary full" onClick={() => setApplyStep("form")}>
                      📋 APPLY NOW
                    </button>
                  </div>
                </>
              )}

              {applyStep === "form" && (
                <div className="animate-fade-in">
                  <div className="admin-form">
                    
                    {/* FARMER SCHEME FORM */}
                    {selectedScheme.category === "farmers" && (
                      <>
                        <div>
                          <label>Full Name of Farmer</label>
                          <input 
                            type="text" 
                            placeholder="Enter farmer name"
                            value={applyFormData.fullName} 
                            onChange={e => setApplyFormData({ ...applyFormData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Mobile Number</label>
                          <input 
                            type="tel" 
                            placeholder="10-digit mobile number"
                            value={applyFormData.mobile} 
                            onChange={e => setApplyFormData({ ...applyFormData, mobile: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Village Name</label>
                          <input 
                            type="text" 
                            placeholder="Enter village"
                            value={applyFormData.village} 
                            onChange={e => setApplyFormData({ ...applyFormData, village: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>District</label>
                          <input 
                            type="text" 
                            placeholder="Enter district"
                            value={applyFormData.district} 
                            onChange={e => setApplyFormData({ ...applyFormData, district: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Land Area (in Acres)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 2.5"
                            value={applyFormData.landDetails} 
                            onChange={e => setApplyFormData({ ...applyFormData, landDetails: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>Cultivated Crop Details</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Paddy, Cotton"
                            value={applyFormData.cropDetails} 
                            onChange={e => setApplyFormData({ ...applyFormData, cropDetails: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* PENSION SCHEME FORM */}
                    {selectedScheme.category === "pension" && (
                      <>
                        <div>
                          <label>Full Name of Applicant</label>
                          <input 
                            type="text" 
                            placeholder="Enter name"
                            value={applyFormData.fullName} 
                            onChange={e => setApplyFormData({ ...applyFormData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Age (Years)</label>
                          <input 
                            type="number" 
                            placeholder="Enter age"
                            value={applyFormData.age} 
                            onChange={e => setApplyFormData({ ...applyFormData, age: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Mobile Number</label>
                          <input 
                            type="tel" 
                            placeholder="10-digit mobile number"
                            value={applyFormData.mobile} 
                            onChange={e => setApplyFormData({ ...applyFormData, mobile: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Residential Address</label>
                          <textarea 
                            placeholder="Full residential address"
                            rows="2"
                            value={applyFormData.address} 
                            onChange={e => setApplyFormData({ ...applyFormData, address: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Pension Classification</label>
                          <select 
                            value={applyFormData.pensionType} 
                            onChange={e => setApplyFormData({ ...applyFormData, pensionType: e.target.value })}
                          >
                            <option value="">-- Select Type --</option>
                            <option value="oldage">Old Age Pension</option>
                            <option value="widow">Widow Pension</option>
                            <option value="disabled">Disabled Assistance</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* SCHOLARSHIP SCHEME FORM */}
                    {selectedScheme.category === "education" && (
                      <>
                        <div>
                          <label>Full Name of Student</label>
                          <input 
                            type="text" 
                            placeholder="Enter student name"
                            value={applyFormData.studentName} 
                            onChange={e => setApplyFormData({ ...applyFormData, studentName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Date of Birth</label>
                          <input 
                            type="date" 
                            value={applyFormData.dob} 
                            onChange={e => setApplyFormData({ ...applyFormData, dob: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Mobile Number</label>
                          <input 
                            type="tel" 
                            placeholder="10-digit mobile number"
                            value={applyFormData.mobile} 
                            onChange={e => setApplyFormData({ ...applyFormData, mobile: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Education Level</label>
                          <select 
                            value={applyFormData.educationLevel} 
                            onChange={e => setApplyFormData({ ...applyFormData, educationLevel: e.target.value })}
                          >
                            <option value="">-- Select Education --</option>
                            <option value="10th">Post-Matric (10th+)</option>
                            <option value="intermediate">Intermediate (12th)</option>
                            <option value="undergraduate">Undergraduate Degree</option>
                            <option value="postgraduate">Postgraduate</option>
                          </select>
                        </div>
                        <div>
                          <label>Name of School / College / Institution</label>
                          <input 
                            type="text" 
                            placeholder="Enter school/college name"
                            value={applyFormData.institution} 
                            onChange={e => setApplyFormData({ ...applyFormData, institution: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>Course Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. B.Tech, Class XI"
                            value={applyFormData.course} 
                            onChange={e => setApplyFormData({ ...applyFormData, course: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>Annual Family Income (INR)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 120000"
                            value={applyFormData.income} 
                            onChange={e => setApplyFormData({ ...applyFormData, income: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* GENERAL SCHEME FORM */}
                    {selectedScheme.category !== "farmers" && selectedScheme.category !== "pension" && selectedScheme.category !== "education" && (
                      <>
                        <div>
                          <label>Full Name of Applicant</label>
                          <input 
                            type="text" 
                            placeholder="Enter name"
                            value={applyFormData.fullName} 
                            onChange={e => setApplyFormData({ ...applyFormData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Mobile Number</label>
                          <input 
                            type="tel" 
                            placeholder="10-digit mobile number"
                            value={applyFormData.mobile} 
                            onChange={e => setApplyFormData({ ...applyFormData, mobile: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Full Residential Address</label>
                          <textarea 
                            placeholder="Enter address"
                            rows="2"
                            value={applyFormData.address} 
                            onChange={e => setApplyFormData({ ...applyFormData, address: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label>Annual Family Income (INR)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 150000"
                            value={applyFormData.income} 
                            onChange={e => setApplyFormData({ ...applyFormData, income: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>Application Purpose / Details</label>
                          <input 
                            type="text" 
                            placeholder="Why are you applying for this scheme?"
                            value={applyFormData.generalDetail} 
                            onChange={e => setApplyFormData({ ...applyFormData, generalDetail: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button type="button" className="secondary-btn w-1/3" onClick={() => setApplyStep("details")}>
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="primary flex-1" 
                      onClick={() => {
                        // Simple validations
                        if (selectedScheme.category === "farmers") {
                          if (!applyFormData.fullName || !applyFormData.mobile || !applyFormData.village || !applyFormData.district) {
                            alert("Please fill in all the required fields.");
                            return;
                          }
                        } else if (selectedScheme.category === "pension") {
                          if (!applyFormData.fullName || !applyFormData.age || !applyFormData.mobile || !applyFormData.address) {
                            alert("Please fill in all the required fields.");
                            return;
                          }
                        } else if (selectedScheme.category === "education") {
                          if (!applyFormData.studentName || !applyFormData.dob || !applyFormData.mobile) {
                            alert("Please fill in all the required fields.");
                            return;
                          }
                        } else {
                          if (!applyFormData.fullName || !applyFormData.mobile || !applyFormData.address) {
                            alert("Please fill in all the required fields.");
                            return;
                          }
                        }
                        setApplyStep("review");
                      }}
                    >
                      Review details <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {applyStep === "review" && (
                <div className="animate-fade-in">
                  <p className="small text-secondary mb-3">Please verify that all the information entered matches your certificates.</p>

                  <div className="card bg-light p-3 border mb-3" style={{ fontSize: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div><strong>Scheme:</strong> {selectedScheme.name}</div>
                    <hr style={{ borderColor: "#cbd5e1", margin: "5px 0" }} />

                    {selectedScheme.category === "education" ? (
                      <>
                        <div><strong>Student Name:</strong> {applyFormData.studentName}</div>
                        <div><strong>Date of Birth:</strong> {applyFormData.dob}</div>
                        <div><strong>Mobile Number:</strong> {applyFormData.mobile}</div>
                        {applyFormData.educationLevel && <div><strong>Education Level:</strong> {applyFormData.educationLevel}</div>}
                        {applyFormData.institution && <div><strong>Institution:</strong> {applyFormData.institution}</div>}
                        {applyFormData.course && <div><strong>Course:</strong> {applyFormData.course}</div>}
                        {applyFormData.income && <div><strong>Annual Family Income:</strong> ₹{applyFormData.income}</div>}
                      </>
                    ) : (
                      <>
                        <div><strong>Full Name:</strong> {applyFormData.fullName}</div>
                        {applyFormData.age && <div><strong>Age:</strong> {applyFormData.age} years</div>}
                        <div><strong>Mobile Number:</strong> {applyFormData.mobile}</div>
                        {applyFormData.address && <div><strong>Address:</strong> {applyFormData.address}</div>}
                      </>
                    )}

                    {selectedScheme.category === "farmers" && (
                      <>
                        <div><strong>Village:</strong> {applyFormData.village}</div>
                        <div><strong>District:</strong> {applyFormData.district}</div>
                        {applyFormData.landDetails && <div><strong>Land Owned:</strong> {applyFormData.landDetails} Acres</div>}
                        {applyFormData.cropDetails && <div><strong>Crops Cultivated:</strong> {applyFormData.cropDetails}</div>}
                      </>
                    )}

                    {selectedScheme.category === "pension" && applyFormData.pensionType && (
                      <div><strong>Pension Type:</strong> {applyFormData.pensionType}</div>
                    )}

                    {selectedScheme.category !== "farmers" && selectedScheme.category !== "pension" && selectedScheme.category !== "education" && (
                      <>
                        {applyFormData.income && <div><strong>Annual Family Income:</strong> ₹{applyFormData.income}</div>}
                        {applyFormData.generalDetail && <div><strong>Details:</strong> {applyFormData.generalDetail}</div>}
                      </>
                    )}
                  </div>

                  <div className="demo-note mb-4">
                    <strong>📝 Prototype Simulation Note:</strong> Under this prototype, no actual documents are required to be uploaded.
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="button" className="secondary-btn w-1/3" onClick={() => setApplyStep("form")}>
                      <ArrowLeft size={16} /> Edit
                    </button>
                    <button type="button" className="primary flex-1" onClick={() => handleApplyFormSubmit(selectedScheme)} style={{ background: "#16a34a", borderColor: "#16a34a" }}>
                      Confirm & Submit Application
                    </button>
                  </div>
                </div>
              )}

              {applyStep === "success" && (
                <div className="animate-fade-in text-center py-4">
                  <CheckCircle size={64} className="text-success mx-auto mb-3" />
                  <h3 className="text-success font-bold">Application Submitted Successfully</h3>
                  <p className="text-secondary mt-1">Your request has been successfully registered in the portal.</p>
                  
                  <div className="card p-3 my-4 bg-light border" style={{ maxWidth: "350px", margin: "20px auto" }}>
                    <span className="small text-secondary">APPLICATION REFERENCE</span>
                    <h2 className="font-mono text-primary mt-1" style={{ fontSize: "22px" }}>{generatedRef}</h2>
                  </div>

                  <button 
                    type="button" 
                    className="primary" 
                    onClick={() => {
                      setSelectedScheme(null);
                      setApplyStep("details");
                    }}
                  >
                    Close Window
                  </button>
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
