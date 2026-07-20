import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Clock, Landmark, Layers, BarChart, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar
} from 'recharts';

export const Analytics = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/analytics/charts');
      setCharts(data);
    } catch (error) {
      console.error('Failed to load charts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-32 bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800/85 animate-pulse rounded-2xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800/85 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center justify-between border-slate-200 dark:border-slate-800/80"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Avg Parking Duration</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{charts?.avgDuration || 0} hour(s)</h3>
            <p className="text-[10px] text-slate-400">Total dwell time average per vehicle</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border border-blue-200/20 rounded-xl flex items-center justify-center">
            <Clock size={22} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 flex items-center justify-between border-slate-200 dark:border-slate-800/80"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Avg Ticket Ticket Revenue</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{charts?.avgRevenue || 0}</h3>
            <p className="text-[10px] text-slate-400">Gross check-out billing average</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-200/20 rounded-xl flex items-center justify-center">
            <Landmark size={22} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex items-center justify-between border-slate-200 dark:border-slate-800/80"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Peak Revenue Yield</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">₹{charts?.highestRevenueDay?.amount || 0}</h3>
            <p className="text-[10px] text-slate-400">Recorded on {charts?.highestRevenueDay?.date || 'N/A'}</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-450 border border-purple-200/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak entry hours check-in distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 border-slate-200 dark:border-slate-800/80"
        >
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
              <BarChart size={18} className="text-brand-500" />
              <span>Facility Hourly Traffic (Peak Hours)</span>
            </h4>
            <p className="text-xs text-slate-400">Total historical check-in counts aggregated by hour of day</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={charts?.peakHours || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="count" name="Vehicles Entered" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Used spots popularity index */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border-slate-200 dark:border-slate-800/80"
        >
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <span>Slot Popularity Index (Top 10 Slots)</span>
            </h4>
            <p className="text-xs text-slate-400">Total historical checks completed by slot address</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={charts?.topSlots || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="slotId" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="usageCount" name="Check-ins Completed" fill="#eab308" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Floor Wise occupancy current load details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 border-slate-200 dark:border-slate-800/80 flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
              <Layers size={18} className="text-brand-500" />
              <span>Floor Level Capacities</span>
            </h4>
            <p className="text-xs text-slate-400 mb-6">Current fill volumes by physical floor</p>
          </div>
          
          <div className="space-y-4">
            {charts?.floorData.map((floorObj, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{floorObj.floor}</span>
                  <span>{floorObj.occupied} / {floorObj.total} Occupied ({floorObj.percentage}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${floorObj.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 6-Month revenue timeline comparison */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6 border-slate-200 dark:border-slate-800/80"
        >
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-500" />
              <span>6-Month Monthly Revenue Flow</span>
            </h4>
            <p className="text-xs text-slate-400">Sum of exit ticket amounts accumulated calendar-wise</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={charts?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="revenue" name="Collections (₹)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
