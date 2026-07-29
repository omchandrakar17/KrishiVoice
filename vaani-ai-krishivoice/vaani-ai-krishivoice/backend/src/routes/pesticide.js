import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { recommendPesticide } from '../functions/functionHandlers.js';

const router = Router();

const schema = z.object({
  symptoms: z.string().min(1).max(500),
  crop: z.string().max(100).optional(),
  lang: z.enum(['hi', 'en']).optional(),
});

router.post('/', validate(schema), (req, res, next) => {
  try {
    res.json(recommendPesticide(req.validatedBody));
  } catch (err) {
    next(err);
  }
});

export default router;
