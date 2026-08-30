import { ArrowRight, FileText, HeartHandshake, Landmark, Leaf, MessageSquareWarning, Search } from "lucide-react";

const ICONS = {
  schemes: Landmark,
  certificates: FileText,
  complaints: MessageSquareWarning,
  status: Search,
  farmer: Leaf,
  benefits: HeartHandshake,
};

export default function ServiceCard({ id, title, desc, onOpen }) {
  const Icon = ICONS[id] ?? FileText;

  return (
    <button type="button" className="card service" onClick={() => onOpen(id)} aria-label={`Open ${title}`}>
      <div className="service-icon">
        <Icon size={21} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="service-link">
        Open service <ArrowRight size={14} aria-hidden="true" />
      </div>
    </button>
  );
}
