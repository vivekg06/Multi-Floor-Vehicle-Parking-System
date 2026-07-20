import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/middleware.js';
import { Setting } from '../models/Setting.js';
import { ActivityLog } from '../models/ActivityLog.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const settingsList = await Setting.find({});
    const settings = {};
    settingsList.forEach(s => { settings[s.key] = s.value; });
    const defaults = { rates_car: 80, rates_bike: 50, charging_mode: 'exact' };
    return res.json({ ...defaults, ...settings });
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

router.post('/', requireRole(['admin']), async (req, res) => {
  const { rates_car, rates_bike, charging_mode } = req.body;
  try {
    const updates = [];
    if (rates_car !== undefined) updates.push(Setting.findOneAndUpdate({ key: 'rates_car' }, { value: Number(rates_car), updatedAt: new Date() }, { upsert: true, new: true }));
    if (rates_bike !== undefined) updates.push(Setting.findOneAndUpdate({ key: 'rates_bike' }, { value: Number(rates_bike), updatedAt: new Date() }, { upsert: true, new: true }));
    if (charging_mode !== undefined) {
      if (charging_mode !== 'exact' && charging_mode !== 'round_up') return res.status(400).json({ message: 'Invalid charging mode. Must be exact or round_up' });
      updates.push(Setting.findOneAndUpdate({ key: 'charging_mode' }, { value: charging_mode, updatedAt: new Date() }, { upsert: true, new: true }));
    }
    await Promise.all(updates);
    const audit = new ActivityLog({ username: req.user?.username || 'system', role: req.user?.role || 'system', action: 'SETTING_UPDATE', details: `Settings updated - Rates: Car=₹${rates_car ?? 'N/A'}, Bike=₹${rates_bike ?? 'N/A'}. Mode: ${charging_mode ?? 'N/A'}` });
    await audit.save();
    return res.json({ message: 'Settings updated successfully' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

export default router;
