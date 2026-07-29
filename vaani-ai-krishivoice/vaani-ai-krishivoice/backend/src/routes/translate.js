import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { translateVoice, saveConversation } from '../functions/functionHandlers.js';
import { getHistory } from '../services/db.js';

const router = Router();

const translateSchema = z.object({
  text: z.string().min(1).max(2000),
  sourceLang: z.enum(['hi', 'en', 'cg']),
  targetLang: z.enum(['hi', 'en', 'cg']),
  sessionId: z.string().min(1).max(200),
});

router.post('/', validate(translateSchema), async (req, res, next) => {
  try {
    const { text, sourceLang, targetLang, sessionId } = req.validatedBody;
    const history = getHistory({ session_id: sessionId, limit: 6 });

    const result = await translateVoice({ text, sourceLang, targetLang, sessionId, history });

    saveConversation({
      session_id: sessionId,
      role: 'user',
      source_lang: sourceLang,
      target_lang: targetLang,
      original_text: text,
      translated_text: result.translated_text,
      intent: 'translate',
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
