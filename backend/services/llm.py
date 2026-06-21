"""
LLM service — Map-Reduce pipeline using local Ollama optimized for Phi-3 Mini.
MAP phase   : phi3:mini (fast, local extraction)
REDUCE phase: phi3:mini (fast, local synthesis)
No API keys required — Ollama must be running on localhost:11434
"""
import os
import json
import logging
import httpx
from typing import List

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# OLLAMA CONFIG
# ─────────────────────────────────────────────────────────────

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Swapped all operational configurations over to use local phi3:mini footprints
MODEL_MAP      = os.getenv("OLLAMA_MODEL_MAP",      "phi3:mini")
MODEL_REDUCE   = os.getenv("OLLAMA_MODEL_REDUCE",   "phi3:mini")
MODEL_FALLBACK = os.getenv("OLLAMA_MODEL_FALLBACK", "phi3:mini")


# ─────────────────────────────────────────────────────────────
# PROMPTS
# ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are DocIntel Video Analyst — an expert at converting raw video transcripts
into beautifully structured, academically rigorous study notes. You produce clear, well-organized
Markdown that is immediately useful for studying and revision. Be thorough, precise, and insightful."""

CLEANING_PROMPT = """Clean the following raw speech transcript for academic use.

RULES:
- Fix all grammar, spelling, and punctuation errors
- Remove filler words (um, uh, like, you know, basically, literally, right?)
- Remove false starts and repetitions
- Preserve ALL technical terms, proper nouns, and domain-specific language exactly
- Preserve the speaker's original meaning — do NOT summarize or rephrase ideas
- Maintain natural paragraph breaks based on topic transitions
- Output ONLY the cleaned transcript, nothing else

RAW TRANSCRIPT:
{transcript}"""

MAP_PROMPT = """Analyze the following transcript segment and extract structured knowledge.

Output a JSON object with these exact keys:
{{
  "main_topic": "string — the primary topic of this segment",
  "key_concepts": [
    {{"term": "concept name", "definition": "clear explanation", "importance": "why this matters"}}
  ],
  "logical_flow": ["step 1 description", "step 2 description"],
  "key_ideas": ["important idea 1", "important idea 2"],
  "examples": ["example or analogy mentioned"],
  "technical_terms": ["term1", "term2"],
  "segment_summary": "2-3 sentence summary of this segment"
}}

RULES:
- Extract ALL concepts, never skip any
- Use concise, bullet-friendly language
- Preserve technical vocabulary exactly
- Output ONLY valid JSON, no markdown code blocks, no preamble

TRANSCRIPT SEGMENT:
{chunk}"""

REDUCE_PROMPT = """You are synthesizing analysis from multiple segments of a video lecture.
Below are JSON summaries of each segment. Generate comprehensive study notes in Markdown.

REQUIRED OUTPUT FORMAT:

# [Derive an accurate, descriptive title from the content]

## 📋 Overview
[2-3 paragraph executive summary of the entire video]

---

## 🎯 Core Concepts

### [Concept Name]
**Definition:** [Clear, precise definition]
**Key Points:**
- [point 1]
- [point 2]
**Why It Matters:** [Significance and applications]

---

## 🔄 Logical Flow / Process

1. **[Step Name]** — [Description]
2. **[Step Name]** — [Description]

---

## 📊 Concepts at a Glance

| Concept | Definition | Application |
|---------|-----------|-------------|
| [term]  | [brief def] | [use case] |

---

## 💡 Key Insights & Takeaways

- **[Insight 1]:** [Explanation]
- **[Insight 2]:** [Explanation]

---

## 🔗 Connections & Relationships
[How concepts relate to each other and to broader fields]

---

## ❓ Questions for Deeper Understanding
1. [Thought-provoking question]
2. [Another question]

SEGMENT ANALYSES:
{analyses}"""

SUMMARY_PROMPT = """Based on the following structured notes from a video, write a concise executive summary.

Write 3-5 paragraphs that:
1. State what the video is about and its main purpose
2. Describe the core concepts covered
3. Explain the most important insights
4. Note any practical applications or takeaways

Use clear, engaging prose. Avoid bullet points.

NOTES:
{notes}"""

FLASHCARD_PROMPT = """Generate exactly 10 high-quality study flashcards from these notes.

Output a JSON array:
[
  {{
    "id": 1,
    "question": "Clear, specific question",
    "answer": "Concise but complete answer (2-4 sentences)",
    "topic": "Topic category",
    "difficulty": "easy|medium|hard"
  }}
]

RULES:
- Cover the most important concepts
- Mix difficulty: 3 easy, 4 medium, 3 hard
- Questions test understanding, not memorization
- Answers must be self-contained
- Output ONLY a valid JSON array, no markdown, no preamble

