import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";
import { 
  User, Edit2, Check, Landmark, LogOut, FileText, MessageSquare, 
  MapPin, Phone, Mail, Award, BookOpen, Globe, Calendar, ShieldCheck, Heart 
} from "lucide-react";
import { STATES } from "../data/db";
import DemoNote from "../components/DemoNote";

export default function ProfilePage() {
  const {
    t,
    language,
    user,
    setUser,
    setIsGuest,
    userProfile,
    setUserProfile,
    applications,
    complaints,
    feedbacks,
    schemes,
    setPage,
    logout
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable Profile fields (initialized with defaults or userProfile state)
  const [fullName, setFullName] = useState(userProfile.fullName || "Ganesh Kumar");
  const [mobileNumber, setMobileNumber] = useState(userProfile.mobileNumber || "9876543210");
  const [email, setEmail] = useState(user?.email || userProfile.email || "ganesh@gov.in");
  const [profileState, setProfileState] = useState(userProfile.state || "Andhra Pradesh");
  const [district, setDistrict] = useState(userProfile.district || "Guntur");
  const [age, setAge] = useState(userProfile.age || "62");
  const [occupation, setOccupation] = useState(userProfile.profession || "Farmer");
  const [preferredLang, setPreferredLang] = useState(userProfile.preferredLanguage || language);
  const [address, setAddress] = useState(userProfile.address || "Panchayat Block 4, Gandhi Nagar");

  const [activeHistoryTab, setActiveHistoryTab] = useState("info"); // 'info', 'apps', 'complaints', 'docs', 'feedback', 'saved'

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setMobileNumber(userProfile.mobileNumber || "");
      setEmail(user?.email || userProfile.email || "");
      setProfileState(userProfile.state || "Andhra Pradesh");
      setDistrict(userProfile.district || "");
      setAge(userProfile.age || "");
      setOccupation(userProfile.profession || "Farmer");
      setPreferredLang(userProfile.preferredLanguage || language);
      setAddress(userProfile.address || "");
    }
  }, [userProfile, user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...userProfile,
      fullName,
      mobileNumber,
      email,
      state: profileState,
      district,
      age,
      profession: occupation,
      preferredLanguage: preferredLang,
      address
    };
    setUserProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Filter histories relevant to user profile
  const myApps = applications.filter(app => true);
  const myComplaints = complaints.filter(c => true);
  const myFeedbacks = feedbacks.filter(f => true);
  
  // Mock mock document scans list
  const myDocs = [
    { id: "doc-1", type: "Aadhaar Card", date: "29 Aug 2026", status: "Readable", icon: FileText },
    { id: "doc-2", type: "Income Certificate", date: "28 Aug 2026", status: "Readable", icon: FileText }
  ];

  // Filter dynamic bookmarked schemes (mocking the first few active schemes for this session)
  const savedSchemes = schemes.slice(0, 2);

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left">
      <div className="page-title">
        <h1>👤 My Profile</h1>
        <p>Manage your personal information, view historical benefit logs and track uploaded documents.</p>
      </div>

      {saveSuccess && (
        <div className="demo-note success-note mb-3" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
          ✓ Profile information successfully updated and saved in Supabase database!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        
        {/* Profile Card HUD */}
        <div className="card">
          <div className="profile-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <div className="avatar large" style={{ background: "#0ea5e9", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white", fontSize: "24px", fontWeight: "700" }}>
                {fullName[0].toUpperCase()}
              </div>
              <div>
                <h2>{fullName}</h2>
                <div className="text-secondary small">{occupation} | State: {profileState}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                type="button" 
                className="secondary-btn" 
                style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 size={15} /> Edit Profile
              </button>
              {user && (
                <button 
                  type="button" 
                  className="secondary-btn" 
                  style={{ color: "#ef4444", borderColor: "#fca5a5" }}
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form Modal/Widget */}
        {isEditing && (
          <div className="card border-primary animate-slide-up">
            <h3>✏️ Edit Profile Information</h3>
            <hr style={{ margin: "10px 0", borderColor: "#f1f5f9" }} />
            
            <form onSubmit={handleSaveProfile} className="admin-form">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label>Mobile Number</label>
                  <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                </div>
                <div>
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label>State</label>
                  <select value={profileState} onChange={(e) => setProfileState(e.target.value)}>
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>District</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                </div>
                <div>
                  <label>Age (Years)</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div>
                  <label>Occupation</label>
                  <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
                </div>
                <div>
                  <label>Preferred Language</label>
                  <input type="text" value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} required />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="submit" className="primary">Save Changes</button>
                <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Tab content navigator */}
        <div className="card">
          {/* History Sub Menu Tabs */}
          <div style={{ display: "flex", gap: "5px", background: "#f1f5f9", padding: "4px", borderRadius: "8px", overflowX: "auto", whiteSpace: "nowrap", marginBottom: "15px" }}>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "info" ? "#ffffff" : "transparent", color: activeHistoryTab === "info" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("info")}>ℹ️ Info</button>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "apps" ? "#ffffff" : "transparent", color: activeHistoryTab === "apps" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("apps")}>📄 Applications ({myApps.length})</button>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "complaints" ? "#ffffff" : "transparent", color: activeHistoryTab === "complaints" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("complaints")}>📢 Problems ({myComplaints.length})</button>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "docs" ? "#ffffff" : "transparent", color: activeHistoryTab === "docs" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("docs")}>📁 Documents ({myDocs.length})</button>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "feedback" ? "#ffffff" : "transparent", color: activeHistoryTab === "feedback" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("feedback")}>💬 Feedback ({myFeedbacks.length})</button>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "saved" ? "#ffffff" : "transparent", color: activeHistoryTab === "saved" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("saved")}>❤️ Saved</button>
          </div>

          {/* TAB: Personal Info */}
          {activeHistoryTab === "info" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4>Personal Information</h4>
              <hr style={{ margin: "5px 0", borderColor: "#f1f5f9" }} />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                <div><strong>Full Name:</strong> {fullName}</div>
                <div><strong>Mobile Number:</strong> {mobileNumber}</div>
                <div><strong>Email Address:</strong> {email}</div>
                <div><strong>Preferred Language:</strong> {preferredLang.toUpperCase()}</div>
                <div><strong>State:</strong> {profileState}</div>
                <div><strong>District:</strong> {district}</div>
                <div><strong>Age (Years):</strong> {age}</div>
                <div><strong>Occupation:</strong> {occupation}</div>
                <div style={{ gridColumn: "span 2" }}><strong>Current Address:</strong> {address}</div>
              </div>
            </div>
          )}

          {/* TAB: Applications */}
          {activeHistoryTab === "apps" && (
            <div className="animate-fade-in text-left" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myApps.length === 0 ? (
                <p className="text-secondary small">No registered applications found.</p>
              ) : (
                myApps.map((app) => (
                  <div key={app.id} className="card p-3 bg-white border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{app.schemeName}</strong>
                      <div className="small text-secondary">Ref ID: {app.id} | Date: {app.date}</div>
                    </div>
                    <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>{app.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: Complaints */}
          {activeHistoryTab === "complaints" && (
            <div className="animate-fade-in text-left" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myComplaints.length === 0 ? (
                <p className="text-secondary small">No reported problems registered.</p>
              ) : (
                myComplaints.map((c) => (
                  <div key={c.id} className="card p-3 bg-white border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{c.category} - {c.description.slice(0, 45)}...</strong>
                      <div className="small text-secondary">Ticket ID: {c.id} | Date: {c.date}</div>
                    </div>
                    <span className="badge">{c.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: Documents */}
          {activeHistoryTab === "docs" && (
            <div className="animate-fade-in text-left" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myDocs.map((doc) => {
                const Icon = doc.icon;
                return (
                  <div key={doc.id} className="card p-3 bg-white border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Icon className="text-secondary" size={20} />
                      <div>
                        <strong>{doc.type}</strong>
                        <div className="small text-secondary">Uploaded: {doc.date}</div>
                      </div>
                    </div>
                    <span className="badge success">{doc.status}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: Feedback */}
          {activeHistoryTab === "feedback" && (
            <div className="animate-fade-in text-left" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myFeedbacks.length === 0 ? (
                <p className="text-secondary small">No app feedback logs registered.</p>
              ) : (
                myFeedbacks.map((f) => (
                  <div key={f.id} className="card p-3 bg-white border">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{f.type === "app" ? "App Feedback" : "Scheme Feedback"}</strong>
                      <span className="small text-secondary">{f.date}</span>
                    </div>
                    <p style={{ margin: "5px 0" }} className="small text-secondary">{f.comment || `Rating: ${f.rating || f.helpfulness}`}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: Saved Schemes */}
          {activeHistoryTab === "saved" && (
            <div className="animate-fade-in text-left" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {savedSchemes.map(s => (
                <div key={s.id} className="card p-3 bg-white border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{s.name}</strong>
                    <div className="small text-secondary">{s.benefits}</div>
                  </div>
                  <button type="button" className="text-btn text-primary" style={{ fontSize: "12px" }} onClick={() => setPage("schemes")}>View Scheme &rarr;</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DemoNote>Citizen details sync with active remote Supabase database profiles.</DemoNote>
    </div>
  );
}
