import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import BottomNavigation from "./components/BottomNavigation";
import LanguageSelector from "./components/LanguageSelector";
import AccessibilityModal from "./components/AccessibilityModal";
import NotificationPanel from "./components/NotificationPanel";
import HomePage from "./pages/HomePage";
import VoicePage from "./pages/VoicePage";
import SchemesPage from "./pages/SchemesPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import StatusPage from "./pages/StatusPage";
import UpdatesPage from "./pages/UpdatesPage";
import ProfilePage from "./pages/ProfilePage";
import CertificatesPage from "./pages/CertificatesPage";
import FarmerServicesPage from "./pages/FarmerServicesPage";
import CitizenBenefitsPage from "./pages/CitizenBenefitsPage";
import NearbyHelpPage from "./pages/NearbyHelpPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import DocumentsPage from "./pages/DocumentsPage";
import SettingsPage from "./pages/SettingsPage";
import Logo from "./components/Logo";

function AppContent() {
  const {
    page,
    setPage,
    language,
    setLanguage,
    languageOpen,
    setLanguageOpen,
    notificationOpen,
    setNotificationOpen,
    accessOpen,
    setAccessOpen,
    user,
    isAuthLoading
  } = useApp();

  // 1. Initial auth state loading screen — prevents flash of protected dashboard
  if (isAuthLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "14px", background: "#f8fafc" }}>
        <Logo size={70} showText={false} />
        <div style={{ color: "#0ea5e9", fontWeight: "900", fontSize: "22px", letterSpacing: "1px" }}>
          JANASEVA VOICE
        </div>
        <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
          Checking authentication session...
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Wall: Unauthenticated users MUST login or register first
  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage />;
      case "voice":
        return <VoicePage />;
      case "schemes":
        return <SchemesPage />;
      case "complaints":
        return <ComplaintsPage />;
      case "status":
        return <StatusPage />;
      case "updates":
        return <UpdatesPage />;
      case "profile":
        return <ProfilePage />;
      case "documents":
        return <DocumentsPage />;
      case "settings":
        return <SettingsPage />;
      case "certificates":
        return <CertificatesPage />;
      case "farmer":
        return <FarmerServicesPage />;
      case "benefits":
        return <CitizenBenefitsPage />;
      case "help":
        return <NearbyHelpPage />;
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  const showNavShell = Boolean(user);

  return (
    <div className="app-shell">
      {showNavShell && <Sidebar />}
      <main className="main">
        {showNavShell && <TopBar />}
        <div className="content">{renderPage()}</div>
      </main>
      {showNavShell && <BottomNavigation />}

      {languageOpen && (
        <LanguageSelector
          language={language}
          setLanguage={setLanguage}
          onClose={() => setLanguageOpen(false)}
        />
      )}
      {notificationOpen && (
        <NotificationPanel onClose={() => setNotificationOpen(false)} />
      )}
      {accessOpen && (
        <AccessibilityModal onClose={() => setAccessOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
