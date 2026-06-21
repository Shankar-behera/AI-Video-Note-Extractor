# 🎬 AI Video Note Extractor

> Convert any video into structured study notes, summaries, and flashcards using **Whisper + Mistral + DeepSeek**.

---

## 📐 Architecture

```
Video Input (YouTube URL / File Upload)
        │
        ▼
┌──────────────────┐
│  FastAPI Backend  │
│                  │
│  1. yt-dlp / FFmpeg  ──► Audio (.mp3)
│  2. Whisper STT  ──────► Raw Transcript
│  3. LLM Cleaning ──────► Clean Transcript
│  4. Chunker      ──────► Text Chunks
│  5. MAP (Mistral)──────► Chunk Analyses []
│  6. REDUCE (DS)  ──────► Final Notes (MD)
│  7. Summary      ──────► Executive Summary
│  8. Flashcards   ──────► Q&A Cards []
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  Next.js Frontend │
│                  │
│  • Dashboard      │
│  • Progress UI    │
│  • Tabbed Output  │
│  • PDF Export     │
│  • Flashcard flip │
└──────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | FastAPI, Uvicorn, Python 3.11 |
| STT | OpenAI Whisper (local) or Whisper API |
| MAP LLM | Mistral AI (mistral-small-latest) |
| REDUCE LLM | DeepSeek (deepseek-chat) |
| Audio | FFmpeg + yt-dlp |
| HTTP Client | Axios (frontend), httpx (backend) |

---

## 📁 Project Structure

```
ai-video-notes/
├── backend/
│   ├── main.py                  # FastAPI app entry
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── job.py               # Job state model + in-memory store
│   ├── routes/
│   │   ├── upload.py            # POST /api/upload
│   │   ├── status.py            # GET  /api/status/{job_id}
│   │   └── result.py            # GET  /api/result/{job_id}
│   ├── services/
│   │   ├── pipeline.py          # Full pipeline orchestrator
│   │   ├── audio.py             # FFmpeg + yt-dlp audio extraction
│   │   ├── transcription.py     # Whisper STT service
│   │   └── llm.py               # LLM calls (Mistral + DeepSeek + prompts)
│   └── utils/
│       └── chunker.py           # Transcript chunking utility
│
└── frontend/
    ├── pages/
    │   ├── _app.js              # App wrapper + dark mode context
    │   ├── _document.js         # HTML head + Google Fonts
    │   ├── index.js             # Landing page
    │   └── dashboard.js         # Main dashboard
    ├── components/
    │   ├── layout/
    │   │   └── Navbar.js
    │   ├── ui/
    │   │   ├── DropZone.js      # Drag-and-drop file upload
    │   │   └── ProgressTracker.js # Step indicators + progress bar
    │   └── output/
    │       ├── OutputPanel.js   # Tabbed output container
    │       ├── NotesTab.js      # Markdown notes renderer
    │       ├── SummaryTab.js    # Summary display
    │       ├── FlashcardsTab.js # Flip card flashcards
    │       └── TranscriptTab.js # Raw transcript viewer
    ├── services/
    │   └── api.js               # Axios API client
    └── styles/
        └── globals.css          # Design tokens + typography
```

---

## ⚡ Quick Start

### Prerequisites

- Python 3.10+ 
- Node.js 18+
- `ffmpeg` installed (`brew install ffmpeg` / `apt install ffmpeg`)
- `yt-dlp` installed (`pip install yt-dlp`)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys (see below)

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend will run at: `http://localhost:8000`  
📖 API docs at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

✅ Frontend will run at: `http://localhost:3000`

---

## 🔑 API Keys Configuration

Edit `backend/.env`:

```env
# ── LLM Providers (configure at least one) ──
MISTRAL_API_KEY=your_key    # https://console.mistral.ai
DEEPSEEK_API_KEY=your_key   # https://platform.deepseek.com
OPENAI_API_KEY=your_key     # https://platform.openai.com (optional fallback + Whisper API)

# ── Whisper Settings ──
WHISPER_MODEL=base           # tiny | base | small | medium | large
```

### Provider Fallback Logic

The system automatically tries providers in this order:
1. **Mistral** (MAP phase — fast, cheap)
2. **DeepSeek** (REDUCE phase — deep synthesis)  
3. **OpenAI GPT** (fallback)
4. **Mock mode** (demo without any keys)

