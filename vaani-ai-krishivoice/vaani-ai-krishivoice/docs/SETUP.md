# Setup Guide

## Prerequisites
- Node.js 18+ (Node 22 recommended)
- npm
- A modern browser with Web Speech API support (Chrome or Edge recommended —
  Firefox and Safari have partial/no SpeechRecognition support)

## 1. Backend

```bash
cd backend
cp .env.example .env
npm install
```

Open `.env` and optionally set:
- `GEMINI_API_KEY` — get a free key at https://aistudio.google.com/apikey for live
  AI responses. Without it, the app runs fully in a labeled mock mode.
- `OPENWEATHER_API_KEY` — optional, for live weather instead of mock data.

```bash
npm run dev
```
Backend runs at `http://localhost:5000`. Visit `http://localhost:5000/api/health`
to confirm it's up.

## 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## 3. Using the app

1. Open `http://localhost:5173`
2. Go to **Translator**
3. Allow microphone access when prompted
4. Pick source/target language
5. Tap the mic orb and speak (or type in the text box as a fallback)
6. VAANI detects your intent, calls the right function, and replies by voice

## Troubleshooting

- **"Speech recognition not supported"** → use Chrome or Edge (desktop or Android).
  iOS Safari and Firefox do not support the SpeechRecognition API as of this
  writing.
- **CORS errors** → make sure `CORS_ORIGINS` in `backend/.env` includes the exact
  origin your frontend is running on (default `http://localhost:5173`).
- **Dashboard/History show no data** → have at least one conversation on the
  Translator page first; both pages read from the same SQLite database the
  backend writes to.
- **"mocked": true in responses** → this means no `GEMINI_API_KEY` was found (or
  the model call failed); the app falls back to a small rule-based translator so
  the whole pipeline stays demoable. Add a real key to remove this.
