export default function NotificationCard({ update, onToggleRead }) {
  return (
    <article className={`notification-card ${update.read ? "read" : "unread"}`}>
      <div className="notification-meta">
        <span className="badge">{update.category}</span>
        <span className="notification-date">{update.date}</span>
        {!update.read && <span className="unread-dot" aria-label="Unread" />}
      </div>
      <h3>{update.title}</h3>
      <p>{update.description}</p>
      <div className="notification-footer">
        <span className="source-label">{update.source}</span>
        <button type="button" className="text-btn" onClick={() => onToggleRead(update.id)}>
          Mark as {update.read ? "unread" : "read"}
        </button>
      </div>
    </article>
  );
}
