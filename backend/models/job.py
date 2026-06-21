"""
Job model — tracks pipeline state for each processing job.
"""
from enum import Enum
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime


class JobStatus(str, Enum):
    QUEUED = "queued"
    UPLOADING = "uploading"
    DOWNLOADING = "downloading"
    EXTRACTING_AUDIO = "extracting_audio"
    TRANSCRIBING = "transcribing"
    CHUNKING = "chunking"
    MAP_PROCESSING = "map_processing"
    REDUCE_PROCESSING = "reduce_processing"
    GENERATING_FLASHCARDS = "generating_flashcards"
    COMPLETED = "completed"
    FAILED = "failed"


# Human-readable labels for the frontend
STATUS_LABELS: Dict[str, str] = {
    JobStatus.QUEUED: "Queued",
    JobStatus.UPLOADING: "Uploading file...",
    JobStatus.DOWNLOADING: "Downloading video...",
    JobStatus.EXTRACTING_AUDIO: "Extracting audio...",
    JobStatus.TRANSCRIBING: "Transcribing with Whisper...",
    JobStatus.CHUNKING: "Splitting transcript into chunks...",
    JobStatus.MAP_PROCESSING: "Analyzing chunks with AI...",
    JobStatus.REDUCE_PROCESSING: "Synthesizing final notes...",
    JobStatus.GENERATING_FLASHCARDS: "Generating flashcards...",
    JobStatus.COMPLETED: "Completed",
    JobStatus.FAILED: "Failed",
}

# Progress percentages per stage
STATUS_PROGRESS: Dict[str, int] = {
    JobStatus.QUEUED: 0,
    JobStatus.UPLOADING: 5,
    JobStatus.DOWNLOADING: 10,
    JobStatus.EXTRACTING_AUDIO: 20,
    JobStatus.TRANSCRIBING: 40,
    JobStatus.CHUNKING: 50,
    JobStatus.MAP_PROCESSING: 65,
    JobStatus.REDUCE_PROCESSING: 80,
    JobStatus.GENERATING_FLASHCARDS: 92,
    JobStatus.COMPLETED: 100,
    JobStatus.FAILED: 0,
}


@dataclass
class Job:
    job_id: str
    status: JobStatus = JobStatus.QUEUED
    progress: int = 0
    label: str = "Queued"
    error: Optional[str] = None
    source_type: str = "file"          # "file" or "url"
    source_path: Optional[str] = None  # local file path
    source_url: Optional[str] = None   # YouTube URL
    audio_path: Optional[str] = None
    transcript: Optional[str] = None
    notes: Optional[str] = None
    summary: Optional[str] = None
    flashcards: Optional[list] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: Optional[str] = None

    def update_status(self, status: JobStatus, extra_progress: int = 0):
        self.status = status
        base = STATUS_PROGRESS.get(status, 0)
        self.progress = min(base + extra_progress, 99 if status != JobStatus.COMPLETED else 100)
        self.label = STATUS_LABELS.get(status, status.value)

    def to_status_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "status": self.status.value,
            "progress": self.progress,
            "label": self.label,
            "error": self.error,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
        }

    def to_result_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "status": self.status.value,
            "notes": self.notes,
            "summary": self.summary,
            "flashcards": self.flashcards or [],
            "transcript": self.transcript,
        }


# In-memory job store (replace with Redis in production)
job_store: Dict[str, Job] = {}


def create_job(source_type: str = "file") -> Job:
    import uuid
    job_id = str(uuid.uuid4())
    job = Job(job_id=job_id, source_type=source_type)
    job_store[job_id] = job
    return job


def get_job(job_id: str) -> Optional[Job]:
    return job_store.get(job_id)
