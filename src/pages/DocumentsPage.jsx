import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { speakText } from "../services/voiceService";
import { 
  Camera, Image as ImageIcon, FolderOpen, FileText, HelpCircle, 
  Volume2, X, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight,
  ClipboardList, Check, Scan, Crop
} from "lucide-react";
import DemoNote from "../components/DemoNote";

// Complete local translation matrices for Document AI assistant
const DOC_TRANSLATIONS = {
  en: {
    guideTitle: "Form Assistant Guide",
    scanTitle: "Optional Document Scanner Demo",
    scanDesc: "Edge-detection document classification demo. Not part of the official application flow.",
    takePhoto: "Scan Document",
    gallery: "Upload from Gallery",
    uploadFile: "Upload File",
    analyzing: "🤖 Reading and classifying document layout...",
    uploaded: "Uploaded",
    recognized: "Document Recognized",
    unrecognized: "Document Not Recognized",
    unrecognizedDesc: "Please upload a valid identity card.",
    unclear: "Image Unclear",
    unclearDesc: "Image is blurry or too dark. Retake with good lighting.",
    mismatch: "Document Type Mismatch",
    mismatchDesc: "Uploaded card does not match the active service requirement.",
    howToFill: "How do I fill this form?"
  },
  te: {
    guideTitle: "ఫారమ్ అసిస్టెంట్ గైడ్",
    scanTitle: "ఐచ్ఛిక డాక్యుమెంట్ స్కానర్ డెమో",
    scanDesc: "ఎడ్జ్-డిటెక్షన్ పత్రాల వర్గీకరణ డెమో.",
    takePhoto: "పత్రాన్ని స్కాన్ చేయి",
    gallery: "గ్యాలరీ నుండి అప్‌లోడ్ చేయి",
    uploadFile: "ఫైల్‌ను అప్‌లోడ్ చేయి",
    analyzing: "🤖 పత్రం రకాన్ని విశ్లేషిస్తున్నాము...",
    uploaded: "అప్‌లోడ్ చేయబడింది",
    recognized: "పత్రం విజయవంతంగా గుర్తించబడింది",
    unrecognized: "పత్రం గుర్తించబడలేదు",
    unrecognizedDesc: "దయచేసి సరైన గుర్তিంపు కార్డును అప్‌లోడ్ చేయండి.",
    unclear: "చిత్రం స్పష్టంగా లేదు",
    unclearDesc: "చిత్రం అస్పష్టంగా లేదా చాలా చీకటిగా ఉంది. మంచి వెలుతురులో మళ్ళీ ఫోటో తీయండి.",
    mismatch: "పత్రం రకం సరిపోలడం లేదు",
    mismatchDesc: "అప్‌లోడ్ చేసిన కార్డు అవసరమైన సేవకు సరిపోలడం లేదు.",
    howToFill: "ఈ ఫారమ్ ఎలా నింపాలి?"
  }
};

