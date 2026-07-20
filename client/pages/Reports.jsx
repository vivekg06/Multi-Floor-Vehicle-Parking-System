import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  FileText, Download, Calendar, Ticket, Compass, CircleDollarSign, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?period=${period}`;
      if (period === 'custom') {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const data = await api.get(url);
      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.records || reportData.records.length === 0) return;

    const headers = [
      'Receipt ID', 'Vehicle Number', 'Vehicle Type', 'Driver Name', 'Phone Number', 
      'Slot', 'Floor', 'Check-In Time', 'Check-Out Time', 'Duration (Hours)', 
      'Rate Applied', 'Amount Paid', 'Status'
    ];

    const rows = reportData.records.map((rec) => [
      rec.receiptId,
      rec.vehicleNumber,
      rec.type,
      rec.driverName || '',
      rec.phoneNumber || '',
      rec.slotId,
      rec.floor,
      new Date(rec.checkInTime).toISOString(),
      rec.checkOutTime ? new Date(rec.checkOutTime).toISOString() : '',
      rec.duration || '',
      rec.rateApplied || '',
      rec.amountPaid || 0,
      rec.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartPark_Report_${period}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Controls Bar */}
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800/80">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row md:items-end gap-4">
          
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Report Range</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="glass-input"
            >
              <option value="daily">Daily (Today)</option>
              <option value="weekly">Weekly (Current Week)</option>
              <option value="monthly">Monthly (Current Month)</option>
              <option value="yearly">Yearly (Current Year)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input font-medium"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 shrink-0">
            {period === 'custom' && (
              <button
                type="submit"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
              >
                Generate
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!reportData || reportData.records.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>

        </form>
      </div>

      {loading ? (
        <div className="h-60 bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-2xl"></div>
      ) : reportData ? (
        <>
          {/* Summary Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-card p-5 border-slate-200 dark:border-slate-800/85 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Entries Count</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{reportData.summary.totalEntries}</span>
                <p className="text-[9px] text-slate-400 mt-1">
                  Cars: {reportData.summary.carEntries} | Bikes: {reportData.summary.bikeEntries}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <Ticket size={20} />
              </div>
            </div>

            <div className="glass-card p-5 border-slate-200 dark:border-slate-800/85 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Exits Count</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{reportData.summary.totalExits}</span>
                <p className="text-[9px] text-slate-400 mt-1">Released tickets cleared</p>
              </div>
              <div className="w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
                <Compass size={20} />
              </div>
            </div>

            <div className="glass-card p-5 border-slate-200 dark:border-slate-800/85 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Revenue Collected</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450">₹{reportData.summary.totalRevenue}</span>
                <p className="text-[9px] text-slate-400 mt-1">Exit fee collections gross</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <CircleDollarSign size={20} />
              </div>
            </div>

            <div className="glass-card p-5 border-slate-200 dark:border-slate-800/85 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Avg Parking Duration</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{reportData.summary.avgDuration} hr(s)</span>
                <p className="text-[9px] text-slate-400 mt-1">Facility dwell time average</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-450 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>

          </div>

          {/* Records Table View */}
          <div className="glass-card border-slate-200 dark:border-slate-800/85 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <h4 className="font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                <FileText size={18} className="text-emerald-500" />
                <span>Transaction Log Details</span>
              </h4>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Receipt ID</th>
                    <th className="px-6 py-3.5">Vehicle Number</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Slot Location</th>
                    <th className="px-6 py-3.5">Check-In</th>
                    <th className="px-6 py-3.5">Check-Out</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Cost Paid</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {reportData.records.length > 0 ? (
                    reportData.records.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="px-6 py-4 font-semibold text-slate-400">{rec.receiptId}</td>
                        <td className="px-6 py-4 font-mono font-bold uppercase text-slate-800 dark:text-slate-200">{rec.vehicleNumber}</td>
                        <td className="px-6 py-4 uppercase text-[10px] text-slate-400">{rec.type}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{rec.slotId} ({rec.floor})</td>
                        <td className="px-6 py-4 text-slate-450 dark:text-slate-500">{formatDate(rec.checkInTime)}</td>
                        <td className="px-6 py-4 text-slate-450 dark:text-slate-500">
                          {rec.checkOutTime ? formatDate(rec.checkOutTime) : '-'}
                        </td>
                        <td className="px-6 py-4">{rec.duration ? `${rec.duration} hr` : '-'}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-450">
                          {rec.amountPaid ? `₹${rec.amountPaid.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider inline-block ${
                            rec.status === 'exited' 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400 animate-pulse'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        No transactions registered in this selected timeframe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
};
