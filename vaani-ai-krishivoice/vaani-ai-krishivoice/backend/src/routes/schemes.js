import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { governmentSchemes } from '../functions/functionHandlers.js';

const router = Router();

const schema = z.object({
  lang: z.enum(['hi', 'en']).optional(),
  keyword: z.string().max(100).optional(),
});

router.post('/', validate(schema), (req, res, next) => {
  try {
    res.json(governmentSchemes(req.validatedBody));
  } catch (err) {
    next(err);
  }
});

export default router;
