import { Router } from 'express';
import { authMiddleware } from '../middleware/middleware.js';
import { seedDemoData } from '../services/seedingService.js';

const router = Router();

router.post('/reset', authMiddleware, async (req, res) => {
  try {
    console.log('Demo database reset triggered by:', req.user?.username);
    await seedDemoData();
    return res.json({ message: 'Database has been successfully reset to demo status with 5000+ transaction records, active slots, backups, and user logs.' });
  } catch (error) {
    console.error('Error during demo database reset:', error);
    return res.status(500).json({ message: 'Failed to reset demo database.', error: error.message });
  }
});

export default router;
