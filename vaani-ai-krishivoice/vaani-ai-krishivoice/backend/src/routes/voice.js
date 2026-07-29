import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { callModel } from '../services/gemmaService.js';
import { getHistory } from '../services/db.js';
import {
  recommendPesticide,
  cropRecommendation,
  weatherAdvice,
  governmentSchemes,
  marketPrice,
  findNearestKrishiKendra,
  saveConversation,
} from '../functions/functionHandlers.js';

const router = Router();

const voiceSchema = z.object({
  text: z.string().min(1).max(2000),
  sourceLang: z.enum(['hi', 'en', 'cg']),
  targetLang: z.enum(['hi', 'en', 'cg']),
  sessionId: z.string().min(1).max(200),
});

/**
 * This is the main "assistant" endpoint the Translator page talks to:
 * it detects intent via the model, then dispatches to the matching
 * function handler, and returns a combined translated + functional reply.
 */
router.post('/', validate(voiceSchema), async (req, res, next) => {
  try {
    const { text, sourceLang, targetLang, sessionId } = req.validatedBody;
    const history = getHistory({ session_id: sessionId, limit: 6 });

    const modelResult = await callModel({ text, sourceLang, targetLang, history });
    const lang = targetLang === 'en' ? 'en' : 'hi'; // function handlers speak hi/en; cg falls back to hi text

    let functionResult = null;
    let functionCalled = null;

    switch (modelResult.intent) {
      case 'pest_control':
        functionCalled = 'recommendPesticide';
        functionResult = recommendPesticide({ symptoms: text, lang });
        break;
      case 'crop_recommendation':
        functionCalled = 'cropRecommendation';
        functionResult = cropRecommendation({});
        break;
      case 'weather':
        functionCalled = 'weatherAdvice';
        functionResult = await weatherAdvice({});
        break;
      case 'government_scheme':
        functionCalled = 'governmentSchemes';
        functionResult = governmentSchemes({ lang });
        break;
      case 'market_price':
        functionCalled = 'marketPrice';
        functionResult = marketPrice({});
        break;
      case 'krishi_kendra_locator':
        functionCalled = 'findNearestKrishiKendra';
        functionResult = findNearestKrishiKendra({});
        break;
      default:
        // translate / small_talk -> no extra function needed
        break;
    }

    const responsePayload = {
      original_text: text,
      translated_text: modelResult.translated_text,
      reply_text: modelResult.reply_text,
      detected_language: modelResult.detected_language,
      intent: modelResult.intent,
      function_called: functionCalled,
      function_result: functionResult,
      confidence: modelResult.confidence,
      mocked: modelResult.mocked || false,
    };

    saveConversation({
      session_id: sessionId,
      role: 'assistant',
      source_lang: sourceLang,
      target_lang: targetLang,
      original_text: text,
      translated_text: modelResult.reply_text,
      intent: modelResult.intent,
      function_called: functionCalled,
      function_result: functionResult,
    });

    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
});

export default router;
