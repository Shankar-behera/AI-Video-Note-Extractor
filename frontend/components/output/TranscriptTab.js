import { useState } from "react";
import toast from "react-hot-toast";

export default function TranscriptTab({ transcript }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast.success("Transcript copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!transcript) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🎙️</div>
        <p className="font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
          Transcript will appear here
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          After Whisper transcription completes
        </p>
      </div>
    );
  }

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const charCount = transcript.length;
  const estimatedMinutes = Math.round(wordCount / 130);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: "Words", value: wordCount.toLocaleString() },
          { label: "Characters", value: charCount.toLocaleString() },
          { label: "Est. duration", value: `~${estimatedMinutes} min` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-3 py-2 rounded-lg"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {stat.label}:{" "}
            </span>
            <span className="text-xs font-semibold" style={{ color: "var(--signal)" }}>
              {stat.value}
            </span>
          </div>
        ))}
        <button
          onClick={handleCopy}
          className="ml-auto px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{
            background: copied ? "rgba(0,255,135,0.1)" : "var(--bg-card)",
            border: copied ? "1px solid rgba(0,255,135,0.3)" : "1px solid var(--border)",
            color: copied ? "var(--signal)" : "var(--text-secondary)",
          }}
        >
          {copied ? "✓ Copied" : "Copy transcript"}
        </button>
      </div>

      {/* Transcript text */}
      <div
        className="rounded-2xl p-6 overflow-y-auto max-h-96"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.82rem",
          lineHeight: 1.8,
          color: "var(--text-secondary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {transcript}
      </div>
    </div>
  );
}
