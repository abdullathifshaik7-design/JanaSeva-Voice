import React from "react";
import { useApp } from "../context/AppContext";

export default function Logo({ size = 40, showText = false, showTagline = false }) {
  const { t } = useApp();

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }} className="brand-logo-container">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Simple professional circular base */}
        <circle cx="50" cy="50" r="46" stroke="#0ea5e9" strokeWidth="4" fill="#0f172a" />
        
        {/* Minimal sound wave lines */}
        <path d="M 28,50 A 22,22 0 0,1 36,36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M 72,50 A 22,22 0 0,0 64,36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M 22,50 A 28,28 0 0,1 32,30" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 78,50 A 28,28 0 0,0 68,30" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />

        {/* Clean geometric microphone icon */}
        {/* Grille / capsule */}
        <rect x="44" y="24" width="12" height="20" rx="6" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
        
        {/* Stand neck */}
        <path d="M 38,40 A 15,15 0 0,0 62,40" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="44" x2="50" y2="64" stroke="#ffffff" strokeWidth="3" />
        
        {/* Flat base bar */}
        <line x1="40" y1="64" x2="60" y2="64" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
          <span style={{ fontSize: "19px", fontWeight: "800", color: "#f8fafc", lineHeight: "1.2", letterSpacing: "0.5px" }}>
            {t("appName")}
          </span>
          {showTagline && (
            <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.2px", marginTop: "2px" }}>
              {t("tagline")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
