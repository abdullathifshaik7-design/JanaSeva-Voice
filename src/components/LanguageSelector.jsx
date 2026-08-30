import { Check, X } from "lucide-react";
import { LANGUAGES_REGISTRY } from "../data/translations";
import DemoNote from "./DemoNote";

export default function LanguageSelector({ language, setLanguage, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="language-modal-title"
        aria-modal="true"
      >
        <div className="modal-head">
          <div>
            <h2 id="language-modal-title">Choose your language / భాషను ఎంచుకోండి</h2>
            <p className="modal-sub">You can change this anytime.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close language selector">
            <X size={18} />
          </button>
        </div>
        <div className="language-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
          {LANGUAGES_REGISTRY.map(({ nativeName, displayName, code }) => (
            <button
              key={code}
              type="button"
              className={`lang-card ${language === code ? "selected" : ""}`}
              onClick={() => {
                setLanguage(code);
                onClose();
              }}
              aria-pressed={language === code}
              style={{ padding: "10px" }}
            >
              <span>
                <div className="lang-name" style={{ fontSize: "15px", fontWeight: "700" }}>{nativeName}</div>
                <div className="lang-en" style={{ fontSize: "11px" }}>{displayName}</div>
              </span>
              {language === code && <Check size={16} color="#0b6a9c" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <DemoNote>
          JanaSeva Voice translates UI text and speech recognition configuration dynamically based on your selection.
        </DemoNote>
      </div>
    </div>
  );
}
