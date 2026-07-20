import React, { useState } from 'react';
import { api } from '../utils/api';
import { Car, Bike, User, Phone, CheckCircle2, Ticket, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { PrintReceiptModal } from '../components/PrintReceiptModal';

export const Entry = () => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState('car');
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [ticketData, setTicketData] = useState(null);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please provide a valid license plate number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        type,
        driverName: driverName.trim(),
        phoneNumber: phoneNumber.trim()
      };

      const response = await api.post('/api/parking/check-in', payload);
      
      setSuccessMsg(`Vehicle Check-in Successful! Assigned Spot: ${response.slotId} (${response.floor} Floor)`);
      setTicketData(response);

      // Reset form fields
      setVehicleNumber('');
      setDriverName('');
      setPhoneNumber('');
    } catch (err) {
      setError(err.message || 'Check-in failed. Please verify slot availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-slate-200 dark:border-slate-800/80"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Ticket size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vehicle Check-In Entry</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Auto-allocate nearest available parking slot</p>
          </div>
        </div>

        <form onSubmit={handleCheckIn} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Vehicle Type Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('car')}
                className={`py-4 rounded-xl border font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                  type === 'car'
                    ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-500 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Car size={24} />
                <span>Four Wheeler / Car</span>
              </button>
              <button
                type="button"
                onClick={() => setType('bike')}
                className={`py-4 rounded-xl border font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                  type === 'bike'
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Bike size={24} />
                <span>Two Wheeler / Bike</span>
              </button>
            </div>
          </div>

          {/* License Plate Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">License Plate Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                {type === 'car' ? <Car size={18} /> : <Bike size={18} />}
              </div>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. MH12AB1234"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono font-bold uppercase placeholder:font-sans placeholder:font-normal"
              />
            </div>
            <p className="text-[10px] text-slate-400">Supports standard Indian license plate formatting (letters & digits).</p>
          </div>

          {/* Optional Driver Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Driver Name (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Phone Number (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Allocating Spot & Saving...' : 'Submit Entry & Print Ticket'}
          </button>
        </form>
      </motion.div>

      {/* Ticket/Receipt popup overlay */}
      {ticketData && (
        <PrintReceiptModal
          vehicle={ticketData}
          onClose={() => setTicketData(null)}
        />
      )}

    </div>
  );
};
