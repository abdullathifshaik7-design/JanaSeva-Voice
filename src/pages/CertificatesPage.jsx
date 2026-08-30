import { Mic } from "lucide-react";
import { CERTIFICATES } from "../data/certificates";
import { useApp } from "../context/AppContext";
import DemoNote from "../components/DemoNote";

export default function CertificatesPage() {
  const { setPage } = useApp();

  return (
    <>
      <div className="page-title">
        <h1>Certificates</h1>
        <p>Understand common citizen certificates and their application process.</p>
      </div>

      <div className="grid cert-grid">
        {CERTIFICATES.map((cert) => (
          <article key={cert.id} className="card cert-card">
            <h3>{cert.title}</h3>
            <p className="cert-desc">{cert.description}</p>
            <dl className="cert-details">
              <div>
                <dt>Typical documents</dt>
                <dd>{cert.documents.join(", ")}</dd>
              </div>
              <div>
                <dt>Basic process</dt>
                <dd>{cert.process}</dd>
              </div>
            </dl>
            <button type="button" className="secondary-btn full" onClick={() => setPage("voice")}>
              <Mic size={16} aria-hidden="true" /> Voice assistance
            </button>
          </article>
        ))}
      </div>

      <DemoNote>
        Actual requirements may vary by state and authority. Verify from the official source before applying in production.
      </DemoNote>
    </>
  );
}
