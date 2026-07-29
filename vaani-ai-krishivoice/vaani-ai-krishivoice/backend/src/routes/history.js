import { Router } from 'express';
import { getHistory, getAnalyticsSummary } from '../services/db.js';

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const { sessionId, limit, offset } = req.query;
    const rows = getHistory({
      session_id: sessionId,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });

    const parsed = rows.map((r) => ({
      ...r,
      function_result: r.function_result ? JSON.parse(r.function_result) : null,
    }));

    res.json({ count: parsed.length, history: parsed });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics', (req, res, next) => {
  try {
    res.json(getAnalyticsSummary());
  } catch (err) {
    next(err);
  }
});

export default router;
