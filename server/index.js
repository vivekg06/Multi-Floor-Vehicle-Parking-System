import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { connectDB } from './utils/db.js';
import { Slot } from './models/Slot.js';
import { seedDemoData } from './services/seedingService.js';
import { createBackup } from './services/backupService.js';
import { ActivityLog } from './models/ActivityLog.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import logRoutes from './routes/logRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/demo', demoRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static client assets
const clientBuildPath = path.join(__dirname, '../dist/client');
app.use(express.static(clientBuildPath));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// All unmatched requests serve React index.html (SPA Fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start Database & Seeder & Express Server
async function startServer() {
  try {
    await connectDB();

    // Check if database needs seeding (on cold start/empty DB)
    const slotCount = await Slot.countDocuments();
    if (slotCount === 0) {
      console.log('Database empty! Triggering automatic seed of demo data...');
      await seedDemoData();
    } else {
      console.log(`Database already initialized with ${slotCount} slots.`);
    }

    // Schedule Automatic Daily Backup (at 00:00 midnight every night)
    cron.schedule('0 0 * * *', async () => {
      console.log('Starting scheduled nightly database backup...');
      try {
        const backupRecord = await createBackup();
        const audit = new ActivityLog({
          username: 'system',
          role: 'system',
          action: 'BACKUP_CREATED',
          details: `Automatic scheduled nightly backup completed successfully: ${backupRecord.filename}`
        });
        await audit.save();
        console.log('Nightly scheduled backup completed.');
      } catch (err) {
        console.error('Nightly backup failed:', err);
        const audit = new ActivityLog({
          username: 'system',
          role: 'system',
          action: 'BACKUP_FAILED',
          details: `Automatic scheduled nightly backup failed: ${err.message || err}`
        });
        await audit.save();
      }
    });
    console.log('Daily backup scheduler initialized (runs at midnight 00:00).');

    app.listen(PORT, () => {
      console.log(`Smart Parking Management API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

startServer();
