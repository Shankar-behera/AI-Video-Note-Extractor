"""
Upload route — accepts video file upload or YouTube URL.
Kicks off async background pipeline.
"""
import os
import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional

from models.job import create_job, job_store, JobStatus
from services.pipeline import run_pipeline

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".webm", ".m4v", ".flv"}
MAX_FILE_SIZE_MB = 500


@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
):
    """
    Accept either a video file upload or a YouTube URL.
    Returns job_id for polling.
    """
    if not file and not url:
        raise HTTPException(status_code=400, detail="Provide either a file or a URL.")

    if file and url:
        raise HTTPException(status_code=400, detail="Provide either a file or a URL, not both.")

    # ── Handle YouTube URL ─────────────────────────────────
    if url:
        url = url.strip()
        if not _is_valid_video_url(url):
            raise HTTPException(status_code=400, detail="Invalid video URL. Supported: YouTube, direct MP4 links.")

        job = create_job(source_type="url")
        job.source_url = url
        job.update_status(JobStatus.QUEUED)
        background_tasks.add_task(run_pipeline, job.job_id)
        return JSONResponse({"job_id": job.job_id, "source": "url"})

    # ── Handle file upload ──────────────────────────────────
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    job = create_job(source_type="file")
    job.update_status(JobStatus.UPLOADING)

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    dest_path = os.path.join(upload_dir, f"{job.job_id}{ext}")

    # Stream file to disk
    try:
        chunk_size = 1024 * 1024  # 1 MB chunks
        total_bytes = 0
        with open(dest_path, "wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)
                total_bytes += len(chunk)
                # Simple progress within upload stage
                mb = total_bytes / (1024 * 1024)
                job.progress = min(4, int(mb / 10))  # rough estimate
    except Exception as e:
        job.update_status(JobStatus.FAILED)
        job.error = f"Upload failed: {str(e)}"
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    job.source_path = dest_path
    background_tasks.add_task(run_pipeline, job.job_id)

    return JSONResponse({"job_id": job.job_id, "source": "file", "filename": file.filename})


def _is_valid_video_url(url: str) -> bool:
    valid_prefixes = [
        "https://www.youtube.com/watch",
        "https://youtube.com/watch",
        "https://youtu.be/",
        "https://www.youtube.com/shorts/",
        "http://",
        "https://",
    ]
    return any(url.startswith(p) for p in valid_prefixes)