export default function DocumentsPage() {
  const { t, language, addApplication } = useApp();
  const [activeTab, setActiveTab] = useState("apply"); // 'apply' or 'scanner'

  // --- TAB 1: Step-by-Step Dynamic Certificate Application Flow ---
  const [applyStep, setApplyStep] = useState(1); // 1: Select Service Grid, 2: Form, 3: Review, 4: Success
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    mobile: "",
    address: "",
    incomeDetails: "",
    purpose: "",
    childName: "",
    placeOfBirth: "",
    parentName: "",
    motherName: "",
    durationOfStay: "",
    age: "",
    pensionType: ""
  });
  const [submittedRef, setSubmittedRef] = useState("");

  const servicesList = [
    { id: "birth", label: "Birth Certificate", desc: "Apply for a child's birth registration and certificate." },
    { id: "income", label: "Income Certificate", desc: "Obtain an official certificate certifying annual family income." },
    { id: "caste", label: "Caste Certificate", desc: "Official community or category certificate verification." },
    { id: "residence", label: "Residence Certificate", desc: "Certificate verifying local residential status." },
    { id: "pension", label: "Pension-related certificate", desc: "Verification and enrollment of social security pensions." },
    { id: "other", label: "Other Certificate Services", desc: "Miscellaneous citizen certificate applications." }
  ];

  const handleSelectService = (service) => {
    setSelectedService(service);
    setApplyStep(2); // Go to service specific form
  };

  const handleApplyNext = () => {
    // Form Validation based on service
    if (applyStep === 2) {
      if (selectedService.id === "income") {
        if (!formData.fullName || !formData.dob || !formData.mobile || !formData.address || !formData.incomeDetails || !formData.purpose) {
          alert("Please fill in all the required fields.");
          return;
        }
      } else if (selectedService.id === "birth") {
        if (!formData.childName || !formData.dob || !formData.placeOfBirth || !formData.parentName || !formData.motherName) {
          alert("Please fill in all the child and parent details.");
          return;
        }
      } else if (selectedService.id === "residence") {
        if (!formData.fullName || !formData.mobile || !formData.address || !formData.durationOfStay) {
          alert("Please fill in all the residential details.");
          return;
        }
      } else if (selectedService.id === "pension") {
        if (!formData.fullName || !formData.age || !formData.address || !formData.pensionType) {
          alert("Please fill in all the pension details.");
          return;
        }
      } else {
        // Fallback validation
        if (!formData.fullName || !formData.mobile || !formData.address) {
          alert("Please fill in the basic details.");
          return;
        }
      }
      setApplyStep(3); // Go to Review
    }
  };

  const handleApplySubmit = () => {
    const refId = `JSV-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(refId);
    
    // Add application context
    const citizenNameVal = selectedService.id === "birth" ? formData.childName : formData.fullName;
    addApplication({
      id: refId,
      schemeId: `cert-${selectedService.id}`,
      schemeName: selectedService.label,
      citizenName: citizenNameVal,
      status: "Submitted",
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      timeline: [
        { title: "Application Form Submitted", done: true, current: true, date: "Today" }
      ]
    });

    setApplyStep(4); // Success screen
  };

  const resetApplyFlow = () => {
    setApplyStep(1);
    setSelectedService(null);
    setFormData({
      fullName: "",
      dob: "",
      mobile: "",
      address: "",
      incomeDetails: "",
      purpose: "",
      childName: "",
      placeOfBirth: "",
      parentName: "",
      motherName: "",
      durationOfStay: "",
      age: "",
      pensionType: ""
    });
    setSubmittedRef("");
  };

  // --- TAB 2: Document Scanner Demo ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedType, setDetectedType] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const [scanStep, setScanStep] = useState("upload"); // 'upload', 'crop', 'success'
  const [showHelper, setShowHelper] = useState(false);
  const [helperStep, setHelperStep] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const dTrans = DOC_TRANSLATIONS[language] || DOC_TRANSLATIONS.en;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setScanStep("crop"); // Move to Crop / Edge-detection view
    
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const triggerScan = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setScanStep("success");
      
      const name = selectedFile ? selectedFile.name.toLowerCase() : "aadhaar.png";
      let type = "Aadhaar Card";
      let status = "Recognized";

      if (name.includes("pan")) {
        type = "PAN Card";
      } else if (name.includes("income")) {
        type = "Income Certificate";
      } else if (name.includes("caste")) {
        type = "Caste Certificate";
      }
      setDetectedType(type);
      setRecognitionStatus(status);
    }, 2000);
  };

  const activeSteps = [
    {
      field: "Certificate Reference ID",
      location: "Located at the top-right corner of the official sheet.",
      instruction: "Copy the reference code exactly as printed.",
      visual: "gen_ref",
      guides: {
        en: "Step 1. Fill Certificate Reference ID at the top right.",
        te: "దశ 1. పైన కుడి వైపున ఉన్న సర్టిఫికేట్ రిఫరెన్స్ ఐడి నింపండి."
      }
    }
  ];

  const currentStepData = activeSteps[helperStep - 1] || activeSteps[0];

  const handlePlayVoice = async () => {
    if (isSpeaking) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const speechStr = currentStepData.guides?.[language] || currentStepData.guides?.en || `Step ${helperStep}. ${currentStepData.field}. ${currentStepData.instruction}`;
    await speakText(speechStr, language);
    setIsSpeaking(false);
  };

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left">
      <div className="page-title">
        <h1>📄 {t("documents") || "Documents & Certificate Services"}</h1>
        <p>Apply for community, income, and identity certificates directly or access the helper tools.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "5px", background: "#f1f5f9", padding: "4px", borderRadius: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeTab === "apply" ? "#ffffff" : "transparent",
            color: activeTab === "apply" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => setActiveTab("apply")}
        >
          📋 Apply for Certificates
        </button>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeTab === "scanner" ? "#ffffff" : "transparent",
            color: activeTab === "scanner" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => setActiveTab("scanner")}
        >
          📷 Scan Verification Demo
        </button>
      </div>

      {/* TAB 1: Certificate Application */}
      {activeTab === "apply" && (
        <div>
          {/* Step 1: Select Service Grid */}
          {applyStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="mb-4">Select a service to apply</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                {servicesList.map(s => (
                  <div key={s.id} className="card p-4 border" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 8px 0", color: "#1e3a5f" }}>{s.label}</h3>
                      <p className="small text-secondary" style={{ margin: 0 }}>{s.desc}</p>
                    </div>
                    <button 
                      type="button" 
                      className="primary mt-3" 
                      style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      onClick={() => handleSelectService(s)}
                    >
                      📋 APPLY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dynamic Service Specific Form */}
          {applyStep === 2 && selectedService && (
            <div className="card p-4 animate-fade-in">
              <h2 className="mb-2" style={{ color: "#0f172a" }}>Apply for {selectedService.label}</h2>
              <p className="small text-secondary mb-4">Please fill in the applicant details required for this certificate.</p>
              
              <div className="admin-form">
                
                {/* Form fields for Income Certificate */}
                {selectedService.id === "income" && (
                  <>
                    <div>
                      <label>Full Name of Applicant</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name"
                        value={formData.fullName} 
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Date of Birth</label>
                      <input 
                        type="date" 
                        value={formData.dob} 
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="10-digit mobile number"
                        value={formData.mobile} 
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Residential Address</label>
                      <textarea 
                        placeholder="Full address details"
                        rows="3"
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Annual Family Income (INR)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 150000"
                        value={formData.incomeDetails} 
                        onChange={e => setFormData({ ...formData, incomeDetails: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Purpose of Certificate</label>
                      <select 
                        value={formData.purpose} 
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                      >
                        <option value="">-- Select Purpose --</option>
                        <option value="education">Education Scholarship</option>
                        <option value="employment">Government Employment</option>
                        <option value="welfare">Social Welfare Schemes</option>
                        <option value="bank">Bank Loan</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Form fields for Birth Certificate */}
                {selectedService.id === "birth" && (
                  <>
                    <div>
                      <label>Child's Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter child's name"
                        value={formData.childName} 
                        onChange={e => setFormData({ ...formData, childName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Date of Birth</label>
                      <input 
                        type="date" 
                        value={formData.dob} 
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Place of Birth (Hospital Name / Address)</label>
                      <input 
                        type="text" 
                        placeholder="Hospital name or residential address"
                        value={formData.placeOfBirth} 
                        onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Father's / Guardian's Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Father's name"
                        value={formData.parentName} 
                        onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Mother's Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Mother's name"
                        value={formData.motherName} 
                        onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form fields for Residence Certificate */}
                {selectedService.id === "residence" && (
                  <>
                    <div>
                      <label>Full Name of Applicant</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name"
                        value={formData.fullName} 
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="10-digit mobile number"
                        value={formData.mobile} 
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Present Address</label>
                      <textarea 
                        placeholder="Street, town, district and state details"
                        rows="3"
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Duration of Stay at Present Address (Years)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 5"
                        value={formData.durationOfStay} 
                        onChange={e => setFormData({ ...formData, durationOfStay: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Form fields for Pension */}
                {selectedService.id === "pension" && (
                  <>
                    <div>
                      <label>Full Name of Applicant</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name"
                        value={formData.fullName} 
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Age of Applicant</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 62"
                        value={formData.age} 
                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Residential Address</label>
                      <textarea 
                        placeholder="Full address details"
                        rows="3"
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Type of Pension Requested</label>
                      <select 
                        value={formData.pensionType} 
                        onChange={e => setFormData({ ...formData, pensionType: e.target.value })}
                      >
                        <option value="">-- Select Pension Type --</option>
                        <option value="old-age">Old Age Pension</option>
                        <option value="widow">Widow Pension</option>
                        <option value="disability">Disability Pension</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Fallback form for Other / Caste Certificate */}
                {(selectedService.id === "caste" || selectedService.id === "other") && (
                  <>
                    <div>
                      <label>Full Name of Applicant</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name"
                        value={formData.fullName} 
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="10-digit mobile number"
                        value={formData.mobile} 
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Residential Address</label>
                      <textarea 
                        placeholder="Full residential address"
                        rows="3"
                        value={formData.address} 
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Specific Certificate Details / Category</label>
                      <input 
                        type="text" 
                        placeholder="e.g. OBC / SC Group, or Certificate specifications"
                        value={formData.serviceDetail} 
                        onChange={e => setFormData({ ...formData, serviceDetail: e.target.value })}
                      />
                    </div>
                  </>
                )}

              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
                <button type="button" className="secondary-btn w-1/3" onClick={resetApplyFlow}>
                  Cancel
                </button>
                <button type="button" className="primary flex-1" onClick={handleApplyNext}>
                  Review Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Details */}
          {applyStep === 3 && selectedService && (
            <div className="card p-4 animate-fade-in">
              <h2 className="mb-2 text-warning">Review Your Details</h2>
              <p className="small text-secondary mb-4">Please verify that all the information entered matches your certificates.</p>

              <div className="card bg-light p-3 border mb-3" style={{ fontSize: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div><strong>Selected Service:</strong> {selectedService.label}</div>
                <hr style={{ borderColor: "#cbd5e1", margin: "5px 0" }} />

                {selectedService.id === "birth" ? (
                  <>
                    <div><strong>Child's Name:</strong> {formData.childName}</div>
                    <div><strong>Date of Birth:</strong> {formData.dob}</div>
                    <div><strong>Place of Birth:</strong> {formData.placeOfBirth}</div>
                    <div><strong>Father's Name:</strong> {formData.parentName}</div>
                    <div><strong>Mother's Name:</strong> {formData.motherName}</div>
                  </>
                ) : (
                  <>
                    <div><strong>Full Name:</strong> {formData.fullName}</div>
                    {formData.age && <div><strong>Age:</strong> {formData.age}</div>}
                    {formData.dob && <div><strong>Date of Birth:</strong> {formData.dob}</div>}
                    <div><strong>Mobile Number:</strong> {formData.mobile}</div>
                    <div><strong>Address:</strong> {formData.address}</div>
                  </>
                )}

                {selectedService.id === "income" && (
                  <>
                    <div><strong>Annual Income:</strong> ₹{formData.incomeDetails}</div>
                    <div><strong>Purpose:</strong> {formData.purpose}</div>
                  </>
                )}

                {selectedService.id === "residence" && (
                  <div><strong>Duration of Stay:</strong> {formData.durationOfStay} years</div>
                )}

                {selectedService.id === "pension" && (
                  <div><strong>Pension Type:</strong> {formData.pensionType}</div>
                )}

                {formData.serviceDetail && (
                  <div><strong>Service Specifications:</strong> {formData.serviceDetail}</div>
                )}
              </div>

              <div className="demo-note mb-4">
                <strong>📝 Prototype Simulation Note:</strong> Under this prototype, no actual documents are required to be uploaded in this stage.
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="secondary-btn w-1/3" onClick={() => setApplyStep(2)}>
                  <ArrowLeft size={16} /> Edit
                </button>
                <button type="button" className="primary flex-1" onClick={handleApplySubmit} style={{ background: "#16a34a", borderColor: "#16a34a" }}>
                  Confirm & Submit Application
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Submission success */}
          {applyStep === 4 && (
            <div className="card p-4 animate-fade-in text-center py-4">
              <CheckCircle size={64} className="text-success mx-auto mb-3" />
              <h3 className="text-success font-bold">Application Submitted Successfully</h3>
              <p className="text-secondary mt-1">Your certificate request has been recorded in the citizen dashboard.</p>
              
              <div className="card p-3 my-4 bg-light border" style={{ maxWidth: "350px", margin: "20px auto" }}>
                <span className="small text-secondary">DEMO APPLICATION REFERENCE ID</span>
                <h2 className="font-mono text-primary mt-1" style={{ fontSize: "24px" }}>{submittedRef}</h2>
              </div>

              <button type="button" className="primary" onClick={resetApplyFlow}>
                Apply for Another Certificate
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Optional Document Scanner Demo */}
      {activeTab === "scanner" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
          
          {/* Main upload options */}
          {scanStep === "upload" && (
            <div className="card text-center p-4">
              <h3>📷 {dTrans.scanTitle}</h3>
              <p className="small text-secondary mb-4">{dTrans.scanDesc}</p>
              
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                id="camera-capture-input" 
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                id="gallery-upload-input" 
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                <button type="button" className="secondary-btn p-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }} onClick={() => document.getElementById("camera-capture-input").click()}>
                  <Camera size={24} className="text-primary" />
                  <span>{dTrans.takePhoto}</span>
                </button>
                <button type="button" className="secondary-btn p-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }} onClick={() => document.getElementById("gallery-upload-input").click()}>
                  <ImageIcon size={24} className="text-primary" />
                  <span>{dTrans.gallery}</span>
                </button>
                <button type="button" className="secondary-btn p-3" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }} onClick={() => document.getElementById("gallery-upload-input").click()}>
                  <FolderOpen size={24} className="text-primary" />
                  <span>{dTrans.uploadFile}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Crop & Edge-Detection Style UI */}
          {scanStep === "crop" && (
            <div className="card p-4 border animate-fade-in">
              <h3 className="mb-2">✂️ Adjust Crop & Detect Edges</h3>
              <p className="small text-secondary mb-3">Crop photo boundaries to detect government card margins.</p>

              {/* Edge Detection Box Mock */}
              <div style={{ 
                position: "relative", 
                width: "100%", 
                maxWidth: "350px", 
                margin: "0 auto", 
                border: "2px solid #0ea5e9", 
                borderRadius: "8px", 
                overflow: "hidden", 
                background: "#000" 
              }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: "100%", opacity: 0.8 }} />
                ) : (
                  <div style={{ padding: "80px 0", color: "#94a3b8", textAlign: "center" }}>
                    <FileText size={48} className="mx-auto mb-2" />
                    <span>File Selected</span>
                  </div>
                )}

                {/* Laser animation and Crop corners */}
                <div style={{
                  position: "absolute",
                  top: "10%",
                  left: "10%",
                  right: "10%",
                  bottom: "10%",
                  border: "2px dashed #22c55e",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)"
                }}>
                  {/* Corner handles */}
                  <div style={{ position: "absolute", top: "-5px", left: "-5px", width: "12px", height: "12px", borderTop: "3px solid #22c55e", borderLeft: "3px solid #22c55e" }}></div>
                  <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "12px", height: "12px", borderTop: "3px solid #22c55e", borderRight: "3px solid #22c55e" }}></div>
                  <div style={{ position: "absolute", bottom: "-5px", left: "-5px", width: "12px", height: "12px", borderBottom: "3px solid #22c55e", borderLeft: "3px solid #22c55e" }}></div>
                  <div style={{ position: "absolute", bottom: "-5px", right: "-5px", width: "12px", height: "12px", borderBottom: "3px solid #22c55e", borderRight: "3px solid #22c55e" }}></div>
                </div>

                {isProcessing && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, height: "3px",
                    background: "#e11d48",
                    boxShadow: "0 0 10px #e11d48",
                    animation: "scanLineMove 2s infinite"
                  }}></div>
                )}
              </div>

              {/* Scan Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="secondary-btn w-1/3" onClick={() => { setScanStep("upload"); setSelectedFile(null); }}>
                  Cancel
                </button>
                <button type="button" className="primary flex-1" onClick={triggerScan} disabled={isProcessing}>
                  {isProcessing ? "Scanning..." : "Confirm & Auto Crop"}
                </button>
              </div>
            </div>
          )}

          {/* Success & Classify State */}
          {scanStep === "success" && (
            <div className="animate-fade-in">
              <div className="card p-3 border mb-3">
                <div className="demo-note success-note text-left mb-3" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", display: "flex", gap: "8px", alignItems: "center" }}>
                  <CheckCircle size={18} />
                  <span><strong>✓ Document scanned successfully!</strong></span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Classified: {detectedType}</h4>
                    <span className="small text-secondary">Layout status: Aligned</span>
                  </div>
                  <button type="button" className="secondary-btn" onClick={() => setScanStep("upload")}>
                    Rescan
                  </button>
                </div>

                <button 
                  type="button" 
                  className="primary mt-3 w-full"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={() => setShowHelper(true)}
                >
                  <HelpCircle size={16} /> 🤖 View Field Assistance Guide
                </button>
              </div>
            </div>
          )}

          {/* AI Form Helper Steps HUD */}
          {showHelper && scanStep === "success" && (
            <div className="card p-4 border animate-slide-up" style={{ background: "#fef8e6", borderColor: "#fef3c7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: "0" }}>🤖 {dTrans.guideTitle}</h3>
                <button type="button" className="secondary-btn" onClick={handlePlayVoice} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Volume2 size={16} /> {isSpeaking ? "Stop" : `🔊 Listen Guide`}
                </button>
              </div>

              <div style={{ background: "#ffffff", padding: "15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge" style={{ background: "#fef3c7", color: "#b45309", fontWeight: "800" }}>
                    Step {helperStep} of {activeSteps.length}
                  </span>
                  <span className="small text-secondary">Detected: {detectedType}</span>
                </div>

                <h4 style={{ marginTop: "10px", color: "#1e3a5f" }}>{currentStepData.field}</h4>
                
                <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr", gap: "10px" }} className="small text-secondary">
                  <p>📍 <strong>Where:</strong> {currentStepData.location}</p>
                  <p>✍ <strong>How:</strong> {currentStepData.instruction}</p>
                </div>

                {/* Annotation mockup */}
                <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
                  <div style={{ 
                    width: "100%", 
                    maxWidth: "320px", 
                    height: "180px", 
                    background: "#ffffff", 
                    border: "2px solid #334155", 
                    borderRadius: "10px", 
                    margin: "0 auto", 
                    position: "relative",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ fontSize: "10px", fontWeight: "700", background: "#0ea5e9", color: "white", padding: "4px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                      {detectedType} Mock Reference
                    </div>
                    
                    {detectedType === "Aadhaar Card" && (
                      <div style={{ padding: "10px", fontSize: "11px", textAlign: "left" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <div style={{ width: "40px", height: "50px", background: "#e2e8f0", borderRadius: "4px" }}></div>
                          <div>
                            <div style={{ 
                              fontWeight: "bold", 
                              background: currentStepData.visual === "aadhaar_name" ? "#fef3c7" : "transparent",
                              border: currentStepData.visual === "aadhaar_name" ? "1.5px solid #d97706" : "none",
                              padding: "1px 4px",
                              borderRadius: "2px"
                            }}>
                              Ramesh Kumar
                            </div>
                            <div style={{ fontSize: "8px", color: "#64748b", marginTop: "3px" }}>DOB: 15/08/1980</div>
                          </div>
                        </div>
                        <div style={{ 
                          marginTop: "40px", 
                          textAlign: "center", 
                          fontSize: "14px", 
                          fontWeight: "800",
                          background: currentStepData.visual === "aadhaar_number" ? "#fef3c7" : "transparent",
                          border: currentStepData.visual === "aadhaar_number" ? "1.5px solid #d97706" : "none",
                          padding: "2px",
                          borderRadius: "4px"
                        }}>
                          1234 5678 9012
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stepper Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", gap: "10px" }}>
                <button 
                  type="button" 
                  className="secondary-btn" 
                  disabled={helperStep === 1}
                  onClick={() => setHelperStep(prev => prev - 1)}
                >
                  Back
                </button>
                {helperStep < activeSteps.length ? (
                  <button 
                    type="button" 
                    className="primary" 
                    onClick={() => setHelperStep(prev => prev + 1)}
                  >
                    Next Field
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="primary" 
                    style={{ background: "#16a34a", borderColor: "#16a34a" }}
                    onClick={() => { setShowHelper(false); setScanStep("upload"); setSelectedFile(null); }}
                  >
                    Done Guide
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes scanLineMove {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
      <DemoNote>Document scanner is a prototype check. No real card verification or storage takes place.</DemoNote>
    </div>
  );
}
