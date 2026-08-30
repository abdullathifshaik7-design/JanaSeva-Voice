export default function DemoNote({ children }) {
  return <div className="demo-note">{children ?? "Demo Data — not official government information."}</div>;
}
