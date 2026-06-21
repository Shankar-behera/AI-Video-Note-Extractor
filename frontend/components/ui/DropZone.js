import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const ACCEPTED = {
  "video/mp4": [".mp4"],
  "video/x-msvideo": [".avi"],
  "video/quicktime": [".mov"],
  "video/x-matroska": [".mkv"],
  "video/webm": [".webm"],
};

export default function DropZone({ onFile, disabled }) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0 && !disabled) {
        onFile(accepted[0]);
      }
    },
    [onFile, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  return (
    <div
      {...getRootProps()}
      className="relative rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer select-none"
      style={{
        border: `2px dashed ${isDragActive ? "var(--signal)" : "var(--border-bright)"}`,
        background: isDragActive ? "rgba(0,255,135,0.04)" : "var(--bg-card)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div
        className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all"
        style={{
          background: isDragActive ? "rgba(0,255,135,0.12)" : "rgba(255,255,255,0.04)",
        }}
      >
        {isDragActive ? "📂" : "🎬"}
      </div>

      <p className="font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.95rem" }}>
        {isDragActive ? "Drop it!" : "Drop your video here"}
      </p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        or <span style={{ color: "var(--signal)" }}>browse files</span>
      </p>
      <p className="text-xs mt-3" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
        MP4, MKV, AVI, MOV, WebM · Max 500 MB
      </p>

      {isDragActive && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: "0 0 0 2px var(--signal), 0 0 40px rgba(0,255,135,0.15)",
          }}
        />
      )}
    </div>
  );
}
