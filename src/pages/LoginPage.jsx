import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";
import { STATES } from "../data/db";
import { LANGUAGES_REGISTRY } from "../data/translations";
import Logo from "../components/Logo";
import DemoNote from "../components/DemoNote";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, Globe, Lock } from "lucide-react";

export default function LoginPage() {
  const { t, setPage, user, setUser, isGuest, setIsGuest, setUserProfile } = useApp();

  // Screen view: 'welcome', 'login', 'register'
  const [screen, setScreen] = useState("welcome");
  const [activeTab, setActiveTab] = useState("phone"); // 'phone' or 'email'
  
  // Registration Form States
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("password123"); // default simple pass
  const [regState, setRegState] = useState("Andhra Pradesh");
  const [regDistrict, setRegDistrict] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regOccupation, setRegOccupation] = useState("Farmer");
  const [regLang, setRegLang] = useState("en");
  const [regAddress, setRegAddress] = useState("");

  // Login Form States
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestMode = () => {
    setIsGuest(true);
    setUser(null);
    setPage("home");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!loginPhone) {
      setErrorMsg(t("enterValidPhone") || "Please enter a valid mobile number.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const { error } = await authService.sendOtp(loginPhone);
      if (error) throw error;
      setOtpSent(true);
      setSuccessMsg(t("otpSentMsg") || "OTP code sent successfully (Use '123456' for local mock bypass).");
    } catch (err) {
      setErrorMsg(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!loginOtp) {
      setErrorMsg(t("enterOtp") || "Please enter the OTP token.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const { data, error } = await authService.verifyOtp(loginPhone, loginOtp);
      if (error) throw error;
      
      setUser(data.user);
      setIsGuest(false);
      
      // Seed default profile for OTP user if none exists
      setUserProfile({
        fullName: data.user.user_metadata?.fullName || "Citizen User",
        mobileNumber: loginPhone,
        email: data.user.email || "",
        state: data.user.user_metadata?.state || "Andhra Pradesh",
        district: data.user.user_metadata?.district || "Guntur",
        age: data.user.user_metadata?.age || "35",
        profession: data.user.user_metadata?.profession || "Farmer",
        preferredLanguage: data.user.user_metadata?.preferredLanguage || "en",
        address: data.user.user_metadata?.address || ""
      });

      setPage("home");
    } catch (err) {
      setErrorMsg(err.message || "Invalid OTP code entered.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg(t("emailPassRequired") || "Email and Password are required fields.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);
    try {
      const { data, error } = await authService.signIn(loginEmail, loginPassword);
      if (error) throw error;
      
      setUser(data.user);
      setIsGuest(false);
      
      // Pull profile details from meta or default
      setUserProfile({
        fullName: data.user.user_metadata?.fullName || "Citizen User",
        mobileNumber: data.user.user_metadata?.mobileNumber || "",
        email: loginEmail,
        state: data.user.user_metadata?.state || "Andhra Pradesh",
        district: data.user.user_metadata?.district || "Guntur",
        age: data.user.user_metadata?.age || "30",
        profession: data.user.user_metadata?.profession || "Farmer",
        preferredLanguage: data.user.user_metadata?.preferredLanguage || "en",
        address: data.user.user_metadata?.address || ""
      });

      setPage("home");
    } catch (err) {
      setErrorMsg(err.message || "Login failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regFullName || !regPhone || !regState || !regDistrict || !regAge) {
      setErrorMsg(t("requiredFieldsMissing") || "Please fill in all required fields.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    // Use phone as email proxy for Supabase signup fallback to maintain OTP preference
    const emailMock = regEmail.trim() || `${regPhone}@janaseva.gov.in`;

    try {
      // 1. Sign up user
      const { data, error } = await authService.signUp(emailMock, regPassword, regPhone);
      if (error) throw error;

      // 2. Automatically log in the registered user
      const loginRes = await authService.signIn(emailMock, regPassword);
      if (loginRes.error) throw loginRes.error;

      // 3. Set Profile in App State & Supabase
      const newProfile = {
        fullName: regFullName,
        mobileNumber: regPhone,
        email: regEmail,
        state: regState,
        district: regDistrict,
        age: regAge,
        profession: regOccupation,
        preferredLanguage: regLang,
        address: regAddress
      };

      setUserProfile(newProfile);
      setUser(loginRes.data.user);
      setIsGuest(false);
      setSuccessMsg(t("registrationSuccess") || "Account created successfully! Redirecting...");
      
      setTimeout(() => {
        setPage("home");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="admin-login-layout text-center" style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card admin-login-card mx-auto" style={{ maxWidth: screen === "register" ? "650px" : "480px", width: "100%", padding: "30px", margin: "20px 0" }}>
        
        {/* FIRST SCREEN: WELCOME */}
        {screen === "welcome" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
              <Logo size={90} showText={false} />
            </div>
            
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0ea5e9", margin: "10px 0 2px 0", letterSpacing: "1px" }}>
              JANASEVA VOICE
            </h1>
            
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", margin: "0 0 15px 0", letterSpacing: "0.5px" }}>
              "Your Voice. Your Seva. Your Right."
            </div>

            <p className="card-sub" style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "30px" }}>
              {t("welcomeJanaSevaDesc") || "Access government schemes and services through your voice."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button 
                type="button" 
                className="primary w-full" 
                style={{ padding: "14px", fontSize: "16px", fontWeight: "700" }}
                onClick={() => { setScreen("login"); resetMessages(); }}
              >
                🔐 {t("loginBtn") || "Login"}
              </button>

              <button 
                type="button" 
                className="secondary-btn w-full" 
                style={{ padding: "14px", fontSize: "16px", fontWeight: "700", borderColor: "#cbd5e1" }}
                onClick={() => { setScreen("register"); resetMessages(); }}
              >
                📝 {t("registerBtn") || "Create Account"}
              </button>

              <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "15px", paddingTop: "15px" }}>
                <button
                  type="button"
                  className="secondary-btn w-full"
                  style={{ padding: "14px", background: "#f8fafc", borderColor: "#cbd5e1", fontSize: "15px", color: "#475569" }}
                  onClick={handleGuestMode}
                >
                  👥 {t("guestBtn") || "Continue as Guest"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECOND SCREEN: LOGIN */}
        {screen === "login" && (
          <div className="animate-fade-in text-left">
            <button 
              type="button" 
              className="text-btn text-secondary mb-3" 
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "0" }}
              onClick={() => { setScreen("welcome"); resetMessages(); }}
            >
              <ArrowLeft size={16} /> {t("back") || "Back"}
            </button>

            <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Logo size={40} />
              <h2 style={{ fontSize: "20px", margin: "0" }}>{t("loginTitle") || "Login to Account"}</h2>
            </div>

            {errorMsg && <div className="demo-note error-note mb-3">{errorMsg}</div>}
            {successMsg && <div className="demo-note success-note mb-3" style={{ color: "#166534", background: "#f0fdf4" }}>{successMsg}</div>}

            {/* Tab Controls */}
            <div style={{ display: "flex", gap: "8px", margin: "15px 0", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
              <button
                type="button"
                className="text-btn"
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  background: activeTab === "phone" ? "#ffffff" : "transparent",
                  color: activeTab === "phone" ? "#0ea5e9" : "#64748b",
                  fontWeight: "700"
                }}
                onClick={() => { setActiveTab("phone"); resetMessages(); }}
              >
                📱 {t("phoneLabel") || "Mobile OTP"}
              </button>
              <button
                type="button"
                className="text-btn"
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  background: activeTab === "email" ? "#ffffff" : "transparent",
                  color: activeTab === "email" ? "#0ea5e9" : "#64748b",
                  fontWeight: "700"
                }}
                onClick={() => { setActiveTab("email"); resetMessages(); }}
              >
                ✉️ {t("emailLabel") || "Email / Password"}
              </button>
            </div>

            {/* OTP form */}
            {activeTab === "phone" && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="admin-form">
                    <div>
                      <label>{t("phoneLabel") || "Mobile Number"}</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="primary w-full mt-4 py-3" disabled={isLoading}>
                      {isLoading ? (t("sending") || "Sending...") : (t("sendOtpBtn") || "Send Verification OTP")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="admin-form">
                    <div>
                      <label>{t("otpLabel") || "Enter 6-digit OTP code"}</label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="primary w-full mt-4 py-3" disabled={isLoading}>
                      {isLoading ? (t("verifying") || "Verifying...") : (t("loginBtn") || "Login")}
                    </button>
                    <button 
                      type="button" 
                      className="text-btn text-primary mt-2 w-full text-center" 
                      style={{ fontSize: "13px" }}
                      onClick={() => setOtpSent(false)}
                    >
                      {t("changeMobile") || "Change Mobile Number"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Email form */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailLogin} className="admin-form">
                <div>
                  <label>{t("emailLabel") || "Email Address"}</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mt-2">
                  <label>{t("password") || "Password"}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="primary w-full mt-4 py-3" disabled={isLoading}>
                  {isLoading ? (t("processing") || "Logging in...") : (t("loginBtn") || "Login")}
                </button>
              </form>
            )}
          </div>
        )}

        {/* THIRD SCREEN: REGISTRATION */}
        {screen === "register" && (
          <div className="animate-fade-in text-left">
            <button 
              type="button" 
              className="text-btn text-secondary mb-3" 
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "0" }}
              onClick={() => { setScreen("welcome"); resetMessages(); }}
            >
              <ArrowLeft size={16} /> {t("back") || "Back"}
            </button>

            <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Logo size={40} />
              <h2 style={{ fontSize: "20px", margin: "0" }}>{t("registerBtn") || "Create New Account"}</h2>
            </div>

            {errorMsg && <div className="demo-note error-note mb-3">{errorMsg}</div>}
            {successMsg && <div className="demo-note success-note mb-3" style={{ color: "#166534", background: "#f0fdf4" }}>{successMsg}</div>}

            <form onSubmit={handleRegister} className="admin-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              
              {/* Left Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <User size={14} className="text-secondary" /> {t("fullNameLabel") || "Full Name"} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <Phone size={14} className="text-secondary" /> {t("phoneLabel") || "Mobile Number"} *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <Mail size={14} className="text-secondary" /> {t("emailLabel") || "Email Address (Optional)"}
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <Lock size={14} className="text-secondary" /> {t("password") || "Password"} *
                  </label>
                  <input
                    type="password"
                    placeholder="Password for email fallback"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <MapPin size={14} className="text-secondary" /> {t("state") || "State"} *
                  </label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    {STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <MapPin size={14} className="text-secondary" /> {t("district") || "District"} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guntur"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <Calendar size={14} className="text-secondary" /> {t("age") || "Age"} *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <Globe size={14} className="text-secondary" /> {t("language") || "Language"} *
                    </label>
                    <select
                      value={regLang}
                      onChange={(e) => setRegLang(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", height: "42px" }}
                    >
                      {LANGUAGES_REGISTRY.map(l => (
                        <option key={l.code} value={l.code}>{l.native}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <Briefcase size={14} className="text-secondary" /> {t("occupation") || "Occupation"} *
                  </label>
                  <select
                    value={regOccupation}
                    onChange={(e) => setRegOccupation(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="Farmer">Farmer / Agriculture</option>
                    <option value="Student">Student / Scholar</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Worker">Labor / Worker</option>
                    <option value="Woman">Woman Entrepreneur</option>
                    <option value="Other">Other / Self Employed</option>
                  </select>
                </div>
              </div>

              {/* Full Width Row */}
              <div style={{ gridColumn: "span 2" }}>
                <div>
                  <label>{t("addressLabel") || "Residential Address (Optional)"}</label>
                  <textarea
                    placeholder="Door Number, Street, Village/Ward"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    rows={2}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontFamily: "inherit" }}
                  />
                </div>

                <button type="submit" className="primary w-full mt-4 py-3" style={{ fontSize: "16px", fontWeight: "700" }} disabled={isLoading}>
                  {isLoading ? (t("registering") || "Creating Account...") : (t("registerBtn") || "Create My Account")}
                </button>
              </div>
            </form>
          </div>
        )}

        <DemoNote>
          {t("authNote") || "Guest mode allows browsing, voice check, and helpline calls. Registering unlocks historical logs, customized recommendations, and grievance submissions."}
        </DemoNote>
      </div>
    </div>
  );
}
