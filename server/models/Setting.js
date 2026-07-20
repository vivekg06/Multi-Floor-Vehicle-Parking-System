import mongoose, { Schema } from 'mongoose';

const SettingSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export const Setting = mongoose.model('Setting', SettingSchema);
