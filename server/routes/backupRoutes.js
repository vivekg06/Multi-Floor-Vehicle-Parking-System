import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/middleware.js';
import { BackupLog } from '../models/BackupLog.js';
import { createBackup, restoreBackup, getBackupFilePath } from '../services/backupService.js';
import { ActivityLog } from '../models/ActivityLog.js';
import fs from 'fs';

const router = Router();
router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/', async (req, res) => {
  try {
    const backups = await BackupLog.find({}).sort({ date: -1 });
    return res.json(backups);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

router.post('/trigger', async (req, res) => {
  try {
    const backupRecord = await createBackup();
    const audit = new ActivityLog({ username: req.user?.username || 'system', role: req.user?.role || 'system', action: 'BACKUP_CREATED', details: `Manual backup created successfully: ${backupRecord.filename}` });
    await audit.save();
    return res.status(201).json({ message: 'Backup created successfully', backup: backupRecord });
  } catch (error) { return res.status(500).json({ message: error.message || 'Backup trigger failed' }); }
});

router.post('/restore', async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ message: 'Backup filename is required' });
  try {
    await restoreBackup(filename);
    const audit = new ActivityLog({ username: req.user?.username || 'system', role: req.user?.role || 'system', action: 'BACKUP_RESTORED', details: `Restored system state from backup: ${filename}` });
    await audit.save();
    return res.json({ message: `System restored successfully from ${filename}` });
  } catch (error) { return res.status(500).json({ message: error.message || 'Restoration failed' }); }
});

router.get('/download/:filename', async (req, res) => {
  const { filename } = req.params;
  try {
    const filePath = getBackupFilePath(filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Backup file not found' });
    res.download(filePath, filename);
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

export default router;
