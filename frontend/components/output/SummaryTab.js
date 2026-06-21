export default function SummaryTab({ summary }) {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
          Summary will appear here
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          Processing your video...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(0,255,135,0.04)",
          border: "1px solid rgba(0,255,135,0.12)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📋</span>
          <h3
            className="font-bold text-sm uppercase tracking-widest"
            style={{ color: "var(--signal)", fontFamily: "'Syne', sans-serif" }}
          >
            Executive Summary
          </h3>
        </div>
        <div className="prose-notes">
          {summary.split("\n\n").map((para, i) => (
            <p key={i} className="mb-4 last:mb-0 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
