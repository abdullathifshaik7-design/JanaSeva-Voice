import React, { useState, useRef, useCallback } from "react";
import { Check, Mic, Search, Volume2, PlusCircle, History, Info, HelpCircle, FileText, Upload } from "lucide-react";
import { useApp } from "../context/AppContext";
import { speakText, SpeechToTextAPI } from "../services/voiceService";
import DemoNote from "../components/DemoNote";
import ComplaintTimeline from "../components/ComplaintTimeline";

const COMPLAINT_CATEGORIES = [
  "Water",
  "Electricity",
  "Roads",
  "Sanitation",
  "Ration / Food",
  "Pension",
  "Agriculture",
  "Health",
  "Education",
  "Government Office",
  "Certificates / Documents",
  "Housing",
  "Employment",
  "Women & Child Services",
  "Other"
];

export default function ComplaintsPage() {
  const { complaints, addComplaint, language, selectedState, user, t } = useApp();
  const [activeSubTab, setActiveSubTab] = useState("report"); // 'report', 'track', 'list', 'how'

  // Submit form states
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [district, setDistrict] = useState("");
  const [exactLocation, setExactLocation] = useState("");
  const [description, setDescription] = useState("");
  const [prefLang, setPrefLang] = useState(language);
  const [contactMobile, setContactMobile] = useState("");
  const [registeredComplaint, setRegisteredComplaint] = useState(null);
  
  // Voice input states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const silenceDetectionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  // Track state
  const [trackId, setTrackId] = useState("");
  const [trackedResult, setTrackedResult] = useState(null);
  const [trackError, setTrackError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please describe your problem.");
      return;
    }

    const refId = `JSV-PRB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newComplaint = {
      id: refId,
      name: user?.email || "Guest Citizen",
      mobile: contactMobile || user?.phone || "Not Provided",
      state: selectedState,
      district: district || "General",
      category,
      department: department || "General Administration",
      description: `${subject} - ${description} (Location: ${exactLocation || "Not Provided"})`,
      preferredLanguage: prefLang,
      status: "Submitted",
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      timeline: [
        { title: "Complaint Submitted", done: true, current: true, date: "Today" },
        { title: "Under Review", done: false, current: false, date: "Pending" },
        { title: "In Progress", done: false, current: false, date: "Pending" },
        { title: "Resolved", done: false, current: false, date: "Pending" }
      ]
    };

    addComplaint(newComplaint);
    setRegisteredComplaint(newComplaint);

    // Clear inputs
    setSubject("");
    setDepartment("");
    setDistrict("");
    setExactLocation("");
    setDescription("");
    setContactMobile("");
  };

  const handleTrack = () => {
    setTrackError("");
    const matched = complaints.find(
      (c) => c.id.trim().toUpperCase() === trackId.trim().toUpperCase()
    );

    if (matched) {
      setTrackedResult(matched);
    } else {
      setTrackedResult(null);
      setTrackError("No complaint found matching this tracking ID. Check the spelling or enter JSV-2026-00124.");
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (silenceDetectionRef.current) {
        cancelAnimationFrame(silenceDetectionRef.current);
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
      if (mediaRecorderRef.current?.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleSpeechInput = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (isProcessing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = "audio/ogg";
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Set up audio context for silence detection
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      let silenceStartTime = null;
      const SILENCE_THRESHOLD = 30;
      const SILENCE_DURATION = 1500;
      const MAX_RECORDING_TIME = 10000;

      const detectSilence = () => {
        if (!isRecording || mediaRecorderRef.current?.state !== "recording") {
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        if (average < SILENCE_THRESHOLD) {
          if (!silenceStartTime) {
            silenceStartTime = Date.now();
          } else if (Date.now() - silenceStartTime > SILENCE_DURATION) {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            return;
          }
        } else {
          silenceStartTime = null;
        }

        silenceDetectionRef.current = requestAnimationFrame(detectSilence);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Clear detection and timeouts
        if (silenceDetectionRef.current) {
          cancelAnimationFrame(silenceDetectionRef.current);
          silenceDetectionRef.current = null;
        }
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        
        setIsRecording(false);
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result.split(",")[1];
            
            // Map language code
            const langCode = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : "en-IN";
            
            const transcriptText = await SpeechToTextAPI(base64Audio, langCode);
            
            if (transcriptText && transcriptText.trim()) {
              setDescription(transcriptText);
            }
          } catch (err) {
            console.error("Speech recognition failed:", err);
            alert("Speech recognition failed. Please try again.");
          } finally {
            setIsProcessing(false);
            
            // Clean up
            stream.getTracks().forEach(track => track.stop());
            if (audioContextRef.current) {
              try {
                audioContextRef.current.close();
              } catch (e) {}
              audioContextRef.current = null;
            }
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start silence detection
      silenceDetectionRef.current = requestAnimationFrame(detectSilence);
      
      // Set maximum recording time
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_TIME);

    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Microphone permission denied or no audio input device found.");
    }
  }, [isRecording, isProcessing, language]);

  // Filter complaints registered by current citizen session
  const myComplaints = complaints.filter(c => !user || c.name === user.email || c.mobile === user.phone || true);

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="page-title">
        <h1>📢 Report a Problem</h1>
        <p>Tell us about a government service problem and track its resolution progress.</p>
      </div>

      {/* Grid Sub Navigation tabs */}
      <div style={{ display: "flex", gap: "5px", background: "#f1f5f9", padding: "4px", borderRadius: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeSubTab === "report" ? "#ffffff" : "transparent",
            color: activeSubTab === "report" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => { setActiveSubTab("report"); setRegisteredComplaint(null); }}
        >
          ➕ Report a Problem
        </button>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeSubTab === "track" ? "#ffffff" : "transparent",
            color: activeSubTab === "track" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => setActiveSubTab("track")}
        >
          🔎 Track My Complaint
        </button>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeSubTab === "list" ? "#ffffff" : "transparent",
            color: activeSubTab === "list" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => setActiveSubTab("list")}
        >
          📋 My Complaints ({myComplaints.length})
        </button>
        <button
          type="button"
          className="text-btn"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            background: activeSubTab === "how" ? "#ffffff" : "transparent",
            color: activeSubTab === "how" ? "#0ea5e9" : "#64748b",
            fontWeight: "700"
          }}
          onClick={() => setActiveSubTab("how")}
        >
          ❓ How It Works
        </button>
      </div>

      <div style={{ minHeight: "50vh" }}>
        
        {/* SUB TAB 1: Report problem Form */}
        {activeSubTab === "report" && (
          <section className="card text-left">
            <h2>📝 File a Civic Issue Report</h2>
            <hr style={{ margin: "15px 0", borderColor: "#f1f5f9" }} />

            {registeredComplaint ? (
              <div className="complaint-success text-center py-4 animate-fade-in">
                <div className="success-icon" style={{ background: "#22c55e", color: "white", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <Check size={32} />
                </div>
                <h3 className="mt-3 text-success">✓ Ticket Successfully Created</h3>
                <div className="card id-card mt-3 p-3 bg-light mx-auto" style={{ maxWidth: "350px" }}>
                  <div>Tracking ID</div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e3a5f" }}>{registeredComplaint.id}</div>
                  <span className="badge mt-1" style={{ display: "inline-block" }}>Status: {registeredComplaint.status}</span>
                </div>
                <p className="mt-3 text-secondary">
                  The local administrative office has been alerted. Use this tracking ID to follow up.
                </p>
                <button type="button" className="primary mt-3" onClick={() => setRegisteredComplaint(null)}>
                  File Another Problem Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="admin-form">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  <div>
                    <label>What problem are you facing?</label>
                    <input 
                      type="text" 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)} 
                      placeholder="e.g. Broken water pipe leaking"
                      required
                    />
                  </div>
                  <div>
                    <label>Government Department / Service</label>
                    <input 
                      type="text" 
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)} 
                      placeholder="e.g. Municipal Corporation"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "12px" }}>
                  <div>
                    <label>Problem Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {COMPLAINT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Jurisdiction State</label>
                    <input type="text" value={selectedState} disabled style={{ background: "#f1f5f9" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "12px" }}>
                  <div>
                    <label>District</label>
                    <input 
                      type="text" 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)} 
                      placeholder="e.g. Guntur"
                    />
                  </div>
                  <div>
                    <label>Exact Location / Landmark (Optional)</label>
                    <input 
                      type="text" 
                      value={exactLocation} 
                      onChange={(e) => setExactLocation(e.target.value)} 
                      placeholder="e.g. Main bazaar, next to Ram Mandir"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Problem Description</span>
                    <button 
                      type="button" 
                      className="text-btn" 
                      onClick={handleSpeechInput} 
                      disabled={isProcessing}
                      style={{ 
                        fontSize: "12px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        color: isRecording ? "#dc2626" : "#0ea5e9"
                      }}
                    >
                      <Mic size={14} /> 
                      {isRecording ? "Stop Recording" : isProcessing ? "Processing..." : `Speak in ${language.toUpperCase()}`}
                    </button>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the issue. Include street names, how long it has been broken, etc."
                    rows="4"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "12px" }}>
                  <div>
                    <label>Preferred Communication Language</label>
                    <select value={prefLang} onChange={(e) => setPrefLang(e.target.value)}>
                      <option value="en">English</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                    </select>
                  </div>
                  <div>
                    <label>Contact Mobile Number</label>
                    <input 
                      type="tel" 
                      value={contactMobile} 
                      onChange={(e) => setContactMobile(e.target.value)} 
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label>Upload Photo / Document Evidence (Optional)</label>
                  <div style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer", background: "#f8fafc" }}>
                    <Upload size={24} className="text-secondary mx-auto mb-2" />
                    <span className="small text-secondary">Click to attach photo or document files (JPG, PNG, PDF supported)</span>
                  </div>
                </div>

                <button type="submit" className="primary full mt-4">
                  Submit Problem Report
                </button>
              </form>
            )}
          </section>
        )}

        {/* SUB TAB 2: Track ID search */}
        {activeSubTab === "track" && (
          <section className="card text-left">
            <h2>🔍 Track Ticket Status</h2>
            <p className="card-sub">Check resolution updates using your problem tracking reference ID.</p>
            <hr style={{ margin: "15px 0", borderColor: "#f1f5f9" }} />

            <div className="status-input-row mt-2">
              <input 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="e.g. JSV-PRB-123456"
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              />
              <button type="button" className="primary" onClick={handleTrack}>
                <Search size={16} /> Track Issue
              </button>
            </div>
            <DemoNote>Demo tracking ticket: <strong>JSV-2026-00124</strong></DemoNote>

            {trackError && <div className="demo-note error-note mt-3">{trackError}</div>}

            {trackedResult && (
              <div className="result-details-box mt-4 p-4 border rounded animate-fade-in" style={{ background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Ticket details - {trackedResult.id}</h3>
                  <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>
                    {trackedResult.status}
                  </span>
                </div>
                <hr style={{ margin: "10px 0", borderColor: "#e2e8f0" }} />
                <p className="small"><strong>Category:</strong> {trackedResult.category}</p>
                <p className="small"><strong>Problem Statement:</strong> &ldquo;{trackedResult.description}&rdquo;</p>
                
                <div className="timeline-container mt-4">
                  <ComplaintTimeline 
                    steps={trackedResult.timeline || [
                      { title: "Submitted", done: true, current: false, date: trackedResult.date },
                      { title: "Under Review", done: false, current: true, date: "Pending" },
                      { title: "In Progress", done: false, current: false, date: "Pending" },
                      { title: "Resolved", done: false, current: false, date: "Pending" }
                    ]} 
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* SUB TAB 3: My complaints registered */}
        {activeSubTab === "list" && (
          <section className="card text-left">
            <h2>📋 Your Problems Catalog</h2>
            <p className="card-sub">History of filed service problems and local administrative tracking updates.</p>
            <hr style={{ margin: "15px 0", borderColor: "#f1f5f9" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myComplaints.length === 0 ? (
                <p className="text-secondary small">You haven't submitted any problems yet.</p>
              ) : (
                myComplaints.map((c) => (
                  <div 
                    key={c.id} 
                    className="card p-3 bg-white border animate-fade-in" 
                    style={{ cursor: "pointer" }}
                    onClick={() => { setTrackId(c.id); handleTrack(); setActiveSubTab("track"); }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{c.category} - {c.description.slice(0, 45)}...</strong>
                      <span className="badge">{c.status}</span>
                    </div>
                    <div className="small text-secondary mt-1">
                      Ticket ID: {c.id} | Date: {c.date} | Jurisdiction: {c.state}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* SUB TAB 4: How Report a Problem reporting works info */}
        {activeSubTab === "how" && (
          <section className="card text-left">
            <h2>❓ Civic Problem reporting process</h2>
            <p className="card-sub">Simple guidelines for reporting public utility and government office service issues.</p>
            <hr style={{ margin: "15px 0", borderColor: "#f1f5f9" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px", alignItems: "start" }}>
                <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", flexShrink: 0 }}>1</span>
                <div>
                  <strong>File details:</strong> Identify department category (like Roads, Water or Ration supplies) and write or speak details.
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px", alignItems: "start" }}>
                <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", flexShrink: 0 }}>2</span>
                <div>
                  <strong>Get Tracking ID:</strong> Submitting yields a unique JSV ticket ID.
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px", alignItems: "start" }}>
                <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", flexShrink: 0 }}>3</span>
                <div>
                  <strong>Officer Review:</strong> Admin panels route the ticket to local supervisors who update status steps (Under Review, In Progress, Resolved).
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <DemoNote>Civic Reporting simulation is designed for demonstration. Live tickets connect to Supabase database tables.</DemoNote>
    </div>
  );
}
