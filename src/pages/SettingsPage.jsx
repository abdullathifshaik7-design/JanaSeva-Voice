import React from "react";
import { useApp } from "../context/AppContext";
import { authService } from "../services/authService";
import { LANGUAGES_REGISTRY } from "../data/translations";
import { 
  Globe, Volume2, Type, Accessibility, Bell, Navigation, ShieldCheck, 
  HelpCircle, LogOut, CheckCircle, Smartphone 
} from "lucide-react";
import DemoNote from "../components/DemoNote";

export default function SettingsPage() {
  const {
    t,
    language,
    setLanguage,
    largeText,
    setLargeText,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    largeButtons,
    setLargeButtons,
    seniorMode,
    setSeniorMode,
    voiceNotifications,
    setVoiceNotifications,
    pushNotifications,
    setPushNotifications,
    selectedState,
    user,
    setUser,
    setIsGuest,
    setPage
  } = useApp();

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setIsGuest(false);
    setPage("home");
  };

  const handleRequestGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => alert("Location permission granted!"),
        () => alert("Location permission was denied. Please adjust your browser settings.")
      );
    }
  };

  return (
    <div dir={language === "ur" ? "rtl" : "ltr"} className="text-left">
      <div className="page-title">
        <h1>⚙️ {t("settings") || "Settings"}</h1>
        <p>Configure accessibility options, voice helper speeds, and active languages.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* 1. Language switcher grid */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <Globe className="text-primary" size={20} />
            <span>Select System Language</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
            {LANGUAGES_REGISTRY.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className="secondary-btn"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  borderColor: language === lang.code ? "#0ea5e9" : "#cbd5e1",
                  background: language === lang.code ? "#f0f9ff" : "#ffffff",
                  color: language === lang.code ? "#0369a1" : "#1e293b",
                  fontWeight: "700",
                  fontSize: "13px"
                }}
                onClick={() => setLanguage(lang.code)}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Voice Settings */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <Volume2 className="text-primary" size={20} />
            <span>Voice Controls</span>
          </h3>
          <label className="toggle-row">
            <span>
              <b>Voice Assistive TTS</b>
              <div className="lang-en text-secondary small">Read out schemes and status details aloud automatically.</div>
            </span>
            <input 
              type="checkbox" 
              checked={voiceNotifications} 
              onChange={(e) => setVoiceNotifications(e.target.checked)} 
            />
          </label>
        </div>

        {/* 3. Text Size & Senior Citizen Mode */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <Accessibility className="text-primary" size={20} />
            <span>Accessibility Preferences</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label className="toggle-row">
              <span>
                <b>👵 Senior Citizen Mode</b>
                <div className="lang-en text-secondary small">Activates simplified layouts and high visibility button pads.</div>
              </span>
              <input 
                type="checkbox" 
                checked={seniorMode} 
                onChange={(e) => setSeniorMode(e.target.checked)} 
              />
            </label>

            <label className="toggle-row">
              <span>
                <b>Larger Text Layout</b>
                <div className="lang-en text-secondary small">Increases font scales across the app.</div>
              </span>
              <input 
                type="checkbox" 
                checked={largeText} 
                onChange={(e) => setLargeText(e.target.checked)} 
              />
            </label>

            <label className="toggle-row">
              <span>
                <b>High Contrast Visuals</b>
                <div className="lang-en text-secondary small">Improves readabilities for low-vision citizens.</div>
              </span>
              <input 
                type="checkbox" 
                checked={highContrast} 
                onChange={(e) => setHighContrast(e.target.checked)} 
              />
            </label>

            <label className="toggle-row">
              <span>
                <b>Simplified Buttons</b>
                <div className="lang-en text-secondary small">Use touch targets suited for elder profiles.</div>
              </span>
              <input 
                type="checkbox" 
                checked={largeButtons} 
                onChange={(e) => setLargeButtons(e.target.checked)} 
              />
            </label>
          </div>
        </div>

        {/* 4. Notifications */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <Bell className="text-primary" size={20} />
            <span>Broadcast Alerts & Push Notifications</span>
          </h3>
          <label className="toggle-row">
            <span>
              <b>System Updates & Subscriptions</b>
              <div className="lang-en text-secondary small">Receive notifications regarding recently launched state schemes.</div>
            </span>
            <input 
              type="checkbox" 
              checked={pushNotifications} 
              onChange={(e) => setPushNotifications(e.target.checked)} 
            />
          </label>
        </div>

        {/* 5. Geolocation / Location Permission */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <Navigation className="text-primary" size={20} />
            <span>Browser Geolocation Permissions</span>
          </h3>
          <p className="small text-secondary mb-3">Authorize location coordinate access to calculate distances to nearby desks.</p>
          <button type="button" className="secondary-btn" onClick={handleRequestGps}>
            Check / Authorize GPS Permission
          </button>
        </div>

        {/* 6. Privacy & Security */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <ShieldCheck className="text-primary" size={20} />
            <span>Security Configurations</span>
          </h3>
          <div className="demo-note success-note" style={{ display: "flex", gap: "8px", alignItems: "center", background: "#f0fdf4", color: "#166534" }}>
            <ShieldCheck size={16} />
            <span>Secure connection bridged via Supabase RLS policies.</span>
          </div>
        </div>

        {/* 7. Help contact & Support */}
        <div className="card">
          <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "15px" }}>
            <HelpCircle className="text-primary" size={20} />
            <span>Help & Official Support Lines</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className="small">
            <div>📞 <b>Senior Helpline:</b> 14567</div>
            <div>✉️ <b>Support Email:</b> support@janasevavoice.gov.in</div>
            <div>🏢 <b>Panchayat Block Office:</b> Contact local Municipal Desk</div>
          </div>
        </div>

        {/* 8. Logout option */}
        {user && (
          <button 
            type="button" 
            className="secondary-btn w-full p-3" 
            style={{ color: "#ef4444", borderColor: "#fca5a5", fontSize: "16px", fontWeight: "700" }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout from Citizen Session
          </button>
        )}
      </div>
      <DemoNote>System changes will reload locally and reflect immediately on your active citizen dashboard.</DemoNote>
    </div>
  );
}
