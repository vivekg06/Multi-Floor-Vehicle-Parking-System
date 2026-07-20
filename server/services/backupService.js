import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Setting } from '../models/Setting.js';
import { Slot } from '../models/Slot.js';
import { Vehicle } from '../models/Vehicle.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { BackupLog } from '../models/BackupLog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');

export async function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.json`;
  const filePath = path.join(BACKUP_DIR, filename);
  try {
    const users = await User.find({});
    const settings = await Setting.find({});
    const slots = await Slot.find({});
    const vehicles = await Vehicle.find({});
    const activityLogs = await ActivityLog.find({});
    const backupData = { users, settings, slots, vehicles, activityLogs };
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
    const totalRecords = users.length + settings.length + slots.length + vehicles.length + activityLogs.length;
    const sizeBytes = fs.statSync(filePath).size;
    const logRecord = new BackupLog({ filename, date: new Date(), size: sizeBytes, recordsCount: totalRecords, status: 'success' });
    await logRecord.save();
    console.log(`Backup created successfully: ${filename} (${sizeBytes} bytes, ${totalRecords} records)`);
    return logRecord;
  } catch (error) {
    console.error('Failed to create backup:', error);
    const failedLog = new BackupLog({ filename: filename || `failed_backup_${Date.now()}.json`, date: new Date(), size: 0, recordsCount: 0, status: 'failed' });
    await failedLog.save();
    throw error;
  }
}

export async function restoreBackup(filename) {
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) throw new Error(`Backup file ${filename} not found.`);
  try {
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    await User.deleteMany({}); await Setting.deleteMany({}); await Slot.deleteMany({}); await Vehicle.deleteMany({}); await ActivityLog.deleteMany({});
    if (backupData.users?.length > 0) await User.insertMany(backupData.users);
    if (backupData.settings?.length > 0) await Setting.insertMany(backupData.settings);
    if (backupData.slots?.length > 0) await Slot.insertMany(backupData.slots);
    if (backupData.vehicles?.length > 0) await Vehicle.insertMany(backupData.vehicles);
    if (backupData.activityLogs?.length > 0) await ActivityLog.insertMany(backupData.activityLogs);
    console.log(`Successfully restored backup from file: ${filename}`);
  } catch (error) { console.error(`Failed to restore backup from file ${filename}:`, error); throw error; }
}

export function getBackupFilePath(filename) {
  return path.join(BACKUP_DIR, filename);
}
