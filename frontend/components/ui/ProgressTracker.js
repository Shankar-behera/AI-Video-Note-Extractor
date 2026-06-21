const STEPS = [
  { key: ["uploading", "downloading"], label: "Upload", icon: "⬆️" },
  { key: ["extracting_audio"], label: "Audio", icon: "🎵" },
  { key: ["transcribing"], label: "Transcribe", icon: "🎙️" },
  { key: ["chunking", "map_processing"], label: "Analyze", icon: "🧠" },
  { key: ["reduce_processing", "generating_flashcards"], label: "Synthesize", icon: "✨" },
  { key: ["completed"], label: "Done", icon: "✅" },
];

function getStepState(step, currentStatus) {
  const allKeys = STEPS.flatMap((s) => s.key);
  const currentIdx = allKeys.indexOf(currentStatus);
  const stepKeys = step.key;

  const stepIdx = Math.min(...stepKeys.map((k) => allKeys.indexOf(k)).filter((i) => i >= 0));

  if (currentStatus === "completed") return "done";
  if (currentStatus === "failed") return "error";
  if (stepIdx < currentIdx) return "done";
  if (stepKeys.includes(currentStatus)) return "active";
  return "pending";
}

export default function ProgressTracker({ status, progress, label }) {
  const safeProgress = Math.max(0, Math.min(100, progress || 0));

  return (
    <div className="w-full space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {label || "Processing..."}
          </span>
          <span className="text-sm font-mono font-bold" style={{ color: "var(--signal)" }}>
            {safeProgress}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${safeProgress}%`,
              background: status === "failed"
                ? "var(--accent-red)"
                : "linear-gradient(90deg, var(--signal-dim), var(--signal))",
              boxShadow: status !== "failed" ? "0 0 12px rgba(0,255,135,0.4)" : "none",
            }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const state = getStepState(step, status);
          return (
            <div key={step.label} className="flex items-center gap-1 flex-shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-300"
                  style={{
                    background:
                      state === "done"
                        ? "rgba(0,255,135,0.12)"
                        : state === "active"
                        ? "rgba(0,255,135,0.08)"
                        : state === "error"
                        ? "rgba(255,107,107,0.1)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      state === "done"
                        ? "1px solid rgba(0,255,135,0.3)"
                        : state === "active"
                        ? "1px solid rgba(0,255,135,0.5)"
                        : state === "error"
                        ? "1px solid rgba(255,107,107,0.3)"
                        : "1px solid var(--border)",
                    boxShadow: state === "active" ? "0 0 12px rgba(0,255,135,0.2)" : "none",
                  }}
                >
                  {state === "active" ? (
                    <span className="animate-spin-slow text-xs">{step.icon}</span>
                  ) : state === "done" ? (
                    "✓"
                  ) : state === "error" ? (
                    "✕"
                  ) : (
                    <span style={{ opacity: 0.3 }}>{step.icon}</span>
                  )}
                </div>
                <span
                  className="text-xs"
                  style={{
                    color:
                      state === "done" || state === "active"
                        ? "var(--signal)"
                        : state === "error"
                        ? "var(--accent-red)"
                        : "var(--text-secondary)",
                    opacity: state === "pending" ? 0.4 : 1,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-6 h-px mb-5 flex-shrink-0"
                  style={{
                    background:
                      getStepState(STEPS[i + 1], status) !== "pending"
                        ? "rgba(0,255,135,0.3)"
                        : "var(--border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
