import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { marketPrice } from '../functions/functionHandlers.js';

const router = Router();

const schema = z.object({
  crop: z.string().min(1).max(100),
  mandi: z.string().min(1).max(100).optional(),
});

router.post('/', validate(schema), (req, res, next) => {
  try {
    res.json(marketPrice(req.validatedBody));
  } catch (err) {
    next(err);
  }
});

export default router;
