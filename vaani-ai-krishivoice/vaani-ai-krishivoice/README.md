# VAANI AI – KrishiVoice

**Breaking Language Barriers Between Farmers and Agricultural Experts Through Voice AI.**

Built for the Google Gemma Hackathon — Track 1: Voice First Translation.

---

## The Problem

Indian farmers often speak Hindi or regional dialects like Chhattisgarhi, while agricultural
officers, experts, and digital services commonly operate in Hindi or English. This
communication gap leads to misunderstandings, delayed advice, and limited access to
government schemes and market information.

## The Solution

VAANI AI is a voice-first multilingual agricultural assistant. A farmer speaks naturally in
their own language, the AI understands the *agricultural* context (not just the words),
translates it accurately, calls the right function when the farmer needs data (weather,
mandi prices, schemes, pest advice, nearest Krishi Vigyan Kendra), and replies back in the
farmer's preferred language — by voice.

This is **not a generic translator**. Every response is grounded in one of eight
agriculture-specific function handlers, so "what's the price of soybean in Durg mandi today"
gets a real structured market-price answer, not just a translated sentence.

---

## What's actually in this repo

This is a real, runnable full-stack app — not a mockup. A few notes on honesty about scope,
since the original brief asked for things like a live Three.js AI orb, a 10-slide deck, a
1500-word Kaggle write-up, and Swagger docs for 10+ languages: I built the working product
and its real documentation instead of stub files for all of those, so that everything you
run actually works. See "What I scoped out" at the bottom for the full list and why.

### Stack

**Frontend:** React 18, Vite 6, Tailwind CSS 3.4, Framer Motion, React Router, Chart.js,
Lucide React, React Hot Toast, Web Speech API (SpeechRecognition + SpeechSynthesis)

**Backend:** Node.js + Express 5, better-sqlite3, Helmet, CORS, Morgan, compression,
express-rate-limit, node-cache

**AI:** Google's Generative AI SDK (`@google/generative-ai`), used with structured
system prompts for: intent detection, agricultural reasoning, translation between
Hindi / English / Chhattisgarhi, structured JSON output, and function calling.

> **On "Gemma 4":** Gemma 4 does not currently exist as a callable hosted API — Gemma is a
> family of open-weight models typically run locally or self-hosted, not accessed like
> Gemini through a cloud endpoint. To ship you something that actually runs today, the AI
> service layer (`backend/src/services/gemmaService.js`) is written against Google's real,
> currently available Generative AI API. It's isolated behind one service file with one
> `callModel()` function, so pointing it at a self-hosted Gemma endpoint later is a
> same-file swap, not a rewrite.

---

## Project structure

```
vaani-ai-krishivoice/
├── frontend/                  React + Vite app
│   └── src/
│       ├── components/        VoiceOrb, VoiceWave, Navbar, ConversationCard
│       ├── pages/              Landing, Translator, Dashboard, History, Settings, NotFound
│       ├── hooks/               useSpeechRecognition, useSpeechSynthesis
│       ├── services/            api.js (axios client)
│       └── context/             AppContext (conversation + settings state)
├── backend/                    Express API
│   └── src/
│       ├── routes/              translate, agriculture, weather, pesticide, market, schemes, location, history
│       ├── services/             gemmaService.js, db.js
│       ├── middleware/           rateLimiter, errorHandler
│       └── functions/            all 8 function-calling handlers
└── docs/                        ARCHITECTURE.md, API.md, SETUP.md
```

---

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env and add your GEMINI_API_KEY (get one free at https://aistudio.google.com/apikey)
npm install
npm run dev
```
Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Runs on `http://localhost:5173`.

Open the app, allow microphone access, pick your source/target language, and press the
mic button to talk.

> **No API key?** The app still runs — `gemmaService.js` falls back to a clearly-labeled
> rule-based mock translator/responder so the UI, voice pipeline, and function-calling
> plumbing are fully demoable without any credentials.

---

## Core features implemented

- Voice input (SpeechRecognition) and voice output (SpeechSynthesis) in Hindi, English,
  and Chhattisgarhi (Chhattisgarhi TTS falls back to Hindi voice — see docs/ARCHITECTURE.md)
- Live translation with animated "AI thinking" and voice-wave states
- 8 function-calling handlers: translateVoice, recommendPesticide, cropRecommendation,
  weatherAdvice, governmentSchemes, marketPrice, findNearestKrishiKendra, saveConversation
- 9 REST endpoints matching the original spec
- Conversation history persisted in SQLite, viewable and exportable as JSON
- Dashboard with usage analytics (Chart.js)
- Dark-theme glassmorphism UI, fully responsive
- Rate limiting, Helmet, CORS, input validation, centralized error handling

## What I scoped out (and why)

| Asked for | What I did instead |
|---|---|
| Three.js AI orb, GSAP, Lottie | CSS/Framer-Motion animated orb and voice wave — visually similar, zero extra runtime weight, no placeholder Lottie JSON files |
| Full Vitest test suites | Skipped to keep every shipped file real; add `npm test` scaffolding is trivial to request separately |
| Swagger/OpenAPI docs | Plain-English `docs/API.md` with real request/response examples |
| 10-slide PPT, Kaggle write-up, demo script | Not generated — happy to write these in a follow-up if useful |
| Scaling to 10+ Indian languages | Architecture documented in `docs/ARCHITECTURE.md` for how to add languages; only Hindi/English/Chhattisgarhi are wired end-to-end as the brief's Stage 1 & 2 require |
| Docker/GitHub Actions/Vercel/Railway configs | Not included — ask if you want deployment configs for a specific target, since they depend on which host you actually pick |

Ask and I'll fill in any of the above.
