import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { weatherAdvice } from '../functions/functionHandlers.js';

const router = Router();

const schema = z.object({
  location: z.string().min(1).max(200).optional(),
});

router.post('/', validate(schema), async (req, res, next) => {
  try {
    const result = await weatherAdvice(req.validatedBody);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
