import React from "react";
import { useApp } from "../context/AppContext";

export default function Logo({ size = 40, showText = false, showTagline = false, textColor = null, className = "" }) {
  const { t } = useApp();

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}
      className={`brand-logo-container ${className}`.trim()}
      role="img"
      aria-label="JanaSeva Voice"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="jsvNavyLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F2D59" />
            <stop offset="50%" stopColor="#0A1F3D" />
            <stop offset="100%" stopColor="#06152B" />
          </linearGradient>

          <linearGradient id="jsvSaffronLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          <linearGradient id="jsvGreenLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#138808" />
            <stop offset="100%" stopColor="#0A5C03" />
          </linearGradient>

          <linearGradient id="jsvCyanLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#jsvNavyLogo)" stroke="#1E406D" strokeWidth="1.5" />
        
        <g opacity="0.3" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round">
          <line x1="50" y1="9" x2="50" y2="13" />
          <line x1="50" y1="87" x2="50" y2="91" />
          <line x1="9" y1="50" x2="13" y2="50" />
          <line x1="87" y1="50" x2="91" y2="50" />
          <line x1="21" y1="21" x2="24" y2="24" />
          <line x1="76" y1="76" x2="79" y2="79" />
          <line x1="21" y1="79" x2="24" y2="76" />
          <line x1="76" y1="24" x2="79" y2="21" />
          <line x1="14" y1="36" x2="18" y2="37" />
          <line x1="82" y1="63" x2="86" y2="64" />
          <line x1="14" y1="64" x2="18" y2="63" />
          <line x1="82" y1="37" x2="86" y2="36" />
        </g>

        <path d="M 33 8 A 44 44 0 0 1 67 8" stroke="url(#jsvSaffronLogo)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 35 92 A 44 44 0 0 0 65 92" stroke="url(#jsvGreenLogo)" strokeWidth="3" strokeLinecap="round" />

        <path d="M 28 40 A 18 18 0 0 0 28 60" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
        <path d="M 20 33 A 28 28 0 0 0 20 67" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M 72 40 A 18 18 0 0 1 72 60" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
        <path d="M 80 33 A 28 28 0 0 1 80 67" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />

        <rect x="43" y="27" width="14" height="24" rx="7" fill="url(#jsvCyanLogo)" />
        <path d="M 46 30 Q 50 28 54 30" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="43" y1="38" x2="57" y2="38" stroke="#0369A1" strokeWidth="1.5" />
        <line x1="47" y1="33" x2="53" y2="33" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />

        <circle cx="50" cy="43" r="2.2" fill="#FFFFFF" />
        <circle cx="50" cy="43" r="1.4" fill="url(#jsvSaffronLogo)" />

        <path d="M 36 43 C 36 57 64 57 64 43" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <line x1="50" y1="56" x2="50" y2="69" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <line x1="39" y1="70" x2="61" y2="70" stroke="url(#jsvCyanLogo)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="50" cy="70" r="1.5" fill="#FFFFFF" />
      </svg>
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "19px", fontWeight: "900", color: textColor || "#f8fafc", lineHeight: "1.1", letterSpacing: "0.5px" }}>
              Jana<span style={{ color: "#38bdf8" }}>Seva</span>
            </span>
            <span style={{
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "1.2px",
              color: "#ea580c",
              background: "rgba(234, 88, 12, 0.12)",
              padding: "1px 5px",
              borderRadius: "4px",
              border: "1px solid rgba(234, 88, 12, 0.3)",
              textTransform: "uppercase"
            }}>
              VOICE
            </span>
          </div>
          {showTagline && (
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.2px", marginTop: "3px" }}>
              {t("tagline") || "Citizen Services • Voice AI"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
