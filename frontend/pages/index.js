import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTheme } from "./_app";

const features = [
  { icon: "🎙️", label: "Whisper STT", desc: "State-of-the-art speech-to-text" },
  { icon: "🧠", label: "LLM Map-Reduce", desc: "Mistral + DeepSeek pipeline" },
  { icon: "📝", label: "Structured Notes", desc: "Markdown with tables & diagrams" },
  { icon: "⚡", label: "Flashcards", desc: "Instant Q&A study cards" },
  { icon: "📺", label: "YouTube Support", desc: "Paste any YouTube URL" },
  { icon: "📄", label: "PDF Export", desc: "Download polished notes" },
];

export default function Landing() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="font-display text-lg font-800" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
          <span style={{ color: "var(--signal)" }}>▶</span> VidNotes<span style={{ color: "var(--signal)" }}>AI</span>
        </span>
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          title="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 animate-fade-in"
          style={{
            background: "rgba(0,255,135,0.08)",
            border: "1px solid rgba(0,255,135,0.2)",
            color: "var(--signal)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
          Powered by Whisper + Mistral + DeepSeek
        </div>

        <h1
          className="text-5xl md:text-7xl font-extrabold leading-none mb-6 animate-fade-up"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em" }}
        >
          Turn any video into
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #00FF87, #60A5FA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            instant study notes.
          </span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-xl mb-10 animate-fade-up"
          style={{ color: "var(--text-secondary)", animationDelay: "0.1s", lineHeight: 1.6 }}
        >
          Upload a video or paste a YouTube URL. Get structured Markdown notes,
          executive summaries, and flashcards in minutes — not hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-signal px-8 py-4 text-base"
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem" }}
          >
            Start Extracting Notes →
          </button>
          <a
            href="https://github.com/Shankar-behera/AI-Video-Note-Extractor.git"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl text-base font-medium transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: "none",
            }}
          >
            View on GitHub
          </a>
        </div>

        {/* Features grid */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full animate-fade-up" style={{ animationDelay: "0.3s" }}>
          {features.map((f) => (
            <div
              key={f.label}
              className="card p-5 text-left hover:border-signal transition-all duration-200"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="font-semibold text-sm mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{f.label}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Pipeline diagram */}
        <div className="mt-16 max-w-2xl w-full animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs mb-4 uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Pipeline</p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
            {["Video Input", "Audio Extract", "Whisper STT", "Chunking", "Map (Mistral)", "Reduce (DeepSeek)", "Study Notes"].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  {step}
                </span>
                {i < arr.length - 1 && <span style={{ color: "var(--signal)", opacity: 0.5 }}>→</span>}
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-8 text-xs" style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border)" }}>
        AI Video Note Extractor — Built with FastAPI + Next.js
      </footer>
    </div>
  );
}