NOTES:
{notes}"""


# ─────────────────────────────────────────────────────────────
# OLLAMA CLIENT
# ─────────────────────────────────────────────────────────────

async def call_ollama(
    prompt: str,
    model: str,
    system: str = SYSTEM_PROMPT,
    max_tokens: int = 4096,
    temperature: float = 0.1,  # Dropped from 0.3 to 0.1 to stabilize Phi-3 structural parsing
) -> str:
    """
    Call Ollama /api/chat endpoint (non-streaming).
    Enforces a strict JSON format structure pattern if explicit terms exist in the prompt block.
    """
    url = f"{OLLAMA_BASE_URL}/api/chat"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    }

    # CRUCIAL FOR SMALL MODELS: Forces Ollama's interior engine to enforce valid schema shapes
    if "JSON" in prompt or "json" in prompt:
        payload["format"] = "json"

    logger.info(f"Ollama ▶  model={model}  prompt_len={len(prompt)}")

    async with httpx.AsyncClient(timeout=900) as client:
        resp = await client.post(url, json=payload)

    if resp.status_code != 200:
        raise RuntimeError(
            f"Ollama returned HTTP {resp.status_code}: {resp.text[:300]}"
        )

    data = resp.json()
    content = data.get("message", {}).get("content", "")
    
    if not content:
        raise RuntimeError(f"Ollama returned empty content vectors. Raw: {data}")

    logger.info(f"Ollama ✓  model={model}  response_len={len(content)}")
    return content.strip()


async def _call_with_fallback(prompt: str, model: str, max_tokens: int = 4096) -> str:
    """Try preferred model; if it fails, fall back to MODEL_FALLBACK."""
    try:
        return await call_ollama(prompt, model=model, max_tokens=max_tokens)
    except Exception as e:
        if model == MODEL_FALLBACK:
            raise
        logger.warning(f"Model {model} failed ({e}) — retrying with {MODEL_FALLBACK}")
        return await call_ollama(prompt, model=MODEL_FALLBACK, max_tokens=max_tokens)


def _strip_json_fences(text: str) -> str:
    """
    Upgraded for Phi-3 Mini: Safely extracts text inside JSON blocks, 
    bypassing backtick wrappers and any extra conversational commentary.
    """
    text = text.strip()
    
    # Strip markdown backticks if the model added them anyway
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
        
    # Isolate strictly the data structural footprint between the outer braces
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    
    if start_idx != -1 and end_idx != -1:
        text = text[start_idx:end_idx + 1]
        
    # Array fallback processing wrapper (for Flashcard generation tasks)
    elif text.find("[") != -1 and text.rfind("]") != -1:
        text = text[text.find("["):text.rfind("]") + 1]
        
    return text


# ─────────────────────────────────────────────────────────────
# PIPELINE OPERATIONS (called by services/pipeline.py)
# ─────────────────────────────────────────────────────────────

async def clean_transcript(transcript: str) -> str:
    """Step 0 — Grammar fix + filler removal via Phi-3 Mini."""
    prompt = CLEANING_PROMPT.format(transcript=transcript[:12000])
    return await _call_with_fallback(prompt, model=MODEL_MAP, max_tokens=3000)


async def map_chunk(chunk: str, chunk_index: int, total_chunks: int) -> dict:
    """
    MAP phase — Extract structured knowledge from one chunk.
    Uses phi3:mini — extremely fast execution runtime profiles.
    """
    logger.info(f"MAP chunk {chunk_index + 1}/{total_chunks}  model={MODEL_MAP}")
    prompt = MAP_PROMPT.format(chunk=chunk[:6000])
    raw = await _call_with_fallback(prompt, model=MODEL_MAP, max_tokens=1000)

    try:
        return json.loads(_strip_json_fences(raw))
    except json.JSONDecodeError:
        logger.warning(f"JSON parse failed for chunk {chunk_index} — using text fallback")
        return {
            "main_topic": f"Segment {chunk_index + 1}",
            "segment_summary": raw[:500],
            "key_concepts": [],
            "logical_flow": [],
            "key_ideas": [],
            "examples": [],
            "technical_terms": [],
        }


async def reduce_to_notes(analyses: List[dict]) -> str:
    """
    REDUCE phase — Synthesize all chunk analyses into final Markdown notes.
    Uses phi3:mini for local low-overhead compilation.
    """
    analyses_json = json.dumps(analyses, indent=2)
    if len(analyses_json) > 8000:
        analyses_json = analyses_json[:8000] + "\n... [truncated]"

    logger.info(f"REDUCE  {len(analyses)} chunks  model={MODEL_REDUCE}")
    prompt = REDUCE_PROMPT.format(analyses=analyses_json)
    return await _call_with_fallback(prompt, model=MODEL_REDUCE, max_tokens=2500)


async def generate_summary(notes: str) -> str:
    """Executive summary generation step."""
    prompt = SUMMARY_PROMPT.format(notes=notes[:8000])
    return await _call_with_fallback(prompt, model=MODEL_MAP, max_tokens=1500)


async def generate_flashcards(notes: str) -> List[dict]:
    """10 Q&A flashcards using structured parsing extraction format."""
    prompt = FLASHCARD_PROMPT.format(notes=notes[:8000])
    raw = await _call_with_fallback(prompt, model=MODEL_MAP, max_tokens=1500)

    try:
        cards = json.loads(_strip_json_fences(raw))
        return cards if isinstance(cards, list) else []
    except json.JSONDecodeError:
        logger.warning("Flashcard JSON array parse failed — returning clean empty list")
        return []


# ─────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────

async def check_ollama_health() -> dict:
    """Ping Ollama and list available models."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
        models = [m["name"] for m in resp.json().get("models", [])]
        return {
            "ollama": "ok",
            "base_url": OLLAMA_BASE_URL,
            "available_models": models,
            "configured": {
                "map":      MODEL_MAP,
                "reduce":   MODEL_REDUCE,
                "fallback": MODEL_FALLBACK,
            },
        }
    except Exception as e:
        return {"ollama": "unreachable", "error": str(e), "base_url": OLLAMA_BASE_URL}