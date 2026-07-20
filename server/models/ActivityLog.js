import mongoose, { Schema } from 'mongoose';

const ActivityLogSchema = new Schema({
  username: { type: String, required: true, index: true },
  role: { type: String, required: true },
  action: { type: String, required: true, index: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true, index: true }
});

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
