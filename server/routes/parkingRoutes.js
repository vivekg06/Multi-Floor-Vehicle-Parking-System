import { Router } from 'express';
import { checkIn, calculateExit, checkOut, getLiveSlots, searchVehicles, getNotifications } from '../controllers/parkingController.js';
import { authMiddleware } from '../middleware/middleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/live-slots', getLiveSlots);
router.get('/search', searchVehicles);
router.post('/check-in', checkIn);
router.get('/calculate-exit', calculateExit);
router.post('/check-out', checkOut);
router.get('/notifications', getNotifications);
export default router;
