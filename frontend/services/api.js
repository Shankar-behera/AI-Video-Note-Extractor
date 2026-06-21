import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE,
  timeout: 300000,
});

/** Upload a video file — returns { job_id } */
export async function uploadFile(file, onProgress) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post("/api/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

/** Submit a YouTube URL — returns { job_id } */
export async function submitUrl(url) {
  const form = new FormData();
  form.append("url", url);
  const { data } = await api.post("/api/upload", form);
  return data;
}

/** Poll job status — returns { status, progress, label, error } */
export async function getStatus(jobId) {
  const { data } = await api.get(`/api/status/${jobId}`);
  return data;
}

/** Get final result — returns { notes, summary, flashcards, transcript } */
export async function getResult(jobId) {
  const { data } = await api.get(`/api/result/${jobId}`);
  return data;
}

/** Poll until job is done or failed. Returns result. */
export async function pollUntilComplete(jobId, onStatusUpdate, intervalMs = 2000) {
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const status = await getStatus(jobId);
        if (onStatusUpdate) onStatusUpdate(status);

        if (status.status === "completed") {
          clearInterval(timer);
          const result = await getResult(jobId);
          resolve(result);
        } else if (status.status === "failed") {
          clearInterval(timer);
          reject(new Error(status.error || "Processing failed"));
        }
      } catch (err) {
        // 202 means still processing — ignore
        if (err?.response?.status !== 202) {
          clearInterval(timer);
          reject(err);
        }
      }
    }, intervalMs);
  });
}
