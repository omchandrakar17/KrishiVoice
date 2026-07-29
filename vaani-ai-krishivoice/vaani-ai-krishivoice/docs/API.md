# API Documentation — VAANI AI KrishiVoice

Base URL (local): `http://localhost:5000/api`

All POST endpoints expect and return `application/json`. All endpoints are behind a
rate limiter (default: 60 requests/minute/IP, configurable via `.env`).

---

### `GET /api/health`
Health check. Returns whether the AI model is configured.

**Response**
```json
{ "status": "ok", "modelConfigured": true, "timestamp": "2026-07-29T10:00:00.000Z" }
```

---

### `POST /api/translate`
Pure translation, no function-calling dispatch.

**Body**
```json
{ "text": "मेरी फसल में कीट लगा है", "sourceLang": "hi", "targetLang": "en", "sessionId": "session_abc123" }
```
`sourceLang` / `targetLang` ∈ `"hi" | "en" | "cg"`.

**Response**
```json
{
  "original_text": "मेरी फसल में कीट लगा है",
  "translated_text": "there is a pest on my crop",
  "detected_language": "hi",
  "confidence": 0.9,
  "mocked": false
}
```

---

### `POST /api/voice`
The main assistant endpoint — detects intent and dispatches to the matching
function handler automatically.

**Body:** same shape as `/api/translate`.

**Response**
```json
{
  "original_text": "मेरी फसल में कीट लगा है",
  "translated_text": "there is a pest on my crop",
  "reply_text": "नीम तेल घोल (5ml प्रति लीटर पानी) हर 5 दिन में छिड़कें...",
  "detected_language": "hi",
  "intent": "pest_control",
  "function_called": "recommendPesticide",
  "function_result": { "pest_identified": "Aphids / Yellowing", "recommendation": "...", "crop": "" },
  "confidence": 0.4,
  "mocked": true
}
```

---

### `POST /api/agriculture`
Direct access to crop recommendation or pest advice without going through the
voice/intent pipeline.

**Body (crop recommendation)**
```json
{ "type": "crop_recommendation", "season": "kharif", "region": "Chhattisgarh" }
```
**Body (pest advice)**
```json
{ "type": "pest_advice", "symptoms": "yellow leaf", "lang": "en" }
```

---

### `POST /api/weather`
**Body**
```json
{ "location": "Durg, Chhattisgarh" }
```
Returns mock forecast data unless `OPENWEATHER_API_KEY` is set in `backend/.env`.

---

### `POST /api/pesticide`
**Body**
```json
{ "symptoms": "white fly on leaves", "crop": "cotton", "lang": "en" }
```

---

### `POST /api/market`
**Body**
```json
{ "crop": "soybean", "mandi": "durg" }
```
**Response**
```json
{
  "found": true,
  "crop": "soybean",
  "mandi": "durg",
  "price_per_quintal_inr": 4650,
  "all_mandis": { "durg": 4650, "raipur": 4700, "bilaspur": 4600 },
  "note": "Prices are illustrative sample data...",
  "as_of": "2026-07-29"
}
```

---

### `POST /api/schemes`
**Body**
```json
{ "lang": "en", "keyword": "kisan" }
```

---

### `POST /api/location`
Find nearest Krishi Vigyan Kendra, by district name or lat/lng.

**Body**
```json
{ "district": "Durg" }
```
or
```json
{ "lat": 21.19, "lng": 81.28 }
```

---

### `GET /api/history?sessionId=...&limit=50&offset=0`
Returns conversation turns, most recent first.

### `GET /api/history/analytics`
Returns aggregate counts used by the Dashboard page: total turns, breakdown by
language pair, breakdown by intent, and turns per day for the last 7 days.

---

## Error format

All errors return:
```json
{ "error": "Human readable message", "details": { "field": ["reason"] } }
```
`details` is only present on validation errors (HTTP 400).
