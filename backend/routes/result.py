"""
Result route — return generated notes when job is complete.
"""
from fastapi import APIRouter, HTTPException
from models.job import get_job, JobStatus

router = APIRouter()


@router.get("/result/{job_id}")
async def get_result(job_id: str):
    """
    Returns notes, summary, flashcards, and transcript.
    Only available once status == completed.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    if job.status == JobStatus.FAILED:
        raise HTTPException(status_code=500, detail=job.error or "Pipeline failed.")

    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=202,
            detail=f"Job not yet complete. Current status: {job.status.value} ({job.progress}%)",
        )

    return job.to_result_dict()
