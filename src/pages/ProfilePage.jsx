import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { supabaseService } from "../services/supabaseService";
import { 
  User, Edit2, Check, Landmark, LogOut, FileText, MessageSquare, 
  MapPin, Phone, Mail, Award, BookOpen, Globe, Calendar, ShieldCheck, 
  Heart, AlertCircle, RefreshCw, CheckCircle, ArrowRight, DollarSign, Sparkles
} from "lucide-react";
import { STATES, SCHEMES } from "../data/db";
import DemoNote from "../components/DemoNote";

export default function ProfilePage() {
  const {
    t,
    language,
    user,
    setUser,
    userProfile,
    setUserProfile,
    applications = [],
    complaints = [],
    feedbacks = [],
    schemes = [],
    setPage,
    logout
  } = useApp();

  // Async & view states
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable Profile fields (safe null fallbacks, no fake citizen data)
  const [fullName, setFullName] = useState(userProfile?.fullName || userProfile?.name || "");
  const [mobileNumber, setMobileNumber] = useState(userProfile?.mobileNumber || userProfile?.phone || "");
  const [email, setEmail] = useState(userProfile?.email || user?.email || "");
  const [profileState, setProfileState] = useState(userProfile?.state || "Andhra Pradesh");
  const [district, setDistrict] = useState(userProfile?.district || "");
  const [age, setAge] = useState(userProfile?.age || userProfile?.ageGroup || "");
  const [occupation, setOccupation] = useState(userProfile?.profession || userProfile?.occupation || "Farmer");
  const [income, setIncome] = useState(userProfile?.income || userProfile?.incomeCategory || "");
  const [preferredLang, setPreferredLang] = useState(userProfile?.preferredLanguage || language || "en");
  const [address, setAddress] = useState(userProfile?.address || "");

  const [activeHistoryTab, setActiveHistoryTab] = useState("info"); // 'info', 'apps', 'complaints', 'docs', 'feedback', 'saved'

  // Determine whether a valid citizen profile exists
  const hasProfile = Boolean(
    userProfile && 
    (
      (userProfile.fullName && String(userProfile.fullName).trim().length > 0) ||
      (userProfile.name && String(userProfile.name).trim().length > 0) ||
      (userProfile.mobileNumber && String(userProfile.mobileNumber).trim().length > 0) ||
      (userProfile.profession && String(userProfile.profession).trim().length > 0)
    )
  );

  // Sync profile from Supabase on mount if user is logged in
  const loadProfile = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const remote = await supabaseService.fetchProfile(user.id);
      if (remote && (remote.fullName || remote.mobileNumber || remote.state || remote.profession)) {
        setUserProfile(remote);
      }
    } catch (err) {
      console.error("Error loading citizen profile:", err);
      setFetchError(err.message || "Failed to load profile from database. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only attempt remote sync if user is logged in and no profile in context yet
    if (user?.id && !hasProfile) {
      loadProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || userProfile.name || "");
      setMobileNumber(userProfile.mobileNumber || userProfile.phone || "");
      setEmail(userProfile.email || user?.email || "");
      setProfileState(userProfile.state || "Andhra Pradesh");
      setDistrict(userProfile.district || "");
      setAge(userProfile.age || userProfile.ageGroup || "");
      setOccupation(userProfile.profession || userProfile.occupation || "Farmer");
      setIncome(userProfile.income || userProfile.incomeCategory || "");
      setPreferredLang(userProfile.preferredLanguage || language || "en");
      setAddress(userProfile.address || "");
    }
  }, [userProfile, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        state: profileState,
        district: district.trim(),
        age: age ? String(age).trim() : "",
        profession: occupation.trim(),
        income: income ? String(income).trim() : "",
        incomeCategory: income ? String(income).trim() : "",
        preferredLanguage: preferredLang || language || "en",
        address: address.trim()
      };

      setUserProfile(updated);
      if (user?.id) {
        await supabaseService.saveProfile(user.id, updated);
      }

      setIsEditing(false);
      setIsCreating(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Safe avatar initial (never throws TypeError on empty or undefined string)
  const avatarInitial = (fullName && fullName.trim().length > 0)
    ? fullName.trim()[0].toUpperCase()
    : (userProfile?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "C");

  // Filter histories safely with null guards
  const myApps = (applications || []).filter(app => Boolean(app));
  const myComplaints = (complaints || []).filter(c => Boolean(c));
  const myFeedbacks = (feedbacks || []).filter(f => Boolean(f));
  
  // Document scans list
  const myDocs = [
    { id: "doc-1", type: "Aadhaar Card", date: "29 Aug 2026", status: "Readable", icon: FileText },
    { id: "doc-2", type: "Income Certificate", date: "28 Aug 2026", status: "Readable", icon: FileText }
  ];

  // Dynamic bookmarked schemes
  const savedSchemes = (schemes && schemes.length > 0 ? schemes : SCHEMES).slice(0, 2);

  // Personalized scheme eligibility calculation
  const eligibleSchemes = useMemo(() => {
    if (!hasProfile) return [];
    const currentAge = parseInt(age || userProfile?.age || 0, 10);
    const currentOcc = (occupation || userProfile?.profession || "").toLowerCase();
    const currentState = profileState || userProfile?.state || "";

    const list = (schemes && schemes.length > 0 ? schemes : SCHEMES) || [];
    return list.map(scheme => {
      let matchScore = 0;
      let matchReason = "";
      const rules = scheme.eligibilityRules || {};

      // State check
      const stateMatch = scheme.state === "Central" || scheme.state === currentState;
      if (stateMatch) matchScore += 35;

      // Age check
      let ageMatch = true;
      if (rules.minAge && currentAge > 0) {
        if (currentAge >= rules.minAge) {
          matchScore += 35;
          matchReason = `Age ${currentAge} meets criteria (min ${rules.minAge} yrs)`;
        } else {
          ageMatch = false;
        }
      }

      // Occupation check
      const targetGroups = (scheme.targetGroups || []).map(g => String(g).toLowerCase());
      let occMatch = false;
      if (currentOcc) {
        if (currentOcc.includes("farmer") && (targetGroups.includes("farmers") || scheme.category === "Agriculture")) {
          matchScore += 35;
          matchReason = matchReason ? `${matchReason} • Farmer welfare eligibility` : "Eligible under farmer welfare";
          occMatch = true;
        } else if (currentOcc.includes("senior") && (targetGroups.includes("senior citizens") || currentAge >= 60)) {
          matchScore += 35;
          matchReason = matchReason ? `${matchReason} • Senior citizen pension` : "Eligible for senior citizen benefits";
          occMatch = true;
        } else if (currentOcc.includes("student") && (targetGroups.includes("students") || scheme.category === "Education")) {
          matchScore += 35;
          matchReason = matchReason ? `${matchReason} • Student scholarship` : "Eligible for student education assistance";
          occMatch = true;
        }
      }

      let status = "not_eligible";
      if (stateMatch && ageMatch && (occMatch || matchScore >= 60)) {
        status = "eligible";
      } else if (stateMatch && (ageMatch || matchScore >= 35)) {
        status = "possibly_eligible";
        if (!matchReason) matchReason = `State criteria met for ${currentState}`;
      }

      return {
        ...scheme,
        matchScore,
        matchStatus: status,
        matchReason: matchReason || scheme.description
      };
    })
    .filter(s => s.matchStatus !== "not_eligible")
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
  }, [hasProfile, age, occupation, profileState, userProfile, schemes]);

  // ==================== STATE 1: LOADING STATE ====================
  if (isLoading) {
    return (
      <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left animate-fade-in" style={{ padding: "20px 0" }}>
        <div className="page-title">
          <h1>👤 Citizen Profile</h1>
          <p>Manage your personal information, view scheme eligibility and track benefits.</p>
        </div>

        <div className="card text-center p-5" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{
            margin: "20px auto 16px",
            width: "48px",
            height: "48px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #0284c7",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite"
          }} />
          <h2 style={{ fontSize: "20px", color: "#0f172a", marginBottom: "8px" }}>Loading Citizen Profile...</h2>
          <p className="text-secondary" style={{ fontSize: "14px", color: "#64748b" }}>
            Retrieving your citizen records securely from the database...
          </p>
        </div>
      </div>
    );
  }

  // ==================== STATE 2: ERROR STATE ====================
  if (fetchError) {
    return (
      <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left animate-fade-in" style={{ padding: "20px 0" }}>
        <div className="page-title">
          <h1>👤 Citizen Profile</h1>
          <p>Manage your personal information, view scheme eligibility and track benefits.</p>
        </div>

        <div className="card text-center p-5" style={{ background: "#fff", borderRadius: "16px", borderLeft: "4px solid #ef4444", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "#fee2e2", marginBottom: "14px", color: "#dc2626" }}>
            <AlertCircle size={42} />
          </div>
          <h2 style={{ fontSize: "22px", color: "#0f172a", marginBottom: "8px" }}>Unable to Load Citizen Profile</h2>
          <p className="text-secondary mb-4" style={{ fontSize: "15px", color: "#64748b", maxWidth: "480px", margin: "0 auto 20px" }}>
            {fetchError}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
              onClick={loadProfile}
            >
              <RefreshCw size={16} /> Retry Connection
            </button>
            <button
              type="button"
              className="secondary-btn"
              style={{ padding: "10px 20px" }}
              onClick={() => { setFetchError(null); setIsCreating(true); }}
            >
              Create Profile Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== STATE 3: EMPTY STATE (NO PROFILE FOUND) ====================
  if (!hasProfile && !isCreating) {
    return (
      <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left animate-fade-in" style={{ padding: "20px 0" }}>
        <div className="page-title">
          <h1>👤 Citizen Profile</h1>
          <p>Manage your personal information, view scheme eligibility and track benefits.</p>
        </div>

        <div className="card text-center p-5" style={{ maxWidth: "620px", margin: "30px auto", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "inline-flex", padding: "20px", borderRadius: "50%", background: "#e0f2fe", marginBottom: "16px", color: "#0284c7" }}>
            <User size={52} />
          </div>
          <h2 style={{ fontSize: "24px", color: "#0f172a", marginBottom: "10px", fontWeight: "800" }}>
            No Citizen Profile Found
          </h2>
          <p className="text-secondary mb-4" style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.6", maxWidth: "440px", margin: "0 auto 24px" }}>
            Create your profile to get personalized scheme eligibility and services.
          </p>
          <button
            type="button"
            className="primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 32px",
              fontSize: "16px",
              fontWeight: "700",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)"
            }}
            onClick={() => setIsCreating(true)}
          >
            <User size={18} /> Create Profile
          </button>
        </div>
      </div>
    );
  }

  // ==================== STATE 4: CREATE PROFILE FORM ====================
  if (!hasProfile && isCreating) {
    return (
      <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left animate-fade-in" style={{ padding: "20px 0" }}>
        <div className="page-title">
          <h1>👤 Create Citizen Profile</h1>
          <p>Enter your verified information to activate automatic scheme eligibility.</p>
        </div>

        <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <User size={22} className="text-primary" />
            <h3 style={{ margin: 0, fontSize: "18px" }}>Enter Citizen Demographic Details</h3>
          </div>
          <p className="text-secondary small" style={{ marginBottom: "20px" }}>
            This data is used by JanaSeva AI to determine your eligibility for central and state welfare benefits.
          </p>
          <hr style={{ margin: "10px 0 20px", borderColor: "#f1f5f9" }} />

          <form onSubmit={handleSaveProfile} className="admin-form">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div>
                <label>Full Name *</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="e.g. Ramesh Reddy" 
                  required 
                />
              </div>

              <div>
                <label>Mobile Number *</label>
                <input 
                  type="text" 
                  value={mobileNumber} 
                  onChange={(e) => setMobileNumber(e.target.value)} 
                  placeholder="10-digit mobile number" 
                  required 
                />
              </div>

              <div>
                <label>Age (Years) *</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  placeholder="e.g. 62" 
                  min="5" 
                  max="115" 
                  required 
                />
              </div>

              <div>
                <label>Occupation / Profession *</label>
                <select value={occupation} onChange={(e) => setOccupation(e.target.value)} required>
                  <option value="Farmer">Farmer (రైతు / किसान)</option>
                  <option value="Senior Citizen">Senior Citizen (వృద్ధులు / वरिष्ठ नागरिक)</option>
                  <option value="Student">Student (విద్యార్థి / छात्र)</option>
                  <option value="Self Employed">Self Employed / Small Business</option>
                  <option value="Daily Wage Worker">Daily Wage Worker (కూలీ / मजदूर)</option>
                  <option value="Homemaker">Homemaker (గృహిణి / गृहिणी)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label>State *</label>
                <select value={profileState} onChange={(e) => setProfileState(e.target.value)} required>
                  {STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>District *</label>
                <input 
                  type="text" 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)} 
                  placeholder="e.g. Guntur" 
                  required 
                />
              </div>

              <div>
                <label>Annual Household Income (Optional)</label>
                <input 
                  type="text" 
                  value={income} 
                  onChange={(e) => setIncome(e.target.value)} 
                  placeholder="e.g. ₹1,20,000 or BPL" 
                />
              </div>

              <div>
                <label>Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="citizen@example.com" 
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label>Current Residential Address (Optional)</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Village / Town, Mandal, Door Number" 
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button 
                type="submit" 
                className="primary" 
                disabled={isSaving}
                style={{ padding: "12px 28px", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <Check size={18} /> {isSaving ? "Saving..." : "Save Citizen Profile"}
              </button>
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={() => setIsCreating(false)}
                style={{ padding: "12px 20px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==================== STATE 5: POPULATED PROFILE VIEW ====================
  return (
    <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left animate-fade-in">
      <div className="page-title">
        <h1>👤 Citizen Profile</h1>
        <p>Manage your verified personal details, review automated scheme eligibility and track benefits.</p>
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
              <div className="avatar large" style={{ background: "#0ea5e9", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", color: "white", fontSize: "26px", fontWeight: "800" }}>
                {avatarInitial}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>{fullName || "Citizen User"}</h2>
                <div className="text-secondary small" style={{ marginTop: "4px" }}>
                  <strong>{occupation}</strong> • State: <strong>{profileState}</strong> {district ? `(${district})` : ""}
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                type="button" 
                className="secondary-btn" 
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 size={15} /> {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>
              {user && (
                <button 
                  type="button" 
                  className="secondary-btn" 
                  style={{ color: "#ef4444", borderColor: "#fca5a5", display: "inline-flex", alignItems: "center", gap: "6px" }}
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Edit2 size={18} className="text-primary" />
              <h3 style={{ margin: 0 }}>Edit Profile Information</h3>
            </div>
            <hr style={{ margin: "10px 0 16px", borderColor: "#f1f5f9" }} />
            
            <form onSubmit={handleSaveProfile} className="admin-form">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                <div>
                  <label>Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label>Mobile Number *</label>
                  <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                </div>
                <div>
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label>State *</label>
                  <select value={profileState} onChange={(e) => setProfileState(e.target.value)} required>
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>District *</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                </div>
                <div>
                  <label>Age (Years) *</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="5" max="115" required />
                </div>
                <div>
                  <label>Occupation *</label>
                  <select value={occupation} onChange={(e) => setOccupation(e.target.value)} required>
                    <option value="Farmer">Farmer (రైతు / किसान)</option>
                    <option value="Senior Citizen">Senior Citizen (వృద్ధులు / वरिष्ठ नागरिक)</option>
                    <option value="Student">Student (విద్యార్థి / छात्र)</option>
                    <option value="Self Employed">Self Employed / Small Business</option>
                    <option value="Daily Wage Worker">Daily Wage Worker (కూలీ / मजदूर)</option>
                    <option value="Homemaker">Homemaker (గృహిణి / गृहिणी)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Annual Household Income</label>
                  <input type="text" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. ₹1,50,000" />
                </div>
                <div>
                  <label>Preferred Language</label>
                  <input type="text" value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button type="submit" className="primary" disabled={isSaving}>
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Personalized Scheme Eligibility Highlights */}
        {eligibleSchemes.length > 0 && (
          <div className="card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", border: "1px solid #bbf7d0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} className="text-success" />
                <h3 style={{ margin: 0, fontSize: "17px", color: "#166534" }}>Personalized Scheme Eligibility</h3>
              </div>
              <span className="badge" style={{ background: "#dcfce7", color: "#15803d", fontWeight: "700" }}>
                {eligibleSchemes.length} Matched Benefits
              </span>
            </div>
            <p className="text-secondary small" style={{ marginBottom: "14px" }}>
              Based on your age ({age || "N/A"} yrs), occupation ({occupation}), and state ({profileState}), you meet criteria for:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
              {eligibleSchemes.map(sch => (
                <div key={sch.id} style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <strong style={{ fontSize: "15px", color: "#0f172a" }}>{sch.name}</strong>
                    <span className="badge" style={{
                      background: sch.matchStatus === "eligible" ? "#dcfce7" : "#e0f2fe",
                      color: sch.matchStatus === "eligible" ? "#166534" : "#0369a1",
                      fontSize: "11px",
                      fontWeight: "700",
                      flexShrink: 0
                    }}>
                      {sch.matchStatus === "eligible" ? "● Eligible" : "● Likely Eligible"}
                    </span>
                  </div>
                  <div className="small text-secondary" style={{ margin: "6px 0 10px", fontSize: "12.5px" }}>
                    {sch.matchReason}
                  </div>
                  <button 
                    type="button" 
                    className="text-btn text-primary" 
                    style={{ fontSize: "12px", fontWeight: "700", padding: "0" }}
                    onClick={() => setPage("schemes")}
                  >
                    View Scheme Details &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab content navigator */}
        <div className="card">
          {/* History Sub Menu Tabs */}
          <div style={{ display: "flex", gap: "5px", background: "#f1f5f9", padding: "4px", borderRadius: "8px", overflowX: "auto", whiteSpace: "nowrap", marginBottom: "15px" }}>
            <button type="button" className="text-btn" style={{ background: activeHistoryTab === "info" ? "#ffffff" : "transparent", color: activeHistoryTab === "info" ? "#0ea5e9" : "#64748b", fontWeight: "700" }} onClick={() => setActiveHistoryTab("info")}>ℹ️ Personal Info</button>
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
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", fontSize: "14px" }}>
                <div><strong>Full Name:</strong> {fullName || "Not provided"}</div>
                <div><strong>Age:</strong> {age ? `${age} Years` : "Not provided"}</div>
                <div><strong>State:</strong> {profileState || "Not provided"}</div>
                <div><strong>District:</strong> {district || "Not provided"}</div>
                <div><strong>Occupation:</strong> {occupation || "Not provided"}</div>
                {Boolean(income) && <div><strong>Annual Income:</strong> {income}</div>}
                <div><strong>Mobile Number:</strong> {mobileNumber || "Not provided"}</div>
                <div><strong>Email Address:</strong> {email || "Not provided"}</div>
                <div><strong>Preferred Language:</strong> {preferredLang.toUpperCase()}</div>
                <div style={{ gridColumn: "span 2" }}><strong>Current Address:</strong> {address || "Not provided"}</div>
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
                      <strong>{c.category} - {(c.description || "").slice(0, 45)}...</strong>
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
