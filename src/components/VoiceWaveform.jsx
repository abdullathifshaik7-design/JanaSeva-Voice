export default function VoiceWaveform({ active = false, bars = 15 }) {
  return (
    <div
      className={`wave ${active ? "active" : ""}`}
      role="img"
      aria-label={active ? "Listening waveform animation" : "Voice waveform"}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} style={active ? undefined : { animation: "none", height: 8 }} />
      ))}
    </div>
  );
}
