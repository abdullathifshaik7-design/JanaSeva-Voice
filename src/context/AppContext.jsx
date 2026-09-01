import { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS } from "../data/translations";
import { SCHEMES as INITIAL_SCHEMES, GOVERNMENT_SERVICES as INITIAL_SERVICES, MOCK_APPLICATIONS as INITIAL_APPLICATIONS } from "../data/db";
import { supabaseService } from "../services/supabaseService";
import { authService } from "../services/authService";
import { getTranslatedDbText } from "../data/dbTranslations";

const AppContext = createContext(null);

const INITIAL_FEEDBACKS = [
  { id: "fb-1", type: "app", rating: 5, comment: "Excellent voice guide! Easy for my grandmother to check old age pension.", date: "26 Aug 2026" }
];

const INITIAL_COMPLAINTS = [
  {
    id: "JSV-2026-00124",
    name: "Ramesh Kumar",
    mobile: "9876543210",
    state: "Andhra Pradesh",
    category: "Public Infrastructure",
    description: "మా గ్రామంలో street lights పని చేయడం లేదు. వీధి దీపాలు వెలగడం లేదు.",
    preferredLanguage: "te",
    status: "In Progress",
    date: "25 Aug 2026",
    timeline: [
      { title: "Complaint Submitted", done: true, current: false, date: "25 Aug 2026" },
      { title: "Request Acknowledged", done: true, current: false, date: "25 Aug 2026" },
      { title: "Assigned to Local Panchayat Office", done: true, current: true, date: "26 Aug 2026" },
      { title: "Resolution", done: false, current: false, date: "Pending" }
    ]
  }
];

