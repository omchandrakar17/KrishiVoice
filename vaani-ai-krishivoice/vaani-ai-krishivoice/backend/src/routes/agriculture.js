import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/errorHandler.js';
import { cropRecommendation, recommendPesticide } from '../functions/functionHandlers.js';

const router = Router();

const schema = z.object({
  type: z.enum(['crop_recommendation', 'pest_advice']),
  season: z.string().optional(),
  soilType: z.string().optional(),
  region: z.string().optional(),
  symptoms: z.string().optional(),
  crop: z.string().optional(),
  lang: z.enum(['hi', 'en']).optional(),
});

router.post('/', validate(schema), (req, res, next) => {
  try {
    const { type, ...params } = req.validatedBody;
    if (type === 'crop_recommendation') {
      return res.json(cropRecommendation(params));
    }
    return res.json(recommendPesticide(params));
  } catch (err) {
    next(err);
  }
});

export default router;
