import { Mic } from "lucide-react";

export default function VoiceButton({
  listening = false,
  processing = false,
  onClick,
  size = "large",
  label = "Tap to Speak",
  ariaLabel = "Start voice input",
}) {
  const sizeClass = size === "large" ? "mic-large" : "mic-medium";

  return (
    <div className={`mic-wrap ${sizeClass}`}>
      <button
        type="button"
        className={`mic ${listening ? "listening" : ""} ${processing ? "processing" : ""}`}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={listening}
        disabled={processing}
      >
        <Mic size={size === "large" ? 34 : 28} aria-hidden="true" />
      </button>
      {label && <span className="mic-label">{label}</span>}
    </div>
  );
}
