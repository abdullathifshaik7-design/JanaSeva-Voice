import { Check, Clock3 } from "lucide-react";

export default function ComplaintTimeline({ steps }) {
  return (
    <div className="timeline" role="list" aria-label="Complaint progress timeline">
      {steps.map((step) => (
        <div
          key={step.title}
          className={`step ${step.done ? "done" : ""} ${step.current ? "current" : ""}`}
          role="listitem"
        >
          <div className="step-dot" aria-hidden="true">
            {step.done ? (
              <Check size={16} />
            ) : step.current ? (
              <Clock3 size={15} />
            ) : (
              <span className="step-pending">○</span>
            )}
          </div>
          <div>
            <b>{step.title}</b>
            {step.text && <div className="step-text">{step.text}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApplicationTimeline({ steps }) {
  return (
    <div className="timeline" role="list" aria-label="Application progress timeline">
      {steps.map((step) => (
        <div
          key={step.title}
          className={`step ${step.done ? "done" : ""} ${step.current ? "current" : ""}`}
          role="listitem"
        >
          <div className="step-dot" aria-hidden="true">
            {step.done ? (
              <Check size={16} />
            ) : step.current ? (
              <Clock3 size={15} />
            ) : (
              <span className="step-pending">○</span>
            )}
          </div>
          <div>
            <b>{step.title}</b>
            {step.date && <div className="step-text">{step.date}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
