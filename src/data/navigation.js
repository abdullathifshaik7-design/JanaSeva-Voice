import {
  Home, Landmark, Bell, MapPin, FileText, MessageSquare, User, Settings
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "schemes", label: "Schemes", icon: Landmark },
  { id: "updates", label: "Notifications", icon: Bell },
  { id: "help", label: "Find Nearby", icon: MapPin },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "complaints", label: "Report a Problem", icon: MessageSquare },
  { id: "profile", label: "My Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings }
];

export const MOBILE_NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "schemes", label: "Schemes", icon: Landmark },
  { id: "updates", label: "Notifications", icon: Bell },
  { id: "help", label: "Find Nearby", icon: MapPin },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "complaints", label: "Report a Problem", icon: MessageSquare },
  { id: "profile", label: "My Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings }
];

export const PAGE_TITLES = {
  home: "Home",
  schemes: "Schemes",
  updates: "Notifications",
  help: "Find Nearby",
  documents: "Documents",
  complaints: "Report a Problem",
  profile: "My Profile",
  settings: "Settings",
  admin: "Admin Console"
};
