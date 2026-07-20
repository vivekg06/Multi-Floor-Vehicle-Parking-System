import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/middleware.js';
import { ActivityLog } from '../models/ActivityLog.js';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/', async (req, res) => {
  const { action, username, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (username) filter.username = new RegExp(String(username).trim(), 'i');
  try {
    const skip = (Number(page) - 1) * Number(limit);
    const logs = await ActivityLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit));
    const total = await ActivityLog.countDocuments(filter);
    return res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

export default router;
