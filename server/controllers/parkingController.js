import { Slot } from '../models/Slot.js';
import { Vehicle } from '../models/Vehicle.js';
import { Setting } from '../models/Setting.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { findNearestAvailableSlot } from '../utils/allocation.js';

export async function checkIn(req, res) {
  const { vehicleNumber, type, driverName, phoneNumber } = req.body;
  if (!vehicleNumber || !type) return res.status(400).json({ message: 'Vehicle number and type are required' });
  if (type !== 'car' && type !== 'bike') return res.status(400).json({ message: 'Invalid vehicle type. Must be car or bike' });
  try {
    const formattedPlate = vehicleNumber.trim().toUpperCase().replace(/\s/g, '');
    const alreadyParked = await Vehicle.findOne({ vehicleNumber: formattedPlate, status: 'parked' });
    if (alreadyParked) return res.status(400).json({ message: `Vehicle ${formattedPlate} is already parked in Slot ${alreadyParked.slotId} (${alreadyParked.floor} Floor).` });
    const slot = await findNearestAvailableSlot(type);
    if (!slot) return res.status(400).json({ message: `Parking Full: No available slots for ${type}s` });
    const receiptId = `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newVehicle = new Vehicle({ vehicleNumber: formattedPlate, type, driverName: driverName || '', phoneNumber: phoneNumber || '', slotId: slot.slotId, floor: slot.floor, checkInTime: new Date(), status: 'parked', paymentStatus: 'pending', receiptId });
    await newVehicle.save();
    slot.status = 'occupied';
    slot.currentVehicle = newVehicle._id;
    await slot.save();
    const audit = new ActivityLog({ username: req.user?.username || 'system', role: req.user?.role || 'system', action: 'CHECK_IN', details: `Vehicle ${formattedPlate} check-in, assigned slot ${slot.slotId} (${slot.floor} Floor)` });
    await audit.save();
    return res.status(201).json(newVehicle);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function calculateExit(req, res) {
  const { search } = req.query;
  if (!search) return res.status(400).json({ message: 'Search query is required' });
  try {
    const searchString = String(search).trim().toUpperCase();
    const vehicle = await Vehicle.findOne({ $or: [{ vehicleNumber: searchString }, { receiptId: searchString }, { phoneNumber: searchString }], status: 'parked' });
    if (!vehicle) return res.status(404).json({ message: 'No active parked vehicle found with details provided.' });
    const rateCarSetting = await Setting.findOne({ key: 'rates_car' });
    const rateBikeSetting = await Setting.findOne({ key: 'rates_bike' });
    const modeSetting = await Setting.findOne({ key: 'charging_mode' });
    const hourlyRate = vehicle.type === 'car' ? (rateCarSetting?.value ?? 80) : (rateBikeSetting?.value ?? 50);
    const chargingMode = modeSetting?.value ?? 'exact';
    const durationMs = Date.now() - vehicle.checkInTime.getTime();
    const durationHours = Math.max(0.01, durationMs / (1000 * 60 * 60));
    const charge = chargingMode === 'round_up' ? Math.ceil(durationHours) * hourlyRate : Math.round(durationHours * hourlyRate * 100) / 100;
    return res.json({ vehicle, checkOutTime: new Date(), duration: Math.round(durationHours * 100) / 100, hourlyRate, chargingMode, charge });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function checkOut(req, res) {
  const { vehicleId } = req.body;
  if (!vehicleId) return res.status(400).json({ message: 'Vehicle ID is required' });
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.status !== 'parked') return res.status(404).json({ message: 'Vehicle is not currently parked' });
    const rateCarSetting = await Setting.findOne({ key: 'rates_car' });
    const rateBikeSetting = await Setting.findOne({ key: 'rates_bike' });
    const modeSetting = await Setting.findOne({ key: 'charging_mode' });
    const hourlyRate = vehicle.type === 'car' ? (rateCarSetting?.value ?? 80) : (rateBikeSetting?.value ?? 50);
    const chargingMode = modeSetting?.value ?? 'exact';
    const checkOutTime = Date.now();
    const durationHours = Math.max(0.01, (checkOutTime - vehicle.checkInTime.getTime()) / (1000 * 60 * 60));
    const charge = chargingMode === 'round_up' ? Math.ceil(durationHours) * hourlyRate : Math.round(durationHours * hourlyRate * 100) / 100;
    vehicle.checkOutTime = new Date(checkOutTime);
    vehicle.duration = Math.round(durationHours * 100) / 100;
    vehicle.rateApplied = hourlyRate;
    vehicle.chargingMode = chargingMode;
    vehicle.amountPaid = charge;
    vehicle.paymentStatus = 'paid';
    vehicle.status = 'exited';
    await vehicle.save();
    const slot = await Slot.findOne({ slotId: vehicle.slotId });
    if (slot) { slot.status = 'available'; slot.currentVehicle = null; await slot.save(); }
    const audit = new ActivityLog({ username: req.user?.username || 'system', role: req.user?.role || 'system', action: 'CHECK_OUT', details: `Vehicle ${vehicle.vehicleNumber} checked out from slot ${vehicle.slotId}, paid ₹${charge}` });
    await audit.save();
    return res.json(vehicle);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function getLiveSlots(req, res) {
  try {
    const slots = await Slot.find({}).populate('currentVehicle');
    return res.json(slots);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function searchVehicles(req, res) {
  const { query, status, type, page = 1, limit = 15 } = req.query;
  const filter = {};
  if (query) { const searchRegex = new RegExp(String(query).trim(), 'i'); filter.$or = [{ vehicleNumber: searchRegex }, { phoneNumber: searchRegex }, { receiptId: searchRegex }, { driverName: searchRegex }]; }
  if (status) filter.status = status;
  if (type) filter.type = type;
  try {
    const skip = (Number(page) - 1) * Number(limit);
    const vehicles = await Vehicle.find(filter).sort({ checkInTime: -1 }).skip(skip).limit(Number(limit));
    const total = await Vehicle.countDocuments(filter);
    return res.json({ vehicles, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

export async function getNotifications(req, res) {
  try {
    const alerts = [];
    const now = new Date();
    const totalSlots = 200;
    const occupiedCount = await Slot.countDocuments({ status: 'occupied' });
    const remaining = totalSlots - occupiedCount;
    if (occupiedCount === totalSlots) {
      alerts.push({ type: 'error', message: 'PARKING FULL: 200/200 slots occupied. Immediate vehicle entry is blocked.', code: 'PARKING_FULL', timestamp: new Date() });
    } else if (remaining <= 5) {
      alerts.push({ type: 'warning', message: `CAPACITY WARNING: Only ${remaining} slots remaining in the facility.`, code: 'LOW_SLOTS', timestamp: new Date() });
    }
    const overstayLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const overstayVehicles = await Vehicle.find({ status: 'parked', checkInTime: { $lt: overstayLimit } });
    overstayVehicles.forEach(vehicle => {
      const hours = Math.round((now.getTime() - vehicle.checkInTime.getTime()) / (1000 * 60 * 60));
      alerts.push({ type: 'info', message: `OVERSTAY ALERT: Vehicle ${vehicle.vehicleNumber} has been parked in ${vehicle.slotId} for ${hours} hours.`, code: 'OVERSTAY', vehicleId: vehicle._id, vehicleNumber: vehicle.vehicleNumber, slotId: vehicle.slotId, hours, timestamp: vehicle.checkInTime });
    });
    return res.json(alerts);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}
