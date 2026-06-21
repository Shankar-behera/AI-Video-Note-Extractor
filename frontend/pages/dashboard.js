import { useState, useRef } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import DropZone from "../components/ui/DropZone";
import ProgressTracker from "../components/ui/ProgressTracker";
import OutputPanel from "../components/output/OutputPanel";
import { uploadFile, submitUrl, pollUntilComplete } from "../services/api";

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/;

export default function Dashboard() {
  const [mode, setMode] = useState("url"); // "url" | "file"
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState(null); // { status, progress, label }
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const outputRef = useRef(null);

  const isValidUrl = (u) => {
    try { new URL(u); return true; } catch { return false; }
  };

  const handleSubmit = async () => {
    if (processing) return;

    if (mode === "url") {
      if (!url.trim()) { toast.error("Please enter a video URL"); return; }
      if (!isValidUrl(url.trim())) { toast.error("Please enter a valid URL"); return; }
    } else {
      if (!file) { toast.error("Please select a video file"); return; }
    }

    setProcessing(true);
    setResult(null);
    setJobStatus({ status: "queued", progress: 0, label: "Starting..." });

    try {
      let jobData;
      if (mode === "url") {
        toast("Submitting URL...", { icon: "📡" });
        jobData = await submitUrl(url.trim());
      } else {
        toast("Uploading file...", { icon: "⬆️" });
        jobData = await uploadFile(file, (pct) => {
          setUploadProgress(pct);
          setJobStatus({ status: "uploading", progress: Math.round(pct * 0.05), label: `Uploading... ${pct}%` });
        });
      }

      toast.success(`Job started! ID: ${jobData.job_id.slice(0, 8)}...`);

      // Scroll to progress area on mobile
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 300);

      const finalResult = await pollUntilComplete(
        jobData.job_id,
        (status) => setJobStatus(status),
        2000
      );

      setResult(finalResult);
      setJobStatus({ status: "completed", progress: 100, label: "Completed!" });
      toast.success("Notes generated!", { duration: 5000 });

      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err.message || "Something went wrong";
      setJobStatus((prev) => ({ ...prev, status: "failed", label: `Failed: ${msg}` }));
      toast.error(msg);
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setUrl("");
    setFile(null);
    setProcessing(false);
    setJobStatus(null);
    setResult(null);
    setUploadProgress(0);
  };

  return (
    <>
      <Head>
        <title>Dashboard — AI Video Note Extractor</title>
      </Head>

      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Background grid */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Navbar />

        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

          {/* Header */}
          <div className="space-y-2">
            <h1
              className="text-3xl md:text-4xl font-extrabold"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
            >
              Extract Notes
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Upload a video file or paste a YouTube URL to begin
            </p>
          </div>

          {/* Input card */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Mode toggle */}
            <div className="flex gap-2">
              {[
                { id: "url", label: "🔗 YouTube URL" },
                { id: "file", label: "📁 Upload File" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => !processing && setMode(m.id)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: mode === m.id ? "rgba(0,255,135,0.1)" : "rgba(255,255,255,0.04)",
                    border: mode === m.id ? "1px solid rgba(0,255,135,0.3)" : "1px solid var(--border)",
                    color: mode === m.id ? "var(--signal)" : "var(--text-secondary)",
                    fontFamily: "'Syne', sans-serif",
                  }}
                  disabled={processing}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* URL input */}
            {mode === "url" && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                  Video URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={processing}
                    className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${url && !isValidUrl(url) ? "rgba(255,107,107,0.5)" : "var(--border-bright)"}`,
                      color: "var(--text-primary)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
                {url && YT_REGEX.test(url) && (
                  <p className="text-xs" style={{ color: "var(--signal)" }}>
                    ✓ Valid YouTube URL detected
                  </p>
                )}
              </div>
            )}

            {/* File upload */}
            {mode === "file" && (
              <div className="space-y-3 animate-fade-in">
                {file ? (
                  <div
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.15)" }}
                  >
                    <div className="text-2xl">🎬</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {file.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    {!processing && (
                      <button
                        onClick={() => setFile(null)}
                        className="text-sm px-3 py-1 rounded-lg"
                        style={{ color: "var(--accent-red)", background: "rgba(255,107,107,0.1)" }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <DropZone onFile={setFile} disabled={processing} />
                )}
              </div>
            )}

            {/* Submit row */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={processing || (mode === "url" ? !url.trim() : !file)}
                className="btn-signal px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                    Processing...
                  </span>
                ) : (
                  "Extract Notes →"
                )}
              </button>

              {(processing || result) && (
                <button
                  onClick={handleReset}
                  disabled={processing}
                  className="px-4 py-3 rounded-xl text-sm transition-all disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Progress section */}
          {jobStatus && (
            <div
              ref={outputRef}
              className="rounded-2xl p-6 animate-fade-in"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}
              >
                Pipeline Status
              </h2>
              <ProgressTracker
                status={jobStatus.status}
                progress={jobStatus.progress}
                label={jobStatus.label}
              />
              {jobStatus.status === "failed" && (
                <div
                  className="mt-4 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "rgba(255,107,107,0.08)",
                    border: "1px solid rgba(255,107,107,0.2)",
                    color: "#FF6B6B",
                  }}
                >
                  ⚠️ {jobStatus.label}
                </div>
              )}
            </div>
          )}

          {/* Output section */}
          {(result || (jobStatus && jobStatus.status === "completed")) && (
            <div className="animate-fade-up">
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-secondary)", fontFamily: "'Syne', sans-serif" }}
              >
                Generated Output
              </h2>
              <OutputPanel result={result} />
            </div>
          )}

          {/* Empty state */}
          {!jobStatus && !result && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
            >
              <div className="text-5xl mb-4 opacity-30">🎬</div>
              <p className="font-semibold" style={{ fontFamily: "'Syne', sans-serif", opacity: 0.4 }}>
                Your notes will appear here
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)", opacity: 0.3 }}>
                Submit a video URL or file to get started
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
