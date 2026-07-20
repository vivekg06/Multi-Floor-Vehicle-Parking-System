import { Slot } from '../models/Slot.js';
import { Vehicle } from '../models/Vehicle.js';

// Get Dashboard Overview Statistics
export async function getDashboardStats(req, res) {
  try {
    const totalCapacity = 200;
    const occupiedCount = await Slot.countDocuments({ status: 'occupied' });
    const availableSlots = totalCapacity - occupiedCount;
    const occupancyPercentage = Math.round((occupiedCount / totalCapacity) * 100);

    const carsInside = await Vehicle.countDocuments({ status: 'parked', type: 'car' });
    const bikesInside = await Vehicle.countDocuments({ status: 'parked', type: 'bike' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEntries = await Vehicle.countDocuments({ checkInTime: { $gte: todayStart } });
    const todayExits = await Vehicle.countDocuments({ status: 'exited', checkOutTime: { $gte: todayStart } });

    const revenueTodayQuery = await Vehicle.aggregate([
      { $match: { status: 'exited', checkOutTime: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const revenueToday = revenueTodayQuery[0]?.total || 0;

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const revenueMonthlyQuery = await Vehicle.aggregate([
      { $match: { status: 'exited', checkOutTime: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const revenueMonthly = revenueMonthlyQuery[0]?.total || 0;

    return res.json({
      totalCapacity, availableSlots, occupiedSlots: occupiedCount,
      carsInside, bikesInside, todayEntries, todayExits,
      revenueToday: Math.round(revenueToday * 100) / 100,
      revenueMonthly: Math.round(revenueMonthly * 100) / 100,
      occupancyPercentage
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Get Analytical Charts & Ratios
export async function getAnalytics(req, res) {
  try {
    const now = new Date();

    const peakHoursQuery = await Vehicle.aggregate([
      { $project: { hour: { $hour: { date: '$checkInTime', timezone: 'Asia/Kolkata' } } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const peakHours = Array.from({ length: 24 }, (_, h) => {
      const match = peakHoursQuery.find(p => p._id === h);
      return { hour: `${String(h).padStart(2, '0')}:00`, count: match ? match.count : 0 };
    });

    const averagesQuery = await Vehicle.aggregate([
      { $match: { status: 'exited' } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' }, avgRevenue: { $avg: '$amountPaid' } } }
    ]);
    const avgDuration = averagesQuery[0]?.avgDuration || 0;
    const avgRevenue = averagesQuery[0]?.avgRevenue || 0;

    const vehicleRatioQuery = await Vehicle.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const ratioData = {
      car: vehicleRatioQuery.find(r => r._id === 'car')?.count || 0,
      bike: vehicleRatioQuery.find(r => r._id === 'bike')?.count || 0,
    };

    const floorOccupancy = await Slot.aggregate([
      { $group: { _id: { floor: '$floor', status: '$status' }, count: { $sum: 1 } } }
    ]);
    const floorData = ['Ground', 'First', 'Second'].map(floor => {
      const occupied = floorOccupancy.find(f => f._id.floor === floor && f._id.status === 'occupied')?.count || 0;
      const available = floorOccupancy.find(f => f._id.floor === floor && f._id.status === 'available')?.count || 0;
      const total = occupied + available;
      return { floor: `${floor} Floor`, occupied, available, total, percentage: total > 0 ? Math.round((occupied / total) * 100) : 0 };
    });

    const topSlotsQuery = await Vehicle.aggregate([
      { $group: { _id: '$slotId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const topSlots = topSlotsQuery.map(s => ({ slotId: s._id, usageCount: s.count }));

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const dailyRevenueQuery = await Vehicle.aggregate([
      { $match: { status: 'exited', checkOutTime: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkOutTime', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const match = dailyRevenueQuery.find(d => d._id === dateString);
      dailyRevenue.push({ date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), revenue: match ? Math.round(match.revenue * 100) / 100 : 0, transactions: match ? match.count : 0 });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const monthlyRevenueQuery = await Vehicle.aggregate([
      { $match: { status: 'exited', checkOutTime: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$checkOutTime', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const match = monthlyRevenueQuery.find(m => m._id === yearMonth);
      monthlyRevenue.push({ month: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), revenue: match ? Math.round(match.revenue * 100) / 100 : 0, transactions: match ? match.count : 0 });
    }

    const highestRevenueQuery = await Vehicle.aggregate([
      { $match: { status: 'exited' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkOutTime', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$amountPaid' } } },
      { $sort: { revenue: -1 } },
      { $limit: 1 }
    ]);
    let highestRevenueDay = { date: 'N/A', amount: 0 };
    if (highestRevenueQuery.length > 0) {
      const dateObj = new Date(highestRevenueQuery[0]._id);
      highestRevenueDay = { date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), amount: Math.round(highestRevenueQuery[0].revenue * 100) / 100 };
    }

    return res.json({ peakHours, avgDuration: Math.round(avgDuration * 100) / 100, avgRevenue: Math.round(avgRevenue * 100) / 100, ratioData, floorData, topSlots, dailyRevenue, monthlyRevenue, highestRevenueDay });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
