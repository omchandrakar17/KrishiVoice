import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { findNearestKrishiKendra } from '../functions/functionHandlers.js';

const router = Router();

const schema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  district: z.string().max(100).optional(),
});

router.post('/', validate(schema), (req, res, next) => {
  try {
    res.json(findNearestKrishiKendra(req.validatedBody));
  } catch (err) {
    next(err);
  }
});

export default router;
