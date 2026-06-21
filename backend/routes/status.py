"""
Status route — poll job progress.
"""
from fastapi import APIRouter, HTTPException
from models.job import get_job, JobStatus

router = APIRouter()


@router.get("/status/{job_id}")
async def get_status(job_id: str):
    """
    Returns current processing stage and progress percentage.
    Frontend polls this every 2 seconds.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    return job.to_status_dict()
