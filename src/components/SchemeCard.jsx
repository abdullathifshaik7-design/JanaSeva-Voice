import TrustBadge from "./TrustBadge";
import DemoNote from "./DemoNote";

export default function SchemeCard({ scheme }) {
  return (
    <article className="card scheme-card">
      <div className="scheme-card-head">
        <h3>{scheme.name}</h3>
        <TrustBadge type="demo" />
      </div>
      <dl className="scheme-details">
        <div>
          <dt>Purpose</dt>
          <dd>{scheme.purpose}</dd>
        </div>
        <div>
          <dt>Eligibility</dt>
          <dd>{scheme.eligibility}</dd>
        </div>
        <div>
          <dt>Benefits</dt>
          <dd>{scheme.benefits}</dd>
        </div>
        <div>
          <dt>Required documents</dt>
          <dd>{scheme.documents.join(", ")}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{scheme.lastUpdated}</dd>
        </div>
      </dl>
      <TrustBadge />
      <DemoNote>This is illustrative demo data. Verify eligibility and benefits from official government sources.</DemoNote>
    </article>
  );
}
