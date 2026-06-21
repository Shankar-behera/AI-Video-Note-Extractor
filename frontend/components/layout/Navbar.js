import Link from "next/link";
import { useTheme } from "../../pages/_app";

export default function Navbar() {
  const { dark, toggle } = useTheme();

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2 no-underline" style={{ textDecoration: "none" }}>
        <span
          className="font-extrabold text-lg"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
        >
          <span style={{ color: "var(--signal)" }}>▶</span> VidNotes<span style={{ color: "var(--signal)" }}>AI</span>
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm transition-colors"
          style={{ color: "var(--text-secondary)", textDecoration: "none" }}
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-sm transition-colors"
          style={{ color: "var(--text-secondary)", textDecoration: "none" }}
        >
          Dashboard
        </Link>
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ml-2"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
