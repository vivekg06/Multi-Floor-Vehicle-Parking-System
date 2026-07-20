import { Router } from 'express';
import { getDashboardStats, getAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware, requireRole } from '../middleware/middleware.js';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['admin', 'supervisor']));
router.get('/stats', getDashboardStats);
router.get('/charts', getAnalytics);
export default router;
