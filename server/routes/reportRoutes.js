import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/middleware.js';
import { Vehicle } from '../models/Vehicle.js';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['admin', 'supervisor']));

router.get('/', async (req, res) => {
  const { period, startDate, endDate } = req.query;
  let start = new Date(), end = new Date();
  const now = new Date();
  switch (period) {
    case 'daily': start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999); break;
    case 'weekly': start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999); break;
    case 'monthly': start.setDate(1); start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999); break;
    case 'yearly': start.setMonth(0, 1); start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999); break;
    case 'custom':
      if (!startDate || !endDate) return res.status(400).json({ message: 'Start date and End date are required for custom reports' });
      start = new Date(String(startDate)); start.setHours(0, 0, 0, 0);
      end = new Date(String(endDate)); end.setHours(23, 59, 59, 999); break;
    default: start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999); break;
  }
  try {
    const logs = await Vehicle.find({ checkInTime: { $gte: start, $lte: end } }).sort({ checkInTime: -1 });
    const totalEntries = logs.length;
    const totalExits = logs.filter(l => l.status === 'exited').length;
    const carEntries = logs.filter(l => l.type === 'car').length;
    const bikeEntries = logs.filter(l => l.type === 'bike').length;
    const exitedLogs = logs.filter(l => l.status === 'exited');
    const totalRevenue = exitedLogs.reduce((sum, log) => sum + (log.amountPaid || 0), 0);
    const avgDuration = exitedLogs.length > 0 ? exitedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / exitedLogs.length : 0;
    return res.json({ summary: { totalEntries, totalExits, carEntries, bikeEntries, totalRevenue: Math.round(totalRevenue * 100) / 100, avgDuration: Math.round(avgDuration * 100) / 100, avgRevenuePerVehicle: exitedLogs.length > 0 ? Math.round((totalRevenue / exitedLogs.length) * 100) / 100 : 0 }, period: period || 'daily', startDate: start, endDate: end, records: logs });
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

export default router;
