import React, { useState } from "react";
import { MapPin, Phone, Landmark, PhoneCall, Navigation, ShieldAlert, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SERVICE_CENTERS } from "../data/db";
import DemoNote from "../components/DemoNote";

const ALL_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Telangana",
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Delhi"
];

const FILTERS = [
  "All",
  "MeeSeva / Citizen Service",
  "Agriculture",
  "Pension",
  "Health",
  "Education",
  "Revenue",
  "Employment"
];

// Coordinate mapping for calculation
const CENTER_COORDINATES = {
  "Village Sachivalayam Center": { lat: 16.3067, lng: 80.4365, dept: "Revenue", hours: "9:00 AM - 5:00 PM" },
  "MeeSeva Center AP-042": { lat: 16.5062, lng: 80.6480, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" },
  "MeeSeva Center TS-109": { lat: 17.4834, lng: 78.3871, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" },
  "Prajavani Helpdesk": { lat: 17.9689, lng: 79.5941, dept: "Revenue", hours: "10:00 AM - 5:00 PM" },
  "e-Sevai Center TN-015": { lat: 13.0601, lng: 80.2621, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" },
  "TNeGA Helpdesk": { lat: 9.9252, lng: 78.1198, dept: "Revenue", hours: "9:00 AM - 5:00 PM" },
  "Bangalore One Center": { lat: 12.9279, lng: 77.5902, dept: "MeeSeva / Citizen Service", hours: "8:00 AM - 8:00 PM" },
  "Karnataka One Center": { lat: 15.3647, lng: 75.1240, dept: "MeeSeva / Citizen Service", hours: "8:00 AM - 8:00 PM" },
  "Akshaya Center KL-08": { lat: 8.5241, lng: 76.9366, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" },
  "Akshaya Center KL-92": { lat: 9.9816, lng: 76.2763, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" },
  "Aaple Sarkar Seva Kendra": { lat: 18.9400, lng: 72.8350, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" },
  "MahaOnline Citizen Kiosk": { lat: 18.5204, lng: 73.8567, dept: "MeeSeva / Citizen Service", hours: "9:00 AM - 6:00 PM" }
};

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function NearbyHelpPage() {
  const { selectedState, setSelectedState, t } = useApp();

  // Location / Geolocation states
  const [gpsRequestOpen, setGpsRequestOpen] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const handleRequestLocation = () => {
    setGpsRequestOpen(true);
  };

  const executeGeolocation = () => {
    setGpsRequestOpen(false);
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationAllowed(true);
      },
      (err) => {
        setLocationAllowed(false);
        setGpsError("Location permission was denied. Please enable Location permission in your browser settings.");
      },
      { timeout: 8000 }
    );
  };

  // Base list of centers
  const baseCenters = SERVICE_CENTERS[selectedState] || [];

  // Add department and calculate distances if GPS allowed
  const processedCenters = baseCenters.map(center => {
    const coords = CENTER_COORDINATES[center.name] || { lat: 16.3067, lng: 80.4365, dept: "Revenue", hours: "9:00 AM - 5:00 PM" };
    let distance = null;
    
    if (userCoords) {
      distance = getHaversineDistance(userCoords.latitude, userCoords.longitude, coords.lat, coords.lng);
    }

    return {
      ...center,
      department: coords.dept || "MeeSeva / Citizen Service",
      hours: coords.hours || "9:00 AM - 6:00 PM",
      distance,
      lat: coords.lat,
      lng: coords.lng
    };
  });

  // Sort by distance if GPS coordinates are loaded
  if (userCoords) {
    processedCenters.sort((a, b) => a.distance - b.distance);
  }

  // Filter list
  const filteredCenters = processedCenters.filter(center => {
    if (activeFilter === "All") return true;
    return center.department === activeFilter;
  });

  return (
    <div>
      <div className="page-title">
        <h1>📍 {t("findNearbyOfficesTitle") || "Find Nearby Government Offices"}</h1>
        <p>{t("findNearbyOfficesSub") || "Find MeeSeva, Sachivalayam, or e-Sevai citizen desks sorted by proximity."}</p>
      </div>

      {/* Official helpline card */}
      <div className="card p-4 mb-4 text-center border-warning" style={{ background: "#fef8e6" }}>
        <h2 style={{ fontSize: "20px", display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
          {t("seniorHelplineTitle") || "👴 Official Senior Citizen Helpline"}
        </h2>
        <p className="large-lead" style={{ margin: "5px 0 15px 0", fontWeight: "600", color: "#6b7280" }}>
          {t("seniorHelplineSub") || "Need support? Connect immediately with official national senior citizen representatives."}
        </p>
        <a 
          href="tel:14567" 
          className="senior-big-btn" 
          style={{ 
            maxWidth: "350px", 
            margin: "0 auto", 
            background: "#16a34a", 
            color: "white", 
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "12px 24px",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "700"
          }}
          onClick={() => alert(t("callingHelplineAlert") || "Calling Official Senior Citizen Helpline — 14567")}
        >
          <PhoneCall size={20} />
          <span>📞 {t("callHelpline") || "Call Helpline 14567"}</span>
        </a>
      </div>

      {/* GPS Location request box */}
      <div className="card p-4 mb-4 text-left" style={{ borderLeft: "4px solid #0ea5e9" }}>
        <h3>📍 {t("distanceCalculations") || "Distance Calculations"}</h3>
        <p className="small text-secondary mt-1">{t("enableGpsAlert") || "Enable location permissions to automatically sort MeeSeva desks and offices by proximity."}</p>
        
        {gpsError && (
          <div className="demo-note error-note mt-3 mb-2" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ShieldAlert size={16} />
            <span>{gpsError}</span>
          </div>
        )}

        {locationAllowed && userCoords && (
          <div className="demo-note success-note mt-3 mb-2" style={{ background: "#f0fdf4", color: "#166534", display: "flex", gap: "8px", alignItems: "center" }}>
            <Check size={16} />
            <span>{t("gpsAllowedAlert") || "✓ Location access enabled successfully. Centers sorted nearest first!"}</span>
          </div>
        )}

        {!locationAllowed && (
          <button 
            type="button" 
            className="primary mt-3" 
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            onClick={handleRequestLocation}
          >
            <Navigation size={16} /> {t("findNearbyOfficesBtn") || "Find Nearby Government Offices"}
          </button>
        )}
      </div>

      {/* State Filter */}
      <div className="card filter-card text-left" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div className="state-inline-filter">
          <span>{t("activeState") || "Active State"}: </span>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="state-select-inline"
          >
            {ALL_STATES_AND_UTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Filter categories */}
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              className="text-btn"
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background: activeFilter === f ? "#0ea5e9" : "#f1f5f9",
                color: activeFilter === f ? "#ffffff" : "#475569",
                fontSize: "12px",
                fontWeight: "700"
              }}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid mt-3">
        {filteredCenters.map((center, idx) => (
          <article key={idx} className="card center-card hover-grow text-left">
            <div className="center-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Landmark size={20} className="text-primary" />
                <h3>{t(center.name) || center.name}</h3>
              </div>
              {center.distance !== null && (
                <span className="badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                  {center.distance.toFixed(1)} {t("kmAway") || "km away"}
                </span>
              )}
            </div>
            
            <span className="badge mt-2" style={{ display: "inline-block" }}>{t(`cat_${center.department.toLowerCase()}`) || center.department}</span>
            
            <p className="center-address mt-2" style={{ margin: "5px 0" }}>
              <MapPin size={16} /> <span>{t(center.address) || center.address}</span>
            </p>
            
            <p className="center-phone" style={{ margin: "5px 0" }}>
              <Phone size={16} /> <span>{t("helpline") || "Helpline"}: <strong>{center.phone}</strong></span>
            </p>

            <p className="small text-secondary" style={{ margin: "5px 0" }}>
              {t("openHours") || "Open Hours"}: <b>{center.hours}</b>
            </p>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`}
                target="_blank"
                rel="noreferrer"
                className="secondary-btn"
                style={{ flex: 1, textDecoration: "none", color: "inherit", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "5px" }}
              >
                📍 {t("directions") || "Directions"}
              </a>
              <button 
                type="button" 
                className="secondary-btn"
                style={{ flex: 1 }}
                onClick={() => alert(`Calling ${center.name}: ${center.phone} (Demo Mode)`)}
              >
                📞 {t("callOffice") || "Call Office"}
              </button>
            </div>
          </article>
        ))}

        {filteredCenters.length === 0 && (
          <div className="text-center card p-5 full-width-grid">
            <p>{t("noCentersMatched") || "No service centers matched the selected filter or state."}</p>
            <p className="text-secondary">{t("trySwitchingState") || "Try switching state or selecting another category filter."}</p>
          </div>
        )}
      </div>

      {/* Geolocation Authorization Modal */}
      {gpsRequestOpen && (
        <div className="modal-backdrop" onClick={() => setGpsRequestOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-head">
              <h2>{t("gpsRequestTitle") || "Location Permission Request"}</h2>
              <button type="button" className="icon-btn" onClick={() => setGpsRequestOpen(false)}>✕</button>
            </div>
            <div className="py-3 text-center">
              <MapPin size={48} className="text-primary mx-auto mb-3 animate-bounce" />
              <p>{t("gpsRequestPrompt") || "JanaSeva Voice needs your location to find government offices near you."}</p>
              <button 
                type="button" 
                className="primary mt-4 w-full py-3"
                onClick={executeGeolocation}
              >
                {t("grantGpsBtn") || "Grant Geolocation Access"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DemoNote>Nearby search calculating actual distances via browser GPS. Common Service Center addresses are sourced from state portals.</DemoNote>
    </div>
  );
}
