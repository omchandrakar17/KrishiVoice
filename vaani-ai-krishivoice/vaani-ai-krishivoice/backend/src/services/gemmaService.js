/**
 * gemmaService.js
 *
 * Single point of integration with the language model.
 *
 * NOTE ON "GEMMA": Gemma 4 is not exposed as a hosted cloud API the way this hackathon
 * brief assumes - Gemma models are open-weight and typically self-hosted (Ollama,
 * vLLM, Hugging Face Inference Endpoints, etc). To ship something that actually runs,
 * this file talks to Google's real, currently-available Generative AI API instead.
 *
 * Everything else in the app calls ONLY the exported functions below
 * (callModel, detectIntent, translateText). If you stand up a self-hosted Gemma
 * endpoint later, you only need to change the internals of `callModel()` -
 * no other file in this project needs to change.
 *
 * If no GEMINI_API_KEY is set, every exported function transparently falls back
 * to a deterministic rule-based mock so the whole app is demoable with zero
 * credentials. Mocked responses are tagged `"mocked": true` in their JSON output.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

let client = null;
if (apiKey) {
  client = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `You are VAANI, an agricultural voice assistant for Indian farmers.
You understand Hindi, English, and Chhattisgarhi.
Your job for every user utterance is to:
1. Detect the language of the input.
2. Detect the intent: one of
   ["translate", "pest_control", "crop_recommendation", "weather", "government_scheme",
    "market_price", "krishi_kendra_locator", "general_agriculture", "small_talk"]
3. Extract any structured entities relevant to the intent (crop name, location, pest
   symptoms, season, etc).
4. Produce a natural, farmer-friendly reply in the requested target language.

Always respond ONLY with valid JSON, no markdown fences, matching this shape:
{
  "detected_language": "hi" | "en" | "cg",
  "intent": "<one of the intents above>",
  "entities": { "crop": "...", "location": "...", "symptoms": "...", "query": "..." },
  "translated_text": "<the input translated/rendered into the requested target language>",
  "reply_text": "<a short, helpful, farmer-friendly reply in the target language>",
  "confidence": 0.0-1.0
}`;

function safeJsonParse(text) {
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Core model call. Returns a parsed structured object per SYSTEM_PROMPT contract.
 */
export async function callModel({ text, sourceLang, targetLang, history = [] }) {
  if (!client) {
    return mockCall({ text, sourceLang, targetLang });
  }

  try {
    const model = client.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT });

    const historyContext = history
      .slice(-6)
      .map((h) => `${h.role}: ${h.original_text || h.translated_text || ''}`)
      .join('\n');

    const prompt = `Conversation so far:\n${historyContext || '(none)'}\n\n` +
      `Source language: ${sourceLang}\nTarget language: ${targetLang}\n` +
      `User said: "${text}"\n\nRespond with the JSON object described in your instructions.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = safeJsonParse(responseText);

    if (!parsed) {
      return mockCall({ text, sourceLang, targetLang, reason: 'unparseable_model_output' });
    }
    return { ...parsed, mocked: false };
  } catch (err) {
    console.error('[gemmaService] model call failed, falling back to mock:', err.message);
    return mockCall({ text, sourceLang, targetLang, reason: 'model_error' });
  }
}

/**
 * Deterministic rule-based fallback so the app works with zero API credentials.
 * Covers a small dictionary of common farmer phrases across hi/en/cg plus
 * lightweight keyword-based intent detection.
 */
const MINI_DICT = {
  en_hi: {
    'hello': 'नमस्ते',
    'what is the weather today': 'आज मौसम कैसा है',
    'pest on my crop': 'मेरी फसल में कीट लगा है',
    'market price': 'बाजार भाव',
  },
  hi_en: {
    'नमस्ते': 'hello',
    'आज मौसम कैसा है': 'what is the weather today',
    'मेरी फसल में कीट लगा है': 'there is a pest on my crop',
    'बाजार भाव': 'market price',
  },
  hi_cg: {
    'नमस्ते': 'जय जोहार',
    'आज मौसम कैसा है': 'आज मौसम कइसन हे',
    'मेरी फसल में कीट लगा है': 'मोर फसल मा किरा लगे हे',
  },
  cg_hi: {
    'जय जोहार': 'नमस्ते',
    'आज मौसम कइसन हे': 'आज मौसम कैसा है',
    'मोर फसल मा किरा लगे हे': 'मेरी फसल में कीट लगा है',
  },
};

function detectIntentKeywords(text) {
  const t = text.toLowerCase();
  if (/pest|कीट|किरा|insect|disease|रोग/.test(t)) return 'pest_control';
  if (/weather|मौसम|बारिश|rain/.test(t)) return 'weather';
  if (/scheme|योजना|सब्सिडी|subsidy/.test(t)) return 'government_scheme';
  if (/price|भाव|mandi|मंडी|rate/.test(t)) return 'market_price';
  if (/crop|फसल|बोना|sow|which crop|कौन सी फसल/.test(t)) return 'crop_recommendation';
  if (/kendra|केंद्र|kvk|nearest|नजदीक/.test(t)) return 'krishi_kendra_locator';
  if (/hi$|hello|namaste|नमस्ते|जय जोहार/.test(t)) return 'small_talk';
  return 'translate';
}

function mockCall({ text, sourceLang, targetLang, reason }) {
  const dictKey = `${sourceLang}_${targetLang}`;
  const dict = MINI_DICT[dictKey] || {};
  const lower = text.trim().toLowerCase();
  const matchKey = Object.keys(dict).find((k) => k.toLowerCase() === lower);
  const translated = matchKey ? dict[matchKey] : `[${targetLang}] ${text}`;
  const intent = detectIntentKeywords(text);

  return {
    detected_language: sourceLang,
    intent,
    entities: {},
    translated_text: translated,
    reply_text: translated,
    confidence: matchKey ? 0.9 : 0.4,
    mocked: true,
    mock_reason: reason || 'no_api_key_configured',
  };
}

export function isModelConfigured() {
  return Boolean(client);
}
