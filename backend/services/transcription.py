"""
backend/services/transcription.py
Transcription service using Groq Cloud API (Free Tier).
Falls back to mock transcription if API keys are missing.
"""
import os
import logging
import httpx

logger = logging.getLogger(__name__)

async def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe audio file using Groq's high-speed Whisper engine.
    Returns plain text transcript.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    
    if groq_key:
        try:
            return await _transcribe_groq_api(audio_path, groq_key)
        except Exception as e:
            logger.error(f"Groq API transcription failed: {e}")
            raise e

    # Fallback to Mock (development/demo mode)
    logger.warning("No GROQ_API_KEY found in env — using mock transcript for testing.")
    return _mock_transcript()


async def _transcribe_groq_api(audio_path: str, api_key: str) -> str:
    """Transcribe using Groq Cloud whisper-large-v3."""
    logger.info(f"Transcribing via Groq API: {audio_path}")
    
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    async with httpx.AsyncClient(timeout=300) as client:
        with open(audio_path, "rb") as f:
            files = {"file": (os.path.basename(audio_path), f, "audio/mpeg")}
            data = {"model": "whisper-large-v3"}
            
            response = await client.post(url, headers=headers, files=files, data=data)
            
    response.raise_for_status()
    transcript = response.json().get("text", "").strip()
    logger.info(f"Groq Transcription complete: {len(transcript)} characters generated.")
    return transcript


def _mock_transcript() -> str:
    """Returns a realistic mock transcript for testing without keys."""
    return """
    Welcome to this comprehensive lecture on machine learning fundamentals. 
    Today we'll cover the core concepts that form the foundation of modern AI systems.
    Supervised learning involves training on labeled data instances where each sample consists of input parameters and desired target states.
    Backpropagation operates using standard calculus chain rules to trace error variations back across multi-layered dense configurations.
    """