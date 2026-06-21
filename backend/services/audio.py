"""
backend/services/audio.py
Audio extraction service (Hybrid Stream-to-MP3 Edition).
Safely supports Windows development environments under all Uvicorn event loop policies.
"""
import os
import asyncio
import logging
import subprocess  # Synchronous fallback engine for Windows
import yt_dlp

logger = logging.getLogger(__name__)

async def get_youtube_stream_url(url: str) -> str:
    """
    Extract the direct audio streaming URL using native yt_dlp Python objects.
    Bypasses browser cookie locks completely.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
        'cookiesfrombrowser': None,
        'ignoreerrors': True
    }

    def _extract():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    loop = asyncio.get_running_loop()
    metadata = await loop.run_in_executor(None, _extract)
    
    if not metadata:
        raise RuntimeError("yt_dlp returned empty metadata.")

    audio_stream_url = None
    if "formats" in metadata:
        for f in metadata["formats"]:
            if f.get("vcodec") == "none" and f.get("acodec") != "none":
                audio_stream_url = f.get("url")
                break
    
    if not audio_stream_url:
        audio_stream_url = metadata.get("url")
        
    if not audio_stream_url:
        raise KeyError("No direct streaming link found in the metadata.")
        
    return audio_stream_url


async def download_youtube(url: str, job_id: str) -> str:
    """
    Hybrid Approach: Streams data down into an optimized 16kHz MP3 file.
    Safely utilizes thread-isolated execution to prevent Windows NotImplementedError crashes.
    """
    stream_url = await get_youtube_stream_url(url)
    
    output_dir = "uploads"
    os.makedirs(output_dir, exist_ok=True)
    audio_path = os.path.join(output_dir, f"{job_id}.mp3")
    
    cmd = [
        "ffmpeg", "-y",
        "-i", stream_url,
        "-vn",
        "-acodec", "libmp3lame",
        "-ar", "16000",      # Optimal for Whisper
        "-ac", "1",          # Mono layout downsampling
        "-q:a", "4",
        audio_path
    ]
    
    logger.info(f"Streaming remote track directly down to optimized file: {audio_path}")
    
    # Run the processing workload inside a thread pool executor.
    # This prevents freezing the main loop and works regardless of Uvicorn's event loop policy.
    def _run_ffmpeg():
        # Hide the console window popup on Windows systems
        startupinfo = None
        if os.name == 'nt':
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            
        result = subprocess.run(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            startupinfo=startupinfo
        )
        return result.returncode, result.stderr

    loop = asyncio.get_running_loop()
    return_code, stderr = await loop.run_in_executor(None, _run_ffmpeg)
    
    if return_code != 0:
        err_msg = stderr.decode(errors="replace")[:500]
        raise RuntimeError(f"FFmpeg stream processing failed (code {return_code}): {err_msg}")
        
    if not os.path.exists(audio_path):
        raise RuntimeError("FFmpeg completed execution but output file was not created.")
        
    return audio_path


async def extract_audio(video_path: str, job_id: str) -> str:
    """
    Extract audio from a locally uploaded video file using a safe thread wrapper.
    """
    output_dir = "uploads"
    os.makedirs(output_dir, exist_ok=True)
    audio_path = os.path.join(output_dir, f"{job_id}_audio.mp3")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "libmp3lame",
        "-ar", "16000",
        "-ac", "1",
        "-q:a", "2",
        audio_path,
    ]

    logger.info(f"Extracting audio from local file: {video_path}")
    
    def _run_local_ffmpeg():
        startupinfo = None
        if os.name == 'nt':
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, startupinfo=startupinfo)
        return result.returncode

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _run_local_ffmpeg)
    return audio_path