---

## 📡 API Reference

### `POST /api/upload`

Upload a video file or submit a YouTube URL.

**File upload:**
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@/path/to/video.mp4"
```

**YouTube URL:**
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

**Response:**
```json
{ "job_id": "uuid-here", "source": "url" }
```

---

### `GET /api/status/{job_id}`

Poll for job progress.

```bash
curl http://localhost:8000/api/status/{job_id}
```

**Response:**
```json
{
  "job_id": "...",
  "status": "map_processing",
  "progress": 67,
  "label": "Analyzing chunks with AI...",
  "error": null
}
```

**Status values:**
`queued` → `uploading/downloading` → `extracting_audio` → `transcribing` → `chunking` → `map_processing` → `reduce_processing` → `generating_flashcards` → `completed`

---

### `GET /api/result/{job_id}`

Retrieve final output (only available when `status == completed`).

```json
{
  "job_id": "...",
  "status": "completed",
  "notes": "# Title\n\n## Overview\n...",
  "summary": "This lecture covers...",
  "flashcards": [
    {
      "id": 1,
      "question": "What is backpropagation?",
      "answer": "An algorithm that...",
      "topic": "Neural Networks",
      "difficulty": "medium"
    }
  ],
  "transcript": "Welcome to this lecture..."
}
```

---

## 🧠 LLM Prompts

All prompts are in `backend/services/llm.py`. Key prompts:

| Prompt | Purpose | Provider |
|--------|---------|---------|
| `CLEANING_PROMPT` | Fix grammar, remove fillers | Mistral |
| `MAP_PROMPT` | Extract concepts/logic per chunk | Mistral |
| `REDUCE_PROMPT` | Synthesize final Markdown notes | DeepSeek |
| `SUMMARY_PROMPT` | Executive summary prose | DeepSeek |
| `FLASHCARD_PROMPT` | Generate 10 Q&A flashcards | Auto |

---

## 🚀 Production Deployment

### Backend (Docker)

```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

---

## 🔧 Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `WHISPER_MODEL` | `base` | Whisper model size |
| `MISTRAL_MODEL` | `mistral-small-latest` | Mistral model |
| `DEEPSEEK_MODEL` | `deepseek-chat` | DeepSeek model |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI fallback model |

### Whisper Model Sizes

| Model | Size | Speed | Accuracy |
|-------|------|-------|---------|
| `tiny` | 75MB | ⚡⚡⚡ | ★★☆☆☆ |
| `base` | 140MB | ⚡⚡ | ★★★☆☆ |
| `small` | 460MB | ⚡ | ★★★★☆ |
| `medium` | 1.5GB | 🐢 | ★★★★★ |
| `large` | 3GB | 🐢🐢 | ★★★★★ |

---

## 📝 Features

- [x] YouTube URL processing via yt-dlp
- [x] Video file upload (MP4, MKV, AVI, MOV, WebM)
- [x] Whisper speech-to-text (local or API)
- [x] Map-Reduce LLM pipeline
- [x] Structured Markdown notes with tables
- [x] Executive summary
- [x] Interactive flashcards with flip animation
- [x] Raw transcript viewer with stats
- [x] Copy to clipboard
- [x] Download notes as PDF
- [x] Dark / light mode toggle
- [x] Real-time progress tracking
- [x] Responsive mobile layout
- [x] Drag-and-drop file upload
- [ ] Chat with Video (FAISS + RAG)
- [ ] Semantic search
- [ ] Redis job queue (for production scale)
- [ ] Multi-language support

---

## 🐛 Troubleshooting

**`ffmpeg not found`**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian  
sudo apt install ffmpeg

# Windows: Download from https://ffmpeg.org/download.html
```

**`yt-dlp not found`**
```bash
pip install yt-dlp
# or
brew install yt-dlp
```

**Whisper not transcribing**  
Set `OPENAI_API_KEY` to use the Whisper API instead of local, or install PyTorch:
```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install openai-whisper
```

**Mock mode (no API keys)**  
The app works in demo mode without any API keys — it returns pre-built mock notes/flashcards for testing the UI.

---

## 📄 License

MIT — build freely, deploy freely.