export function AppProvider({ children }) {
  const [page, setPage] = useState("home");
  const [voiceTab, setVoiceTab] = useState("assistant");
  const [activeScheme, setActiveScheme] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isGuest, setIsGuestState] = useState(false);

  useEffect(() => {
    // Determine session on initial mount without flash of dashboard
    try {
      const saved = localStorage.getItem("janaseva_user");
      if (saved) {
        setUserState(JSON.parse(saved));
      } else {
        setUserState(null);
      }
      localStorage.removeItem("janaseva_is_guest");
    } catch (e) {
      setUserState(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const setUser = (val) => {
    setUserState(val);
    try {
      if (val) {
        localStorage.setItem("janaseva_user", JSON.stringify(val));
      } else {
        localStorage.removeItem("janaseva_user");
      }
    } catch (e) {}
  };

  const setIsGuest = (val) => {
    setIsGuestState(val);
  };

  const logout = async () => {
    try {
      await authService.signOut();
    } catch (e) {}
    setUserState(null);
    setIsGuestState(false);
    try {
      localStorage.removeItem("janaseva_user");
      localStorage.removeItem("janaseva_is_guest");
    } catch (e) {}
    setPage("login");
  };

  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("janaseva_language") || "en";
    } catch (e) {
      return "en";
    }
  });
  const [selectedState, setSelectedState] = useState(() => {
    try {
      return localStorage.getItem("janaseva_selected_state") || "Andhra Pradesh";
    } catch (e) {
      return "Andhra Pradesh";
    }
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  
  // Accessibility states
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [largeButtons, setLargeButtons] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);
  
  const [voiceNotifications, setVoiceNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const [userProfile, setUserProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_user_profile");
      return saved ? JSON.parse(saved) : { state: "Andhra Pradesh", district: "", ageGroup: "Adult (26-59)", profession: "Farmer", incomeCategory: "BPL" };
    } catch (e) {
      return { state: "Andhra Pradesh", district: "", ageGroup: "Adult (26-59)", profession: "Farmer", incomeCategory: "BPL" };
    }
  });

  const setUserProfile = (val) => {
    setUserProfileState(val);
    try {
      localStorage.setItem("janaseva_user_profile", JSON.stringify(val));
    } catch (e) {}
    if (user) {
      supabaseService.saveProfile(user.id, val);
    }
  };

  // Admin and Database states (persisted via localStorage with try-catch fallbacks)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("janaseva_admin_logged") === "true";
    } catch (e) {
      return false;
    }
  });

  const [schemes, setSchemesState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_schemes");
      return saved ? JSON.parse(saved) : INITIAL_SCHEMES;
    } catch (e) {
      return INITIAL_SCHEMES;
    }
  });

  const [services, setServicesState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_services");
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch (e) {
      return INITIAL_SERVICES;
    }
  });

  const [applications, setApplicationsState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_applications");
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch (e) {
      return INITIAL_APPLICATIONS;
    }
  });

  const [feedbacks, setFeedbacksState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_feedbacks");
      return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
    } catch (e) {
      return INITIAL_FEEDBACKS;
    }
  });

  const [complaints, setComplaintsState] = useState(() => {
    try {
      const saved = localStorage.getItem("janaseva_complaints");
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch (e) {
      return INITIAL_COMPLAINTS;
    }
  });

  // Fetch remote database on startup and perform seeding if empty
  useEffect(() => {
    async function initDb() {
      console.log("DB SYNC: Checking Supabase connection...");
      await supabaseService.checkAndSeed();

      const dbSchemes = await supabaseService.fetchSchemes();
      if (dbSchemes) {
        console.log("DB SYNC: Schemes synced from Supabase.");
        setSchemesState(dbSchemes);
        try { localStorage.setItem("janaseva_schemes", JSON.stringify(dbSchemes)); } catch(e) {}
      }

      const dbServices = await supabaseService.fetchServices();
      if (dbServices) {
        console.log("DB SYNC: Services synced from Supabase.");
        setServicesState(dbServices);
        try { localStorage.setItem("janaseva_services", JSON.stringify(dbServices)); } catch(e) {}
      }

      const dbComplaints = await supabaseService.fetchComplaints();
      if (dbComplaints) {
        console.log("DB SYNC: Complaints synced from Supabase.");
        setComplaintsState(dbComplaints);
        try { localStorage.setItem("janaseva_complaints", JSON.stringify(dbComplaints)); } catch(e) {}
      }

      const dbFeedbacks = await supabaseService.fetchFeedbacks();
      if (dbFeedbacks) {
        console.log("DB SYNC: Feedbacks synced from Supabase.");
        setFeedbacksState(dbFeedbacks);
        try { localStorage.setItem("janaseva_feedbacks", JSON.stringify(dbFeedbacks)); } catch(e) {}
      }

      const dbApps = await supabaseService.fetchApplications();
      if (dbApps) {
        console.log("DB SYNC: Applications synced from Supabase.");
        setApplicationsState(dbApps);
        try { localStorage.setItem("janaseva_applications", JSON.stringify(dbApps)); } catch(e) {}
      }

      if (user) {
        const dbProfile = await supabaseService.fetchProfile(user.id);
        if (dbProfile) {
          console.log("DB SYNC: User profile synced from Supabase.");
          setUserProfileState(dbProfile);
          try { localStorage.setItem("janaseva_user_profile", JSON.stringify(dbProfile)); } catch(e) {}
        }
      }
    }
    initDb();
  }, [user]);

  // State synchronization helper
  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("janaseva_language", newLang);
    } catch (e) {}
  };

  const persistSelectedState = (newState) => {
    setSelectedState(newState);
    try {
      localStorage.setItem("janaseva_selected_state", newState);
    } catch (e) {}
  };

  const setAdminLoggedIn = (status) => {
    setIsAdminLoggedIn(status);
    try {
      localStorage.setItem("janaseva_admin_logged", status ? "true" : "false");
    } catch (e) {}
  };

  const setSchemes = (updated) => {
    const deleted = schemes.filter(s => !updated.some(u => u.id === s.id));
    setSchemesState(updated);
    try {
      localStorage.setItem("janaseva_schemes", JSON.stringify(updated));
    } catch (e) {}
    
    // Sync with remote database asynchronously
    for (const item of updated) {
      supabaseService.saveScheme(item);
    }
    for (const item of deleted) {
      supabaseService.deleteScheme(item.id);
    }
  };

  const setServices = (updated) => {
    const deleted = services.filter(s => !updated.some(u => u.id === s.id));
    setServicesState(updated);
    try {
      localStorage.setItem("janaseva_services", JSON.stringify(updated));
    } catch (e) {}

    for (const item of updated) {
      supabaseService.saveService(item);
    }
    for (const item of deleted) {
      supabaseService.deleteService(item.id);
    }
  };

  const setApplications = (updated) => {
    setApplicationsState(updated);
    try {
      localStorage.setItem("janaseva_applications", JSON.stringify(updated));
    } catch (e) {}
  };

  const setFeedbacks = (updated) => {
    setFeedbacksState(updated);
    try {
      localStorage.setItem("janaseva_feedbacks", JSON.stringify(updated));
    } catch (e) {}
  };

  const setComplaints = (updated) => {
    setComplaintsState(updated);
    try {
      localStorage.setItem("janaseva_complaints", JSON.stringify(updated));
    } catch (e) {}

    for (const item of updated) {
      supabaseService.saveComplaint(item);
    }
  };

  const addApplication = (newApp) => {
    const updated = [newApp, ...applications];
    setApplicationsState(updated);
    try {
      localStorage.setItem("janaseva_applications", JSON.stringify(updated));
    } catch (e) {}
    supabaseService.saveApplication(newApp);
  };

  const addFeedback = (newFeedback) => {
    const freshFeedback = {
      id: `fb-${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      ...newFeedback
    };
    const updated = [freshFeedback, ...feedbacks];
    setFeedbacksState(updated);
    try {
      localStorage.setItem("janaseva_feedbacks", JSON.stringify(updated));
    } catch (e) {}
    supabaseService.saveFeedback(freshFeedback);
  };

  const addComplaint = (newComplaint) => {
    const freshComplaint = {
      id: `JSV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      ...newComplaint
    };
    const updated = [freshComplaint, ...complaints];
    setComplaintsState(updated);
    try {
      localStorage.setItem("janaseva_complaints", JSON.stringify(updated));
    } catch (e) {}
    supabaseService.saveComplaint(freshComplaint);
  };

  // Global Translation helper
  const t = (key) => {
    const langSet = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langSet[key] || TRANSLATIONS.en[key] || key;
  };

  const t_db = (itemId, fieldName, defaultValue) => {
    return getTranslatedDbText(itemId, fieldName, defaultValue, language);
  };

  // Sync Senior Citizen Mode with large font & button flags
  useEffect(() => {
    if (seniorMode) {
      setLargeText(true);
      setLargeButtons(true);
    } else {
      setLargeText(false);
      setLargeButtons(false);
    }
  }, [seniorMode]);

  useEffect(() => {
    try {
      document.documentElement.style.fontSize = largeText ? "19px" : "";
      document.documentElement.classList.toggle("high-contrast", highContrast);
      document.documentElement.classList.toggle("reduce-motion", reduceMotion);
      document.documentElement.classList.toggle("large-buttons", largeButtons);
      document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
    } catch (e) {}
  }, [largeText, highContrast, reduceMotion, largeButtons, language]);

  const value = {
    page,
    setPage,
    voiceTab,
    setVoiceTab,
    activeScheme,
    setActiveScheme,
    user,
    setUser,
    isGuest,
    setIsGuest,
    isAuthLoading,
    logout,
    userProfile,
    setUserProfile,
    language,
    setLanguage,
    selectedState,
    setSelectedState: persistSelectedState,
    categoryFilter,
    setCategoryFilter,
    languageOpen,
    setLanguageOpen,
    notificationOpen,
    setNotificationOpen,
    accessOpen,
    setAccessOpen,
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
    
    // DB & Persistences
    schemes,
    setSchemes,
    services,
    setServices,
    applications,
    addApplication,
    feedbacks,
    addFeedback,
    complaints,
    addComplaint,
    setComplaints,
    
    // Admin state
    isAdminLoggedIn,
    setAdminLoggedIn,

    // translation helper
    t,
    t_db,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
