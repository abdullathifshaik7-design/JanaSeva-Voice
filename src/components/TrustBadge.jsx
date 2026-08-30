import { BadgeCheck, Sparkles } from "lucide-react";

export default function TrustBadge({ type = "verified" }) {
  if (type === "ai") {
    return (
      <span className="trust-badge ai" aria-label="AI-assisted response">
        <Sparkles size={14} aria-hidden="true" />
        AI-assisted response
      </span>
    );
  }
  if (type === "demo") {
    return (
      <span className="trust-badge demo" aria-label="Demo data">
        Demo Data
      </span>
    );
  }
  return (
    <span className="trust-badge verified" aria-label="Verified information">
      <BadgeCheck size={14} aria-hidden="true" />
      Verified Information
    </span>
  );
}
