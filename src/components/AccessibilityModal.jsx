import { X } from "lucide-react";
import { useApp } from "../context/AppContext";
import DemoNote from "./DemoNote";

export default function AccessibilityModal({ onClose }) {
  const {
    largeText, setLargeText,
    highContrast, setHighContrast,
    reduceMotion, setReduceMotion,
    largeButtons, setLargeButtons,
  } = useApp();

  const toggles = [
    { id: "large-text", label: "Larger Text", desc: "Improve readability across the app", checked: largeText, onChange: setLargeText },
    { id: "high-contrast", label: "High Contrast", desc: "Increase contrast for better visibility", checked: highContrast, onChange: setHighContrast },
    { id: "reduce-motion", label: "Reduce Motion", desc: "Minimize animations and transitions", checked: reduceMotion, onChange: setReduceMotion },
    { id: "large-buttons", label: "Large Buttons", desc: "Bigger touch targets for easier tapping", checked: largeButtons, onChange: setLargeButtons },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="access-title" aria-modal="true">
        <div className="modal-head">
          <h2 id="access-title">Accessibility</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close accessibility settings">
            <X size={18} />
          </button>
        </div>
        {toggles.map(({ id, label, desc, checked, onChange }) => (
          <label key={id} className="toggle-row" htmlFor={id}>
            <span>
              <b>{label}</b>
              <div className="lang-en">{desc}</div>
            </span>
            <input
              id={id}
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              aria-label={label}
            />
          </label>
        ))}
        <DemoNote>
          Voice-first design, large touch targets, and clear language are core accessibility principles of JanaSeva Voice.
        </DemoNote>
      </div>
    </div>
  );
}
