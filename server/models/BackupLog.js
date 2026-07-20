import mongoose, { Schema } from 'mongoose';

const BackupLogSchema = new Schema({
  filename: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now, required: true },
  size: { type: Number, required: true },
  recordsCount: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true }
});

export const BackupLog = mongoose.model('BackupLog', BackupLogSchema);
