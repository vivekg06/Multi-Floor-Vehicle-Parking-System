import mongoose, { Schema } from 'mongoose';

const SlotSchema = new Schema({
  slotId: { type: String, required: true, unique: true, index: true },
  floor: { type: String, enum: ['Ground', 'First', 'Second'], required: true },
  type: { type: String, enum: ['car', 'bike'], required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available', required: true },
  currentVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null }
});

export const Slot = mongoose.model('Slot', SlotSchema);
