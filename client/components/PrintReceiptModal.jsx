import React from 'react';
import { Printer, X, AlertTriangle } from 'lucide-react';

export const PrintReceiptModal = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Parking Receipt</h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Printable Area */}
        <div id="receipt-print-area" className="p-6 bg-white text-slate-900 print-card">
          {/* Print only header */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-xl font-bold tracking-tight">SmartPark Facility</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Receipt No: {vehicle.receiptId}</p>
            <div className="border-b border-dashed border-slate-300 my-4"></div>
          </div>

          {/* Logo / Branding */}
          <div className="text-center mb-6 print:hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-2">
              <Printer size={24} />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100">SmartPark Facility</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Receipt No: {vehicle.receiptId}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Vehicle Number:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 print:text-black uppercase">
                {vehicle.vehicleNumber.slice(0,2)}-{vehicle.vehicleNumber.slice(2,4)}-{vehicle.vehicleNumber.slice(4,6)}-{vehicle.vehicleNumber.slice(6)}
              </span>
            </div>

            <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Vehicle Type:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 print:text-black uppercase">
                {vehicle.type}
              </span>
            </div>

            <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Assigned Slot:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 print:text-black">
                {vehicle.slotId} ({vehicle.floor} Floor)
              </span>
            </div>

            {vehicle.driverName && (
              <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Driver Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 print:text-black">
                  {vehicle.driverName}
                </span>
              </div>
            )}

            <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Check-In Time:</span>
              <span className="text-slate-800 dark:text-slate-100 print:text-black">
                {formatDate(vehicle.checkInTime)}
              </span>
            </div>

            {vehicle.checkOutTime ? (
              <>
                <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
                  <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Check-Out Time:</span>
                  <span className="text-slate-800 dark:text-slate-100 print:text-black">
                    {formatDate(vehicle.checkOutTime)}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
                  <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Duration:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 print:text-black">
                    {vehicle.duration} hour(s)
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800/40 print:border-slate-200">
                  <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">Hourly Rate:</span>
                  <span className="text-slate-800 dark:text-slate-100 print:text-black">
                    ₹{vehicle.rateApplied}/hr ({vehicle.chargingMode === 'round_up' ? 'Rounded Up' : 'Exact'})
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-double border-slate-300 dark:border-slate-700/80 print:border-slate-400 mt-4">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 print:text-black">Total Paid:</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 print:text-black">
                    ₹{vehicle.amountPaid?.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl p-3 flex gap-2 text-amber-700 dark:text-amber-300 mt-4 print:hidden">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Active Booking Ticket</p>
                  <p className="text-[11px] opacity-90">Charges will be calculated upon check-out exit.</p>
                </div>
              </div>
            )}
          </div>

          <div className="hidden print:block text-center mt-8 text-xs text-slate-400">
            <p>Thank you for choosing SmartPark!</p>
            <p>Please keep this receipt safe.</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/20 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg transition-all"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
