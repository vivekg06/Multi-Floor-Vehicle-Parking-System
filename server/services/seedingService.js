import { User } from '../models/User.js';
import { Slot } from '../models/Slot.js';
import { Vehicle } from '../models/Vehicle.js';
import { Setting } from '../models/Setting.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { BackupLog } from '../models/BackupLog.js';

function generateIndianLicensePlate(type) {
  const states = ['MH', 'DL', 'KA', 'HR', 'UP', 'TN', 'GJ', 'TS', 'KL', 'AP'];
  const state = states[Math.floor(Math.random() * states.length)];
  const district = String(Math.floor(Math.random() * 98) + 1).padStart(2, '0');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seriesLength = type === 'car' ? 2 : (Math.random() > 0.5 ? 2 : 1);
  let series = '';
  for (let i = 0; i < seriesLength; i++) series += alphabet[Math.floor(Math.random() * alphabet.length)];
  const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `${state}${district}${series}${number}`;
}

function generatePhoneNumber() {
  const prefixes = ['98', '97', '96', '95', '88', '87', '70', '81', '99'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${String(Math.floor(Math.random() * 89999999) + 10000000)}`;
}

const indianNames = ['Amit Sharma', 'Rahul Verma', 'Priya Patel', 'Suresh Kumar', 'Sunita Rao', 'Vijay Singh', 'Deepika Padhi', 'Rajesh Gupta', 'Vikram Malhotra', 'Neha Joshi', 'Anil Mehta', 'Rohan Deshmukh', 'Pooja Reddy', 'Siddharth Iyer', 'Ananya Sen', 'Harish Chaudhary', 'Divya Nair', 'Sanjay Dutt', 'Arjun Kapoor', 'Jyoti Bansal', 'Kunal Roy', 'Meera Krishnan', 'Ganesh Murthy', 'Shruti Hegde', 'Pranav Mishra', 'Ritu Saxena', 'Karan Johar', 'Shweta Tiwari', 'Vivek Oberoi', 'Aditi Rao'];
const getRandomName = () => indianNames[Math.floor(Math.random() * indianNames.length)];

export const slotTemplates = [];
for (let i = 1; i <= 70; i++) slotTemplates.push({ slotId: `A${String(i).padStart(3, '0')}`, floor: 'Ground', type: i <= 50 ? 'car' : 'bike' });
for (let i = 1; i <= 70; i++) slotTemplates.push({ slotId: `B${String(i).padStart(3, '0')}`, floor: 'First', type: i <= 50 ? 'car' : 'bike' });
for (let i = 1; i <= 60; i++) slotTemplates.push({ slotId: `C${String(i).padStart(3, '0')}`, floor: 'Second', type: i <= 40 ? 'car' : 'bike' });

export async function seedDemoData() {
  console.log('Seeding Database... Wiping existing data.');
  await User.deleteMany({}); await Slot.deleteMany({}); await Vehicle.deleteMany({}); await Setting.deleteMany({}); await ActivityLog.deleteMany({}); await BackupLog.deleteMany({});

  const adminUser = new User({ username: 'admin', password: 'admin123', role: 'admin' });
  const supervisorUser = new User({ username: 'supervisor', password: 'supervisor123', role: 'supervisor' });
  const staffUser = new User({ username: 'staff', password: 'staff123', role: 'staff' });
  await adminUser.save(); await supervisorUser.save(); await staffUser.save();
  console.log('Users seeded.');

  await Setting.insertMany([{ key: 'rates_car', value: 80 }, { key: 'rates_bike', value: 50 }, { key: 'charging_mode', value: 'exact' }]);
  console.log('Settings seeded.');

  await Slot.insertMany(slotTemplates.map(s => ({ ...s, status: 'available', currentVehicle: null })));
  console.log('Slots seeded.');

  console.log('Generating 5000+ transaction logs...');
  const logs = [];
  const now = new Date();
  const slotUsageCount = {};
  slotTemplates.forEach(s => { slotUsageCount[s.slotId] = 0; });

  for (let d = 180; d > 0; d--) {
    const currentDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const dailyCount = (isWeekend ? 38 : 25) + Math.floor(Math.random() * 15) - 5;
    for (let j = 0; j < dailyCount; j++) {
      const vehicleType = Math.random() > 0.35 ? 'car' : 'bike';
      let checkInHour = 9;
      const rand = Math.random();
      if (rand < 0.3) checkInHour = 8 + Math.floor(Math.random() * 3);
      else if (rand < 0.5) checkInHour = 12 + Math.floor(Math.random() * 3);
      else if (rand < 0.85) checkInHour = 17 + Math.floor(Math.random() * 3);
      else checkInHour = Math.floor(Math.random() * 24);
      const checkInTime = new Date(currentDate);
      checkInTime.setHours(checkInHour, Math.floor(Math.random() * 60), 0, 0);
      let durationHours = 1 + Math.random() * 5;
      if (Math.random() > 0.96) durationHours = 10 + Math.random() * 18;
      const checkOutTime = new Date(checkInTime.getTime() + durationHours * 60 * 60 * 1000);
      const matchSlots = slotTemplates.filter(s => s.type === vehicleType);
      const randomSlot = matchSlots[Math.floor(Math.random() * matchSlots.length)];
      slotUsageCount[randomSlot.slotId]++;
      const rate = vehicleType === 'car' ? 80 : 50;
      const mode = Math.random() > 0.5 ? 'exact' : 'round_up';
      const cost = mode === 'round_up' ? Math.ceil(durationHours) * rate : Math.round(durationHours * rate * 100) / 100;
      logs.push({ vehicleNumber: generateIndianLicensePlate(vehicleType), type: vehicleType, driverName: getRandomName(), phoneNumber: generatePhoneNumber(), slotId: randomSlot.slotId, floor: randomSlot.floor, checkInTime, checkOutTime, duration: Math.round(durationHours * 100) / 100, rateApplied: rate, chargingMode: mode, amountPaid: cost, paymentStatus: 'paid', status: 'exited', receiptId: `REC-${checkInTime.getTime()}-${Math.floor(Math.random() * 1000)}` });
    }
  }

  for (let i = 0; i < logs.length; i += 1000) await Vehicle.insertMany(logs.slice(i, i + 1000));
  console.log(`Inserted ${logs.length} historical logs.`);

  console.log('Seeding 100 currently parked vehicles...');
  const allSlots = await Slot.find({});
  const shuffledSlots = [...allSlots].sort(() => 0.5 - Math.random());
  for (let i = 0; i < 100 && i < shuffledSlots.length; i++) {
    const slot = shuffledSlots[i];
    const vehicleType = slot.type;
    const checkInTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const vehicle = new Vehicle({ vehicleNumber: generateIndianLicensePlate(vehicleType), type: vehicleType, driverName: getRandomName(), phoneNumber: generatePhoneNumber(), slotId: slot.slotId, floor: slot.floor, checkInTime, checkOutTime: null, duration: null, rateApplied: null, amountPaid: 0, paymentStatus: 'pending', status: 'parked', receiptId: `REC-${checkInTime.getTime()}-${Math.floor(Math.random() * 1000)}` });
    await vehicle.save();
    slot.status = 'occupied'; slot.currentVehicle = vehicle._id; await slot.save();
  }
  console.log('Parked 100 vehicles.');

  const backupLogs = [];
  for (let i = 5; i > 0; i--) {
    const backupDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    backupDate.setHours(0, 0, 0, 0);
    backupLogs.push({ filename: `backup_${backupDate.getFullYear()}-${String(backupDate.getMonth()+1).padStart(2,'0')}-${String(backupDate.getDate()).padStart(2,'0')}_000000.json`, date: backupDate, size: 1048576 + Math.floor(Math.random() * 524288), recordsCount: 4500 + (5 - i) * 30, status: 'success' });
  }
  await BackupLog.insertMany(backupLogs);

  await ActivityLog.insertMany([
    { username: 'admin', role: 'admin', action: 'LOGIN', details: 'Admin logged in successfully', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { username: 'admin', role: 'admin', action: 'SETTING_UPDATE', details: 'Updated base rates: Car=₹80, Bike=₹50', timestamp: new Date(now.getTime() - 1.9 * 60 * 60 * 1000) },
    { username: 'staff', role: 'staff', action: 'LOGIN', details: 'Staff logged in successfully', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
    { username: 'staff', role: 'staff', action: 'CHECK_IN', details: 'Vehicle DL3CD5678 checked into slot B003', timestamp: new Date(now.getTime() - 45 * 60 * 1000) },
    { username: 'staff', role: 'staff', action: 'CHECK_OUT', details: 'Vehicle MH12AB1234 exited from slot A012, paid ₹160', timestamp: new Date(now.getTime() - 15 * 60 * 1000) },
    { username: 'admin', role: 'admin', action: 'BACKUP_CREATED', details: 'Scheduled system backup completed successfully', timestamp: new Date(now.getTime() - 11 * 60 * 60 * 1000) },
  ]);

  console.log('Database Seeding Completed Successfully.');
}
