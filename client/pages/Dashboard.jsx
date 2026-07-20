import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { DashboardCard } from '../components/DashboardCard';
import { DashboardCardSkeleton } from '../components/LoadingSkeleton';
import { 
  Compass, ShieldCheck, Ban, Car, Bike, ArrowUpRight, ArrowDownRight, 
  CircleDollarSign, CalendarDays, Percent, BarChart3, PieChart as PieIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, chartsData] = await Promise.all([
        api.get('/api/analytics/stats'),
        api.get('/api/analytics/charts')
      ]);
      setStats(statsData);
      setCharts(chartsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <DashboardCardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 h-[350px] animate-pulse"></div>
          <div className="glass-card p-6 h-[350px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Pie chart colors
  const COLORS = ['#22c55e', '#3b82f6']; // car vs bike
  const pieData = charts ? [
    { name: 'Cars', value: charts.ratioData.car },
    { name: 'Bikes', value: charts.ratioData.bike }
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Slots Capacity"
          value={stats?.totalCapacity || 200}
          icon={<Compass size={22} />}
          color="blue"
          subtitle="Fixed Facility Maximum"
          delay={0.05}
          onClick={() => navigate('/map')}
        />
        <DashboardCard
          title="Available Slots"
          value={stats?.availableSlots || 0}
          icon={<ShieldCheck size={22} />}
          color="brand"
          subtitle="Vacant Slots Available"
          delay={0.1}
          onClick={() => navigate('/map')}
        />
        <DashboardCard
          title="Occupied Slots"
          value={stats?.occupiedSlots || 0}
          icon={<Ban size={22} />}
          color="red"
          subtitle={`${stats?.occupancyPercentage || 0}% Total Occupancy`}
          delay={0.15}
          onClick={() => navigate('/map')}
        />
        <DashboardCard
          title="Occupancy Percentage"
          value={`${stats?.occupancyPercentage || 0}%`}
          icon={<Percent size={22} />}
          color="purple"
          subtitle="Real-time fill rate"
          delay={0.2}
          onClick={() => navigate('/map')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Cars Parked Inside"
          value={stats?.carsInside || 0}
          icon={<Car size={22} />}
          color="indigo"
          subtitle="Active Car Slots occupied"
          delay={0.25}
          onClick={() => navigate('/map')}
        />
        <DashboardCard
          title="Bikes Parked Inside"
          value={stats?.bikesInside || 0}
          icon={<Bike size={22} />}
          color="amber"
          subtitle="Active Bike Slots occupied"
          delay={0.3}
          onClick={() => navigate('/map')}
        />
        <DashboardCard
          title="Today's Check-ins"
          value={stats?.todayEntries || 0}
          icon={<ArrowUpRight size={22} />}
          color="brand"
          subtitle="Total entries since midnight"
          delay={0.35}
          onClick={() => navigate('/reports')}
        />
        <DashboardCard
          title="Today's Check-outs"
          value={stats?.todayExits || 0}
          icon={<ArrowDownRight size={22} />}
          color="red"
          subtitle="Released vehicles today"
          delay={0.4}
          onClick={() => navigate('/reports')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Today's Revenue Flow"
          value={`₹${stats?.revenueToday || 0}`}
          icon={<CircleDollarSign size={22} />}
          color="brand"
          subtitle="Cleared exits billing"
          delay={0.45}
          onClick={() => navigate('/analytics')}
        />
        <DashboardCard
          title="Monthly Cash Flow"
          value={`₹${stats?.revenueMonthly || 0}`}
          icon={<CalendarDays size={22} />}
          color="purple"
          subtitle="Current calendar month total"
          delay={0.5}
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Revenue Area Chart (Last 30 Days) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="lg:col-span-2 glass-card p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800/80"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-500" />
                <span>30-Day Revenue Trend</span>
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">Facility daily checkout collections</p>
            </div>
            {charts?.highestRevenueDay && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Peak Day</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {charts.highestRevenueDay.date} (₹{charts.highestRevenueDay.amount})
                </span>
              </div>
            )}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.dailyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vehicle Ratio Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card p-6 flex flex-col justify-between border-slate-200 dark:border-slate-800/80"
        >
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieIcon size={18} className="text-blue-500" />
              <span>Vehicle Load Distribution</span>
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Historical vehicle booking count ratio</p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            {pieData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No database transactions seeded yet.</span>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-around text-center text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Total Cars</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{charts?.ratioData?.car || 0}</span>
            </div>
            <div className="border-r border-slate-100 dark:border-slate-800"></div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Total Bikes</span>
              <span className="font-bold text-blue-500 text-sm">{charts?.ratioData?.bike || 0}</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
