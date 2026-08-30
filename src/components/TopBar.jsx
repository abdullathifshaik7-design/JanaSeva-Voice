import { Accessibility, Bell, Globe2, LogIn, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function TopBar() {
  const {
    page,
    setPage,
    setAccessOpen,
    notificationOpen,
    setNotificationOpen,
    setLanguageOpen,
    isAdminLoggedIn,
    setAdminLoggedIn,
    t
  } = useApp();

  const handleAdminToggle = () => {
    if (isAdminLoggedIn) {
      setAdminLoggedIn(false);
      setPage("home");
      alert("Admin logged out.");
    } else {
      // Demo authentication flow
      const user = prompt("Enter Admin Username:", "admin");
      const pass = prompt("Enter Admin Password:", "admin123");
      if (user === "admin" && pass === "admin123") {
        setAdminLoggedIn(true);
        setPage("admin");
        alert("Logged in as Admin. Admin Console is now unlocked in navigation!");
      } else {
        alert("Incorrect credentials! Use admin / admin123");
      }
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-title">{t(page)}</div>
      <div className="top-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setAccessOpen(true)}
          aria-label="Open accessibility settings"
          title="Accessibility"
        >
          <Accessibility size={18} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setNotificationOpen(!notificationOpen)}
          aria-label="Toggle notifications"
          title="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setLanguageOpen(true)}
          aria-label="Change language"
          title="Language"
        >
          <Globe2 size={18} />
        </button>
        
        <button 
          type="button" 
          className={`icon-btn admin-quick-lock ${isAdminLoggedIn ? 'active' : ''}`}
          onClick={handleAdminToggle}
          title={isAdminLoggedIn ? "Logout Admin" : "Demo Admin Login"}
          style={{ display: "flex", gap: "6px", fontSize: "12px", padding: "6px 10px", borderRadius: "12px" }}
        >
          {isAdminLoggedIn ? (
            <>
              <LogOut size={16} className="text-danger" />
              <span className="text-danger">Logout</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Admin Login</span>
            </>
          )}
        </button>

        <div className="profile">
          <div className="avatar" aria-hidden="true">{isAdminLoggedIn ? "A" : "C"}</div>
          <span className="profile-name">{isAdminLoggedIn ? "Admin" : "Citizen"}</span>
        </div>
      </div>
    </header>
  );
}
