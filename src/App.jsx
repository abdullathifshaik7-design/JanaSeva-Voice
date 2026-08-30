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
    isGuest
  } = useApp();

  const renderPage = () => {
    // Admin page bypasses citizen login
    if (page === "admin") {
      return <AdminPage />;
    }

    // Force login screen if neither logged in nor guest mode is chosen
    if (!user && !isGuest) {
      return <LoginPage />;
    }

    // Direct guest users trying to access protected paths to Login page
    const protectedPages = ["profile", "complaints", "status"];
    if (protectedPages.includes(page) && !user) {
      return <LoginPage />;
    }

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
      default:
        return <HomePage />;
    }
  };

  // Do not show Sidebar or Header on auth screen to keep UX clean
  const showNavShell = (user || isGuest || page === "admin");

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
