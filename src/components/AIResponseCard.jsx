import TrustBadge from "./TrustBadge";
import DemoNote from "./DemoNote";

export default function AIResponseCard({
  transcript,
  response,
  onListenAgain,
  onAskAnother,
  onGotIt,
}) {
  return (
    <div className="response ai-response">
      <div className="response-label">You said</div>
      <blockquote className="transcript">&ldquo;{transcript}&rdquo;</blockquote>
      <hr className="response-divider" />
      <div className="response-label">Assistant</div>
      <p className="assistant-text">&ldquo;{response}&rdquo;</p>
      <div className="trust-row-inline">
        <TrustBadge type="ai" />
        <TrustBadge type="demo" />
      </div>
      <div className="response-actions">
        <button type="button" className="primary" onClick={onListenAgain}>
          🔊 Listen Again
        </button>
        <button type="button" className="secondary-btn" onClick={onAskAnother}>
          Ask Another Question
        </button>
        <button type="button" className="secondary-btn" onClick={onGotIt}>
          Got it
        </button>
      </div>
      <DemoNote>
        AI-assisted demo response. JanaSeva Voice is not a government employee. Connect verified government data before presenting official status in production.
      </DemoNote>
    </div>
  );
}
