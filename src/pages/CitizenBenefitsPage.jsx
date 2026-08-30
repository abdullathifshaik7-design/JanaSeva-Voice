import { Mic } from "lucide-react";
import { BENEFIT_CATEGORIES } from "../data/citizenBenefits";
import { useApp } from "../context/AppContext";
import DemoNote from "../components/DemoNote";
import TrustBadge from "../components/TrustBadge";

export default function CitizenBenefitsPage() {
  const { setPage } = useApp();

  return (
    <>
      <div className="page-title">
        <h1>Citizen Benefits</h1>
        <p>Discover public benefit categories available to citizens.</p>
      </div>

      <div className="grid benefits-grid">
        {BENEFIT_CATEGORIES.map((cat) => (
          <article key={cat.id} className="card benefit-card">
            <div className="benefit-head">
              <span className="category-emoji" aria-hidden="true">{cat.emoji}</span>
              <h3>{cat.title}</h3>
            </div>
            <ul className="benefit-list">
              {cat.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <TrustBadge type="demo" />
          </article>
        ))}
      </div>

      <div className="card voice-cta">
        <button type="button" className="primary" onClick={() => setPage("voice")}>
          <Mic size={17} aria-hidden="true" /> Ask about benefits by voice
        </button>
      </div>

      <DemoNote>All benefit information shown here is illustrative demo content for the prototype.</DemoNote>
    </>
  );
}
