import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Save, ShieldAlert, CheckCircle2, Car, Bike, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsPage = () => {
  const [ratesCar, setRatesCar] = useState(80);
  const [ratesBike, setRatesBike] = useState(50);
  const [chargingMode, setChargingMode] = useState('exact');
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/settings');
      setRatesCar(data.rates_car);
      setRatesBike(data.rates_bike);
      setChargingMode(data.charging_mode);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/api/settings', {
        rates_car: Number(ratesCar),
        rates_bike: Number(ratesBike),
        charging_mode: chargingMode
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto h-64 bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-2xl"></div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-slate-200 dark:border-slate-800/80"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">System Configurations</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Configure active hourly parking rates and billing options</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/45 rounded-xl text-red-750 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/45 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Configurations updated successfully!</span>
            </div>
          )}

          {/* Pricing Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Car size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Car Hourly Rate (₹)</span>
              </label>
              <input
                type="number"
                value={ratesCar}
                onChange={(e) => setRatesCar(Number(e.target.value))}
                min={0}
                className="glass-input font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Bike size={14} className="text-blue-500" />
                <span>Bike Hourly Rate (₹)</span>
              </label>
              <input
                type="number"
                value={ratesBike}
                onChange={(e) => setRatesBike(Number(e.target.value))}
                min={0}
                className="glass-input font-bold"
              />
            </div>

          </div>

          {/* Billing Calculation Modes */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Billing Cost Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setChargingMode('exact')}
                className={`p-4 rounded-xl border font-bold text-left flex flex-col gap-1 transition-all ${
                  chargingMode === 'exact'
                    ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-500 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">Exact Duration</span>
                <span className="text-[10px] font-normal opacity-80">Pro-rata billing based on decimal hours parked.</span>
              </button>

              <button
                type="button"
                onClick={() => setChargingMode('round_up')}
                className={`p-4 rounded-xl border font-bold text-left flex flex-col gap-1 transition-all ${
                  chargingMode === 'round_up'
                    ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-500 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">Round Up to Next Hour</span>
                <span className="text-[10px] font-normal opacity-80">Fractions of an hour are rounded up to the nearest integer hour.</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saveLoading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            <span>{saveLoading ? 'Updating System Configs...' : 'Save Configurations'}</span>
          </button>
        </form>
      </motion.div>

    </div>
  );
};
export default SettingsPage;
