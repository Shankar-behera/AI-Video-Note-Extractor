import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NotesTab({ notes }) {
  if (!notes) return <EmptyState />;

  return (
    <div className="animate-fade-in">
      <div className="prose-notes">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">📝</div>
      <p className="font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
        Notes will appear here
      </p>
      <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
        Upload a video and start the extraction pipeline
      </p>
    </div>
  );
}
