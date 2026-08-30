import { Mic } from "lucide-react";
import { FARMER_SECTIONS } from "../data/farmerServices";
import { useApp } from "../context/AppContext";
import DemoNote from "../components/DemoNote";

export default function FarmerServicesPage() {
  const { setPage } = useApp();

  return (
    <>
      <div className="page-title">
        <h1>Farmer Services</h1>
        <p>Voice-first guidance for agriculture-related citizen services.</p>
      </div>

      <div className="grid farmer-grid">
        {FARMER_SECTIONS.map((section) => (
          <article key={section.id} className="card farmer-card">
            <div className="category-emoji" aria-hidden="true">{section.emoji}</div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <button
              type="button"
              className="text-btn"
              onClick={() => setPage(section.id === "schemes" ? "schemes" : "voice")}
            >
              Explore →
            </button>
          </article>
        ))}
      </div>

      <div className="card voice-cta">
        <h2>Ask by voice</h2>
        <p className="card-sub">Get guided help for farmer-related queries.</p>
        <button type="button" className="primary" onClick={() => setPage("voice")}>
          <Mic size={17} aria-hidden="true" /> Ask JanaSeva
        </button>
      </div>

      <DemoNote>Prototype UI — no real government submission is performed.</DemoNote>
    </>
  );
}
