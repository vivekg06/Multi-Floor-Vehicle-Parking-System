import mongoose, { Schema } from 'mongoose';

const VehicleSchema = new Schema({
  vehicleNumber: { type: String, required: true, index: true, uppercase: true, trim: true },
  type: { type: String, enum: ['car', 'bike'], required: true },
  driverName: { type: String, default: '' },
  phoneNumber: { type: String, default: '', index: true },
  slotId: { type: String, required: true },
  floor: { type: String, required: true },
  checkInTime: { type: Date, default: Date.now, required: true, index: true },
  checkOutTime: { type: Date, default: null },
  duration: { type: Number, default: null },
  rateApplied: { type: Number, default: null },
  chargingMode: { type: String, enum: ['exact', 'round_up'], default: 'exact' },
  amountPaid: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: { type: String, enum: ['parked', 'exited'], default: 'parked', index: true },
  receiptId: { type: String, required: true, unique: true, index: true }
});

export const Vehicle = mongoose.model('Vehicle', VehicleSchema);
