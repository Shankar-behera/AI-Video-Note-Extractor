import { useState } from "react";

const DIFFICULTY_COLOR = {
  easy: { bg: "rgba(0,255,135,0.1)", border: "rgba(0,255,135,0.25)", text: "var(--signal)" },
  medium: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", text: "#FBBF24" },
  hard: { bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.25)", text: "#FF6B6B" },
};

function FlashCard({ card }) {
  const [flipped, setFlipped] = useState(false);
  const colors = DIFFICULTY_COLOR[card.difficulty] || DIFFICULTY_COLOR.medium;

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ perspective: "1000px", minHeight: "180px" }}
      onClick={() => setFlipped((p) => !p)}
    >
      <div
        className="w-full h-full transition-all duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          minHeight: "180px",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <p
              className="font-semibold leading-snug flex-1"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.95rem" }}
            >
              {card.question}
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            >
              {card.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}
            >
              {card.topic}
            </span>
            <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
              Tap to reveal →
            </span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(0,255,135,0.04)",
            border: "1px solid rgba(0,255,135,0.15)",
          }}
        >
          <p
            className="leading-relaxed text-sm flex-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {card.answer}
          </p>
          <span className="text-xs mt-3" style={{ color: "var(--signal)", opacity: 0.6 }}>
            ← Tap to flip back
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardsTab({ flashcards }) {
  const [filter, setFilter] = useState("all");

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">⚡</div>
        <p className="font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
          Flashcards will appear here
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
          Generated automatically from your notes
        </p>
      </div>
    );
  }

  const filtered =
    filter === "all" ? flashcards : flashcards.filter((c) => c.difficulty === filter);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "easy", "medium", "hard"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? "rgba(0,255,135,0.1)" : "var(--bg-card)",
              border: filter === f ? "1px solid rgba(0,255,135,0.3)" : "1px solid var(--border)",
              color: filter === f ? "var(--signal)" : "var(--text-secondary)",
            }}
          >
            {f === "all" ? `All (${flashcards.length})` : f}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "var(--text-secondary)" }}>
          Tap a card to reveal answer
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((card) => (
          <FlashCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
