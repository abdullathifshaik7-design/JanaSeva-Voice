import { X } from "lucide-react";
import { DEMO_UPDATES } from "../data/updates";
import DemoNote from "./DemoNote";

function QuickUpdate({ title, text }) {
  return (
    <div className="update">
      <div className="badge">INFO</div>
      <div>
        <b className="update-title">{title}</b>
        <div className="update-text">{text}</div>
      </div>
    </div>
  );
}

export default function NotificationPanel({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="notif-title" aria-modal="true">
        <div className="modal-head">
          <h2 id="notif-title">Important Updates</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close notifications">
            <X size={18} />
          </button>
        </div>
        {DEMO_UPDATES.slice(0, 2).map((u) => (
          <QuickUpdate key={u.id} title={u.title} text={u.description} />
        ))}
        <DemoNote>Prototype notice: these are demo notifications, not official government notices.</DemoNote>
      </div>
    </div>
  );
}
