# Architecture — VAANI AI KrishiVoice

## High-level flow

```
Farmer speaks
     │
     ▼
Web Speech API (SpeechRecognition)  ── browser, client-side
     │  transcript text
     ▼
POST /api/voice  ─────────────────────────────► Express backend
     │                                               │
     │                                               ▼
     │                                     gemmaService.callModel()
     │                                     ├─ detects language
     │                                     ├─ detects intent
     │                                     ├─ extracts entities
     │                                     └─ translates + drafts reply
     │                                               │
     │                                               ▼
     │                              route dispatches to matching
     │                              function handler (functionHandlers.js):
     │                              recommendPesticide / cropRecommendation /
     │                              weatherAdvice / governmentSchemes /
     │                              marketPrice / findNearestKrishiKendra
     │                                               │
     │                                               ▼
     │                                     SQLite (conversations table)
     │                                     saveConversation()
     ◄───────────────────────────────────────────────┘
     │  { translated_text, reply_text, intent, function_result }
     ▼
Web Speech API (SpeechSynthesis) speaks the reply back
```

## Why Gemini instead of Gemma

Gemma 4 is (as of the brief) an open-weight model family meant for local/self-hosted
inference — it is not exposed as a public hosted completion API the way Gemini or
Claude are. Rather than write code against an API that doesn't exist and calling it
"done," `backend/src/services/gemmaService.js` is built against Google's real
Generative AI API (`@google/generative-ai`), with the exact same system-prompt
contract (structured JSON output, intent detection, translation, entity extraction)
that a Gemma-based pipeline would use.

**To point this at a self-hosted Gemma endpoint instead:** replace the body of
`callModel()` in that one file with a call to your Gemma inference server
(e.g. an Ollama `/api/generate` call or a vLLM OpenAI-compatible endpoint), keeping
the same input/output shape. No other file in the project needs to change, since
every route and every UI component only ever calls `callModel()`.

## Language handling

| Language | STT (SpeechRecognition) | TTS (SpeechSynthesis) | Model understanding |
|---|---|---|---|
| Hindi | `hi-IN` native | `hi-IN` native | Full |
| English | `en-IN` native | `en-IN` native | Full |
| Chhattisgarhi | Falls back to `hi-IN` (no browser locale exists) | Falls back to Hindi voice | Handled by the model/mock dictionary, since the model — not the browser — does the actual language understanding |

Because Chhattisgarhi has no ISO/BCP-47 browser locale, the browser's own STT/TTS
degrade to Hindi phonetics, but the *text* passed to and returned by the backend is
still genuinely processed as Chhattisgarhi by the model layer. This is a known,
documented limitation of browser Web Speech API support, not a gap in the app logic.

## Scaling to 10+ Indian languages

To add a new language (e.g. Marathi, Bengali, Odia):

1. Add its code and BCP-47 locale to `LANG_TO_BCP47` in both
   `useSpeechRecognition.js` and `useSpeechSynthesis.js` (skip if no locale exists —
   same fallback pattern as Chhattisgarhi).
2. Add the language code to the `LANGS` array in `Translator.jsx` and to the
   `z.enum([...])` validators in `backend/src/routes/translate.js` and `voice.js`.
3. No changes needed in `gemmaService.js` — the system prompt already instructs the
   model to detect/translate any language present in the conversation; the enum
   validation is the only place language codes are hardcoded.
4. For truly production-grade coverage, extend the mock dictionary
   (`MINI_DICT` in `gemmaService.js`) with common phrases for that language so the
   no-API-key fallback demo still works reasonably.

## Data flow / persistence

- **SQLite** (`better-sqlite3`) stores every conversation turn (`conversations` table)
  and every analytics event (`analytics_events` table). WAL mode is enabled for
  concurrent read/write safety.
- No user accounts — a per-browser `sessionId` (random string in `localStorage`)
  groups a user's own history. This is intentionally simple for a hackathon MVP;
  a production version would add real auth.

## Security measures implemented

- **Helmet** — sets secure HTTP headers
- **CORS** — locked to an explicit allow-list via `CORS_ORIGINS` env var
- **express-rate-limit** — configurable window/max per IP on all `/api` routes
- **Zod validation** — every POST route validates its body shape before touching
  business logic
- **Centralized error handler** — stack traces only shown outside production
- **No API keys in source** — all secrets read from `.env`, `.env.example` committed
  instead of real `.env`
