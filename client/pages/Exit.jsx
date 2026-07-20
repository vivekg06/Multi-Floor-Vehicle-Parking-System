import React, { useState } from 'react';
import { api } from '../utils/api';
import { LogOut, Search, Clock, ShieldAlert, CheckCircle2, CircleDollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrintReceiptModal } from '../components/PrintReceiptModal';

export const Exit = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [error, setError] = useState('');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [printedReceipt, setPrintedReceipt] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a vehicle license plate or receipt number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setCheckoutData(null);

    try {
      const data = await api.get(`/api/parking/calculate-exit?search=${searchQuery.trim().toUpperCase()}`);
      setCheckoutData(data);
    } catch (err) {
      setError(err.message || 'No active parked vehicle matches this search criteria.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutData || !checkoutData.vehicle) return;

    setCheckoutLoading(true);
    setError('');

    try {
      const payload = { vehicleId: checkoutData.vehicle._id };
      const response = await api.post('/api/parking/check-out', payload);
      
      setSuccessMsg(`Vehicle ${response.vehicleNumber} checked out successfully! Amount paid: ₹${response.amountPaid}`);
      setPrintedReceipt(response);
      
      // Reset page state
      setCheckoutData(null);
      setSearchQuery('');
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Search Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-slate-200 dark:border-slate-800/80"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vehicle Check-Out Exit</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Search vehicle, calculate duration, collect fee, and release spot</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-450">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter license plate or receipt number..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-semibold uppercase placeholder:normal-case placeholder:font-normal"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>
      </motion.div>

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

      {/* Calculations / Summary Display Card */}
      <AnimatePresence>
        {checkoutData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card border-slate-200 dark:border-slate-800/80 overflow-hidden"
          >
            {/* Upper Panel: Profile summary */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Spot</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {checkoutData.vehicle.slotId} ({checkoutData.vehicle.floor} Floor)
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">Receipt: {checkoutData.vehicle.receiptId}</span>
              </div>
              <div className="md:text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">License Plate</span>
                <span className="text-xl font-mono font-black text-brand-600 dark:text-brand-450 uppercase">
                  {checkoutData.vehicle.vehicleNumber}
                </span>
                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-1">
                  {checkoutData.vehicle.type}
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex gap-3.5 items-start">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Check-In Time</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed block">
                    {formatDate(checkoutData.vehicle.checkInTime)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Duration Elapsed</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-150 block">
                    {checkoutData.duration} hour(s)
                  </span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500">
                    Mode: {checkoutData.chargingMode === 'round_up' ? 'Round Up to Next Hour' : 'Exact Duration'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 rounded-xl flex items-center justify-center shrink-0">
                  <CircleDollarSign size={18} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Fee Calculator</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                    ₹{checkoutData.charge.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500">
                    Rate: ₹{checkoutData.hourlyRate}/hr
                  </span>
                </div>
              </div>

            </div>

            {/* Footer Control Panel */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCheckoutData(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/20 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>{checkoutLoading ? 'Processing Checkout...' : 'Confirm Checkout & Pay'}</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Receipt Print modal overlay */}
      {printedReceipt && (
        <PrintReceiptModal
          vehicle={printedReceipt}
          onClose={() => setPrintedReceipt(null)}
        />
      )}

    </div>
  );
};
