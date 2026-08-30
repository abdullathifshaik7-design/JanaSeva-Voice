import { MOBILE_NAV_ITEMS } from "../data/navigation";
import { useApp } from "../context/AppContext";

export default function BottomNavigation() {
  const { page, setPage, t } = useApp();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {MOBILE_NAV_ITEMS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={page === id ? "active" : ""}
          onClick={() => setPage(id)}
          aria-current={page === id ? "page" : undefined}
          aria-label={t(id)}
        >
          <Icon size={18} aria-hidden="true" />
          {t(id)}
        </button>
      ))}
    </nav>
  );
}
