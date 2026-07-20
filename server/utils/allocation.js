import { Slot } from '../models/Slot.js';

/**
 * Finds the nearest available slot for a given vehicle type (car or bike).
 * Prioritizes floors in order: Ground -> First -> Second.
 * Within each floor, prioritizes the lowest slot number.
 */
export async function findNearestAvailableSlot(vehicleType) {
  const availableSlots = await Slot.find({ type: vehicleType, status: 'available' });

  if (availableSlots.length === 0) return null;

  const floorPriority = { 'Ground': 1, 'First': 2, 'Second': 3 };

  availableSlots.sort((a, b) => {
    const priorityA = floorPriority[a.floor] || 99;
    const priorityB = floorPriority[b.floor] || 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.slotId.localeCompare(b.slotId);
  });

  return availableSlots[0];
}
