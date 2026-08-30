import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "../data/navigation";
import { useApp } from "../context/AppContext";
import Logo from "./Logo";
import { LANGUAGES_REGISTRY } from "../data/translations";

export default function Sidebar() {
  const { page, setPage, language, setLanguageOpen, isAdminLoggedIn, t } = useApp();

  const filteredNav = NAV_ITEMS.filter(item => item.id !== "admin" || isAdminLoggedIn);

  const activeLangItem = LANGUAGES_REGISTRY.find(item => item.code === language);
  const activeLangName = activeLangItem ? activeLangItem.nativeName : "English";

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand" onClick={() => setPage("home")} style={{ cursor: "pointer", padding: "15px 10px" }}>
        <Logo size={38} showText={true} showTagline={true} />
      </div>
      <nav className="nav">
        {filteredNav.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
            aria-current={page === id ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {t(id)}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button type="button" className="lang-mini" onClick={() => setLanguageOpen(true)} aria-label="Change language">
          <span>🌐 {activeLangName}</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
