import os
import sys
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.upload import router as upload_router
from routes.status import router as status_router
from routes.result import router as result_router

from models.job import job_store

# ── WINDOWS ASYNC SUBPROCESS PATCH ───────────────────────────
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
# ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    print("✅ AI Video Note Extractor backend started")
    yield
    print("🛑 Backend shutting down")

app = FastAPI(
    title="AI Video Note Extractor",
    description="Convert videos into structured study notes",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS configuration remains identical...
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(status_router, prefix="/api", tags=["status"])
app.include_router(result_router, prefix="/api", tags=["result"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "jobs": len(job_store)}

@app.get("/api/jobs")
async def list_jobs():
    return {"jobs": list(job_store.keys())}

if __name__ == "__main__":
    import uvicorn
    # When using explicit event loop policies on Windows, 
    # run uvicorn using the factory string pattern to cleanly isolate threads.
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )