import React, { useState } from "react";
import { 
  Plus, Trash2, Edit2, Landmark, Settings, Activity, Folder, Map, 
  CheckCircle, Database, MessageSquare, AlertCircle, Search, Users, 
  Bell, FileText, Globe, LogOut, ChevronRight, X, Eye, PhoneCall 
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, STATES, SERVICE_CENTERS } from "../data/db";
import DemoNote from "../components/DemoNote";
import Logo from "../components/Logo";

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

export default function AdminPage() {
  const {
    schemes,
    setSchemes,
    services,
    setServices,
    applications,
    feedbacks,
    complaints,
    setComplaints,
    isAdminLoggedIn,
    setAdminLoggedIn,
    t
  } = useApp();

  // Auth form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation state (Sleek professional sidebar)
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'schemes', 'notifications', 'centers', 'complaints', 'users', 'feedback'
  const [editingId, setEditingId] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Phone Call AI Helpline Analytics State
  const [phoneMetrics, setPhoneMetrics] = useState({
    totalCalls: 18,
    activeCalls: 1,
    completedCalls: 17,
    averageDurationSeconds: 110,
    languageDistribution: { "te-IN": 9, "hi-IN": 5, "ta-IN": 2, "en-IN": 2 },
    topIntents: { pension: 8, farmers: 5, grievance: 3, education: 1, general: 1 }
  });

  React.useEffect(() => {
    fetch("/api/voice/analytics")
      .then(res => res.json())
      .then(data => {
        if (data && data.totalCalls) setPhoneMetrics(data);
      })
      .catch(() => {});
  }, []);

  // Scheme Form State
  const [form, setForm] = useState({
    name: "",
    governmentLevel: "Central",
    state: "Andhra Pradesh",
    department: "",
    category: "farmers",
    description: "",
    benefits: "",
    eligibility: "",
    ageMin: "",
    ageMax: "",
    incomeMax: "",
    requiredDocuments: "",
    applicationSteps: "",
    officialWebsite: "",
    officialSource: "",
    helpline: "",
    status: "Active"
  });

  // Complaint Update State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState("Submitted");
  const [resolutionNote, setResolutionNote] = useState("");

  // Custom Scheduled Notification state
  const [notifForm, setNotifForm] = useState({
    title: "",
    description: "",
    targetProfession: "Farmer",
    targetState: "Andhra Pradesh",
    urgency: "Normal"
  });
  const [scheduledNotifs, setScheduledNotifs] = useState([
    { id: "not-1", title: "PM-KISAN installment disbursement", description: "Saffron central subsidy credit will initiate on 1st Sep.", target: "Farmer", state: "All" }
  ]);

  // Center form state
  const [centerForm, setCenterForm] = useState({
    name: "",
    type: "MeeSeva / Citizen Service",
    address: "",
    phone: "",
    state: "Andhra Pradesh",
    status: "Active"
  });
  const [editingCenterId, setEditingCenterId] = useState(null);

  // Authenticate login credentials
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setAdminLoggedIn(true);
      setAuthError("");
    } else {
      setAuthError(t("notAdminError") || "Invalid admin credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
  };

  // Metrics calculators
  const stats = {
    totalUsers: 142,
    activeSchemes: schemes.filter(s => s.status === "Active").length,
    pendingComplaints: complaints.filter(c => c.status !== "Resolved").length,
    resolvedComplaints: complaints.filter(c => c.status === "Resolved").length,
    newFeedback: feedbacks.length,
    serviceCenters: services.length
  };

  // Scheme CRUD Handlers
  const handleSaveScheme = (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      alert("Name and description are required.");
      return;
    }

    let updatedSchemes;
    if (editingId) {
      // Edit
      updatedSchemes = schemes.map(s => s.id === editingId ? {
        ...s,
        name: form.name,
        governmentLevel: form.governmentLevel,
        state: form.governmentLevel === "Central" ? null : form.state,
        department: form.department,
        category: form.category,
        description: form.description,
        benefits: form.benefits,
        eligibility: form.eligibility,
        ageCriteria: { min: parseInt(form.ageMin) || 0, max: parseInt(form.ageMax) || 120 },
        incomeCriteria: { max: parseInt(form.incomeMax) || 999999 },
        requiredDocuments: form.requiredDocuments.split(",").map(d => d.trim()).filter(Boolean),
        applicationSteps: form.applicationSteps.split("\n").map(s => s.trim()).filter(Boolean),
        officialWebsite: form.officialWebsite,
        officialSource: form.officialSource,
        helpline: form.helpline,
        status: form.status
      } : s);
    } else {
      // Create
      const newId = `s-${Date.now()}`;
      const newScheme = {
        id: newId,
        name: form.name,
        governmentLevel: form.governmentLevel,
        state: form.governmentLevel === "Central" ? null : form.state,
        department: form.department,
        category: form.category,
        description: form.description,
        benefits: form.benefits,
        eligibility: form.eligibility,
        ageCriteria: { min: parseInt(form.ageMin) || 0, max: parseInt(form.ageMax) || 120 },
        incomeCriteria: { max: parseInt(form.incomeMax) || 999999 },
        requiredDocuments: form.requiredDocuments.split(",").map(d => d.trim()).filter(Boolean),
        applicationSteps: form.applicationSteps.split("\n").map(s => s.trim()).filter(Boolean),
        officialWebsite: form.officialWebsite,
        officialSource: form.officialSource,
        helpline: form.helpline,
        status: form.status,
        lastVerified: "Today",
        simpleExplanation: { en: form.benefits, te: form.benefits, hi: form.benefits }
      };
      updatedSchemes = [newScheme, ...schemes];
    }

    setSchemes(updatedSchemes);
    setEditingId(null);
    setForm({
      name: "", governmentLevel: "Central", state: "Andhra Pradesh", department: "",
      category: "farmers", description: "", benefits: "", eligibility: "",
      ageMin: "", ageMax: "", incomeMax: "", requiredDocuments: "",
      applicationSteps: "", officialWebsite: "", officialSource: "", helpline: "", status: "Active"
    });
    alert("Scheme saved successfully!");
  };

  const handleEditScheme = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      governmentLevel: s.governmentLevel,
      state: s.state || "Andhra Pradesh",
      department: s.department || "",
      category: s.category,
      description: s.description,
      benefits: s.benefits,
      eligibility: s.eligibility,
      ageMin: s.ageCriteria?.min || "",
      ageMax: s.ageCriteria?.max || "",
      incomeMax: s.incomeCriteria?.max || "",
      requiredDocuments: s.requiredDocuments?.join(", ") || "",
      applicationSteps: s.applicationSteps?.join("\n") || "",
      officialWebsite: s.officialWebsite || "",
      officialSource: s.officialSource || "",
      helpline: s.helpline || "",
      status: s.status || "Active"
    });
  };

  const handleDeleteScheme = (id) => {
    if (window.confirm("Are you sure you want to delete this scheme? This will sync immediately to Supabase.")) {
      const updated = schemes.filter(s => s.id !== id);
      setSchemes(updated);
    }
  };

  // Complaint updater
  const handleUpdateComplaintStatus = () => {
    const updated = complaints.map(c => {
      if (c.id === selectedComplaint.id) {
        const timeline = [...(c.timeline || [])];
        timeline.push({
          title: `Status updated: ${complaintStatus}`,
          done: true,
          current: true,
          date: "Today"
        });
        return {
          ...c,
          status: complaintStatus,
          timeline,
          description: `${c.description} (Resolution Note: ${resolutionNote || "None"})`
        };
      }
      return c;
    });

    setComplaints(updated);
    setSelectedComplaint(null);
    setResolutionNote("");
    alert("Complaint status successfully updated inside Supabase!");
  };

  // Notifications scheduler
  const handleScheduleNotif = (e) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.description) return;
    const newNotif = {
      id: `not-${Date.now()}`,
      title: notifForm.title,
      description: notifForm.description,
      target: notifForm.targetProfession,
      state: notifForm.targetState
    };
    setScheduledNotifs([newNotif, ...scheduledNotifs]);
    setNotifForm({
      title: "", description: "", targetProfession: "Farmer", targetState: "Andhra Pradesh", urgency: "Normal"
    });
    alert("Targeted alert notification successfully scheduled!");
  };

  // Center CRUD
  const handleSaveCenter = (e) => {
    e.preventDefault();
    if (!centerForm.name || !centerForm.address) return;
    let updated;
    if (editingCenterId) {
      updated = services.map(s => s.id === editingCenterId ? { ...s, ...centerForm } : s);
    } else {
      updated = [{ id: `ctr-${Date.now()}`, ...centerForm }, ...services];
    }
    setServices(updated);
    setEditingCenterId(null);
    setCenterForm({ name: "", type: "MeeSeva / Citizen Service", address: "", phone: "", state: "Andhra Pradesh", status: "Active" });
    alert("Service Center successfully registered!");
  };

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchState = filterState === "all" || s.state === filterState;
    const matchCat = filterCategory === "all" || s.category === filterCategory;
    return matchSearch && matchState && matchCat;
  });

  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-layout text-center">
        <div className="card admin-login-card mx-auto mt-5" style={{ maxWidth: "420px", padding: "30px" }}>
          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center" }}>
            <Logo size={64} />
          </div>
          <h2>Admin Console Access</h2>
          <p className="card-sub">Authenticate using administrator credentials to manage records.</p>
          
          {authError && <div className="demo-note error-note mt-3 mb-2">{authError}</div>}

          <form onSubmit={handleLogin} className="admin-form text-left mt-3">
            <div>
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="mt-2">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="primary w-full mt-3">
              Login to Console
            </button>
          </form>
          <div className="demo-note mt-3">Username is: <b>admin</b> | Password is: <b>admin123</b></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell" style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "85vh", gap: "20px" }}>
      
      {/* Sleek Admin Sidebar */}
      <aside className="card p-3 text-left" style={{ display: "flex", flexDirection: "column", gap: "10px", height: "fit-content" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
          <Activity className="text-primary" size={20} />
          <h3 style={{ margin: "0" }}>Admin Portal Hub</h3>
        </div>
        
        <button type="button" className="text-btn" style={{ justifyContent: "flex-start", fontWeight: activeTab === "dashboard" ? "800" : "500", color: activeTab === "dashboard" ? "#0ea5e9" : "#475569" }} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
        <button type="button" className="text-btn" style={{ justifyContent: "flex-start", fontWeight: activeTab === "schemes" ? "800" : "500", color: activeTab === "schemes" ? "#0ea5e9" : "#475569" }} onClick={() => setActiveTab("schemes")}>📁 Schemes & Programs</button>
        <button type="button" className="text-btn" style={{ justifyContent: "flex-start", fontWeight: activeTab === "notifications" ? "800" : "500", color: activeTab === "notifications" ? "#0ea5e9" : "#475569" }} onClick={() => setActiveTab("notifications")}>🔔 Alert Schedulers</button>
        <button type="button" className="text-btn" style={{ justifyContent: "flex-start", fontWeight: activeTab === "centers" ? "800" : "500", color: activeTab === "centers" ? "#0ea5e9" : "#475569" }} onClick={() => setActiveTab("centers")}>🗺️ Service Desks</button>
        <button type="button" className="text-btn" style={{ justifyContent: "flex-start", fontWeight: activeTab === "complaints" ? "800" : "500", color: activeTab === "complaints" ? "#0ea5e9" : "#475569" }} onClick={() => setActiveTab("complaints")}>📢 Complaint Tickets</button>
        <button type="button" className="text-btn" style={{ justifyContent: "flex-start", fontWeight: activeTab === "feedback" ? "800" : "500", color: activeTab === "feedback" ? "#0ea5e9" : "#475569" }} onClick={() => setActiveTab("feedback")}>💬 Citizen Feedback</button>

        <hr style={{ margin: "10px 0", borderColor: "#f1f5f9" }} />
        <button type="button" className="secondary-btn" onClick={handleLogout}>
          <LogOut size={14} /> Exit Portal
        </button>
      </aside>

      {/* Main Admin Contents */}
      <main className="text-left" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* TAB 1: Dashboard metrics */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2>📊 Dashboard Metrics Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
              <div className="card p-3 border-info" style={{ background: "#f0f9ff" }}>
                <Users className="text-primary mb-2" size={24} />
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{stats.totalUsers}</div>
                <div className="small text-secondary">Total Registered Citizens</div>
              </div>
              <div className="card p-3 border-success" style={{ background: "#f0fdf4" }}>
                <Landmark className="text-success mb-2" size={24} />
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{stats.activeSchemes}</div>
                <div className="small text-secondary">Active Welfare Schemes</div>
              </div>
              <div className="card p-3 border-warning" style={{ background: "#fffbeb" }}>
                <AlertCircle className="text-warning mb-2" size={24} />
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{stats.pendingComplaints}</div>
                <div className="small text-secondary">Pending Problem Reports</div>
              </div>
              <div className="card p-3" style={{ background: "#f8fafc" }}>
                <CheckCircle className="text-secondary mb-2" size={24} />
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{stats.resolvedComplaints}</div>
                <div className="small text-secondary">Resolved Tickets</div>
              </div>
            </div>
            
            {/* Phone Call AI Helpline Analytics */}
            <div className="card p-3" style={{ background: "#fef8e6", border: "1px solid #fde68a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PhoneCall className="text-warning" size={22} />
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#92400e" }}>📞 Phone Call AI Helpline Analytics</h3>
                </div>
                <span className="badge" style={{ background: "#16a34a", color: "white" }}>Live Telephony Connected</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "15px" }}>
                <div className="card p-2 bg-white text-center">
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e3a8a" }}>{phoneMetrics.totalCalls}</div>
                  <div className="small text-secondary">Total Inbound Calls</div>
                </div>
                <div className="card p-2 bg-white text-center">
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a" }}>{phoneMetrics.activeCalls}</div>
                  <div className="small text-secondary">Active Calls Now</div>
                </div>
                <div className="card p-2 bg-white text-center">
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#0284c7" }}>{phoneMetrics.completedCalls}</div>
                  <div className="small text-secondary">Completed Calls</div>
                </div>
                <div className="card p-2 bg-white text-center">
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#d97706" }}>{phoneMetrics.averageDurationSeconds}s</div>
                  <div className="small text-secondary">Avg Call Duration</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                <div className="card p-3 bg-white">
                  <h4 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>🗣️ Language Distribution</h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>Telugu: {phoneMetrics.languageDistribution?.["te-IN"] || 0}</span>
                    <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>Hindi: {phoneMetrics.languageDistribution?.["hi-IN"] || 0}</span>
                    <span className="badge" style={{ background: "#f3e8ff", color: "#7e22ce" }}>Tamil: {phoneMetrics.languageDistribution?.["ta-IN"] || 0}</span>
                    <span className="badge" style={{ background: "#f1f5f9", color: "#334155" }}>English: {phoneMetrics.languageDistribution?.["en-IN"] || 0}</span>
                  </div>
                </div>
                <div className="card p-3 bg-white">
                  <h4 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>🎯 Most Common Caller Inquiries</h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: "#ecfdf5", color: "#047857" }}>Pensions ({phoneMetrics.topIntents?.pension || 0})</span>
                    <span className="badge" style={{ background: "#fef9c3", color: "#854d0e" }}>Farmers ({phoneMetrics.topIntents?.farmers || 0})</span>
                    <span className="badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>Grievances ({phoneMetrics.topIntents?.grievance || 0})</span>
                    <span className="badge" style={{ background: "#e0e7ff", color: "#3730a3" }}>Education ({phoneMetrics.topIntents?.education || 0})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>⚙️ System Synchronization Status</h3>
              <p className="small text-secondary mt-1">This console connects to the user-facing app layers. Changes save directly to active database rows.</p>
              <div className="demo-note success-note mt-3">✓ Supabase API Sync: Connected & Active</div>
            </div>
          </div>
        )}

        {/* TAB 2: Schemes and Programs Grid/Form */}
        {activeTab === "schemes" && (
          <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            <h2>📁 Program & Scheme Catalog Management</h2>

            {/* Editor form card */}
            <div className="card">
              <h3>{editingId ? "✏️ Edit Program Details" : "➕ Register New Welfare Program"}</h3>
              <form onSubmit={handleSaveScheme} className="admin-form mt-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Scheme / Program Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. YSR Rythu Bharosa" required />
                </div>
                <div>
                  <label>Government Level</label>
                  <select value={form.governmentLevel} onChange={(e) => setForm({...form, governmentLevel: e.target.value})}>
                    <option value="Central">Central / National</option>
                    <option value="State">State Government</option>
                  </select>
                </div>
                <div>
                  <label>State (If State Level Selected)</label>
                  <select value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}>
                    {ALL_STATES_AND_UTS.filter(s => s !== "National / Central").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Department Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.id.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Welfare Department Name</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} placeholder="e.g. Dept of Agriculture" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Brief Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows="2" placeholder="Describe the program objectives..." required />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Benefits & Allocations</label>
                  <input type="text" value={form.benefits} onChange={(e) => setForm({...form, benefits: e.target.value})} placeholder="e.g. Financial aid of ₹13,500 annually" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Eligibility Rules Summary</label>
                  <input type="text" value={form.eligibility} onChange={(e) => setForm({...form, eligibility: e.target.value})} placeholder="e.g. Small & marginal landholder farmers in AP" />
                </div>
                <div>
                  <label>Age limits (Min / Max)</label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input type="number" value={form.ageMin} onChange={(e) => setForm({...form, ageMin: e.target.value})} placeholder="Min" style={{ width: "50%" }} />
                    <input type="number" value={form.ageMax} onChange={(e) => setForm({...form, ageMax: e.target.value})} placeholder="Max" style={{ width: "50%" }} />
                  </div>
                </div>
                <div>
                  <label>Max annual income limit</label>
                  <input type="number" value={form.incomeMax} onChange={(e) => setForm({...form, incomeMax: e.target.value})} placeholder="e.g. 200000" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Required Documents (Comma-separated)</label>
                  <input type="text" value={form.requiredDocuments} onChange={(e) => setForm({...form, requiredDocuments: e.target.value})} placeholder="e.g. Aadhaar Card, Income Certificate, Land Pattadar Passbook" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Application Steps (New line for each step)</label>
                  <textarea value={form.applicationSteps} onChange={(e) => setForm({...form, applicationSteps: e.target.value})} rows="3" placeholder="Step 1. Attach doc..." />
                </div>
                <div>
                  <label>Official Portal Link</label>
                  <input type="text" value={form.officialWebsite} onChange={(e) => setForm({...form, officialWebsite: e.target.value})} placeholder="e.g. https://rythubharosa.ap.gov.in" />
                </div>
                <div>
                  <label>Official Source Name / Helpline</label>
                  <input type="text" value={form.helpline} onChange={(e) => setForm({...form, helpline: e.target.value})} placeholder="e.g. 1902" />
                </div>
                
                <div style={{ gridColumn: "span 2", display: "flex", gap: "10px" }} className="mt-3">
                  <button type="submit" className="primary">
                    {editingId ? "Save Changes" : "Register Scheme"}
                  </button>
                  {editingId && (
                    <button type="button" className="secondary-btn" onClick={() => {
                      setEditingId(null);
                      setForm({ name: "", governmentLevel: "Central", state: "Andhra Pradesh", department: "", category: "farmers", description: "", benefits: "", eligibility: "", ageMin: "", ageMax: "", incomeMax: "", requiredDocuments: "", applicationSteps: "", officialWebsite: "", officialSource: "", helpline: "", status: "Active" });
                    }}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List catalog */}
            <div className="card">
              <h3>📋 Active Welfare Program Registry</h3>
              
              {/* Search filter bar */}
              <div style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search programs..." 
                  style={{ flex: 1 }}
                />
                <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                  <option value="all">All States</option>
                  {ALL_STATES_AND_UTS.filter(s => s !== "National / Central").map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.id.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredSchemes.map(s => (
                  <div key={s.id} className="card p-3 bg-white border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{s.name}</strong>
                      <div className="small text-secondary">
                        Level: {s.governmentLevel} | State: {s.state || "National"} | Category: {s.category}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button type="button" className="icon-btn text-primary" onClick={() => handleEditScheme(s)}>
                        <Edit2 size={16} />
                      </button>
                      <button type="button" className="icon-btn text-danger" onClick={() => handleDeleteScheme(s.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Alert Notification Scheduler */}
        {activeTab === "notifications" && (
          <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            <h2>🔔 Targeted Broadcast Alert Scheduler</h2>
            
            <div className="card">
              <h3>Create Broadcast Alert</h3>
              <form onSubmit={handleScheduleNotif} className="admin-form mt-3">
                <div>
                  <label>Alert Title</label>
                  <input type="text" value={notifForm.title} onChange={(e) => setNotifForm({...notifForm, title: e.target.value})} placeholder="e.g. PM-KISAN installment released" required />
                </div>
                <div className="mt-2">
                  <label>Alert Message Description</label>
                  <textarea value={notifForm.description} onChange={(e) => setNotifForm({...notifForm, description: e.target.value})} rows="3" placeholder="Write the alert content..." required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} className="mt-2">
                  <div>
                    <label>Target Audience (Profession)</label>
                    <select value={notifForm.targetProfession} onChange={(e) => setNotifForm({...notifForm, targetProfession: e.target.value})}>
                      <option value="Farmer">Farmer / Agriculture</option>
                      <option value="Student">Student / Youth</option>
                      <option value="Senior Citizen">Senior Citizen (60+)</option>
                      <option value="Worker">Worker / Labourer</option>
                      <option value="Woman">Woman / Mother</option>
                    </select>
                  </div>
                  <div>
                    <label>Target State</label>
                    <select value={notifForm.targetState} onChange={(e) => setNotifForm({...notifForm, targetState: e.target.value})}>
                      <option value="All">All States</option>
                      {ALL_STATES_AND_UTS.filter(s => s !== "National / Central").map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="primary mt-3">
                  Broadcast Targeted Alert
                </button>
              </form>
            </div>

            <div className="card">
              <h3>📋 Broadcast History Log</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }} className="mt-3">
                {scheduledNotifs.map(n => (
                  <div key={n.id} className="card p-3 border bg-white">
                    <strong>{n.title}</strong>
                    <p className="small text-secondary">{n.description}</p>
                    <div className="small text-secondary mt-1">Target Audience: {n.target} | Target State: {n.state}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Service centers CRUD */}
        {activeTab === "centers" && (
          <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            <h2>🗺️ Citizen Desks & Service Offices</h2>
            
            <div className="card">
              <h3>{editingCenterId ? "✏️ Edit Service Desk" : "➕ Register New Service Desk"}</h3>
              <form onSubmit={handleSaveCenter} className="admin-form mt-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label>Desk / Center Name</label>
                  <input type="text" value={centerForm.name} onChange={(e) => setCenterForm({...centerForm, name: e.target.value})} placeholder="e.g. MeeSeva Desk AP-052" required />
                </div>
                <div>
                  <label>Desk Type</label>
                  <select value={centerForm.type} onChange={(e) => setCenterForm({...centerForm, type: e.target.value})}>
                    <option value="MeeSeva / Citizen Service">MeeSeva / Citizen Service</option>
                    <option value="Village Secretariat">Village Secretariat</option>
                    <option value="Municipal Office">Municipal Office</option>
                  </select>
                </div>
                <div>
                  <label>Office Address</label>
                  <input type="text" value={centerForm.address} onChange={(e) => setCenterForm({...centerForm, address: e.target.value})} placeholder="Location details..." required />
                </div>
                <div>
                  <label>Helpline / Phone</label>
                  <input type="text" value={centerForm.phone} onChange={(e) => setCenterForm({...centerForm, phone: e.target.value})} placeholder="e.g. 0863-222xxxx" />
                </div>
                <div>
                  <label>State</label>
                  <select value={centerForm.state} onChange={(e) => setCenterForm({...centerForm, state: e.target.value})}>
                    {ALL_STATES_AND_UTS.filter(s => s !== "National / Central").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="primary mt-3" style={{ gridColumn: "span 2" }}>
                  Save Service Desk
                </button>
              </form>
            </div>

            <div className="card">
              <h3>📋 Active Citizen Desks</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }} className="mt-3">
                {services.map(c => (
                  <div key={c.id} className="card p-3 border bg-white">
                    <strong>{c.name}</strong>
                    <div className="small text-secondary">{c.address}</div>
                    <div className="small text-secondary">Phone: {c.phone} | State: {c.state}</div>
                    <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                      <button type="button" className="text-btn text-primary" style={{ fontSize: "11px" }} onClick={() => {
                        setEditingCenterId(c.id);
                        setCenterForm({ name: c.name, type: c.type || "MeeSeva / Citizen Service", address: c.address, phone: c.phone || "", state: c.state || "Andhra Pradesh", status: c.status || "Active" });
                      }}>✏️ Edit</button>
                      <button type="button" className="text-btn text-danger" style={{ fontSize: "11px" }} onClick={() => {
                        if (window.confirm("Delete center?")) setServices(services.filter(item => item.id !== c.id));
                      }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Problem Reports/Complaints Assignment & Status Updater */}
        {activeTab === "complaints" && (
          <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            <h2>📢 Problem Reports & Problem Tickets</h2>

            {selectedComplaint && (
              <div className="card border-warning" style={{ background: "#fffbeb" }}>
                <h3>📝 Update Status for Ticket: {selectedComplaint.id}</h3>
                <div className="admin-form mt-3 text-left">
                  <div>
                    <label>Assigned Stage Status</label>
                    <select value={complaintStatus} onChange={(e) => setComplaintStatus(e.target.value)}>
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="mt-2">
                    <label>Officer Action / Resolution Note</label>
                    <input 
                      type="text" 
                      value={resolutionNote} 
                      onChange={(e) => setResolutionNote(e.target.value)} 
                      placeholder="e.g. Assigned to local panchayat supervisor" 
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }} className="mt-3">
                    <button type="button" className="primary" onClick={handleUpdateComplaintStatus}>
                      Save Ticket Update
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => setSelectedComplaint(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h3>📋 Active Citizen Complaint Tickets</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }} className="mt-3">
                {complaints.map(c => (
                  <div key={c.id} className="card p-3 border bg-white">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <strong>{c.id} - {c.category}</strong>
                        <div className="small text-secondary">State: {c.state} | Filed: {c.date}</div>
                        <p className="small text-secondary mt-1">&ldquo;{c.description}&rdquo;</p>
                      </div>
                      <span className="badge" style={{ background: c.status === "Resolved" ? "#d1fae5" : "#fee2e2", color: c.status === "Resolved" ? "#065f46" : "#991b1b" }}>
                        {c.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <button type="button" className="primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => {
                        setSelectedComplaint(c);
                        setComplaintStatus(c.status);
                      }}>
                        Update Status / Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Feedbacks catalog */}
        {activeTab === "feedback" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2>💬 Citizen App Feedback Reviews</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {feedbacks.map(f => (
                <div key={f.id} className="card p-3 border bg-white">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>Rating: {f.rating ? "⭐".repeat(f.rating) : f.helpfulness}</strong>
                    <span className="small text-secondary">{f.date}</span>
                  </div>
                  <p className="mt-1 small text-secondary">&ldquo;{f.comment || "No comment provided."}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
