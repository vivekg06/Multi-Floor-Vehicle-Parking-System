import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Car, Bike, Info, ShieldAlert, Sparkles, Receipt, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrintReceiptModal } from '../components/PrintReceiptModal';
import { useAuth } from '../context/AuthContext';

export const ParkingMap = () => {
  const { isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('Ground');
  
  // Slot selection for vehicle detail popup
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Checkout calculators
  const [checkoutCalc, setCheckoutCalc] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/parking/live-slots');
      setSlots(data);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setCheckoutCalc(null); // Reset checkout state
  };

  const handleCalculateCheckout = async () => {
    if (!selectedSlot || !selectedSlot.currentVehicle) return;
    
    setCheckoutLoading(true);
    try {
      const searchKey = selectedSlot.currentVehicle.vehicleNumber;
      const data = await api.get(`/api/parking/calculate-exit?search=${searchKey}`);
      setCheckoutCalc(data);
    } catch (error) {
      console.error('Checkout calculations failed:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleProcessCheckout = async () => {
    if (!selectedSlot || !selectedSlot.currentVehicle) return;
    
    setCheckoutLoading(true);
    try {
      const payload = { vehicleId: selectedSlot.currentVehicle._id };
      const finalized = await api.post('/api/parking/check-out', payload);
      
      // Update slots map
      setSlots(prev => prev.map(s => {
        if (s.slotId === selectedSlot.slotId) {
          return { ...s, status: 'available', currentVehicle: null };
        }
        return s;
      }));
      
      setPrintedReceipt(finalized);
      setSelectedSlot(null);
      setCheckoutCalc(null);
    } catch (error) {
      console.error('Checkout check-out processing failed:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Filter slots for current floor
  const floorSlots = slots.filter(s => s.floor === activeFloor);

  // Stats summaries
  const totalOnFloor = floorSlots.length;
  const occupiedOnFloor = floorSlots.filter(s => s.status === 'occupied').length;
  const vacantOnFloor = totalOnFloor - occupiedOnFloor;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Floor navigation tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        
        <div className="flex gap-2">
          {['Ground', 'First', 'Second'].map(floor => (
            <button
              key={floor}
              onClick={() => {
                setActiveFloor(floor);
                setSelectedSlot(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                activeFloor === floor 
                  ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              {floor} Floor
            </button>
          ))}
        </div>

        {/* Legend stats */}
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
            <span className="w-2.5 h-2.5 rounded bg-brand-500"></span>
            <span>Vacant ({vacantOnFloor})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg">
            <span className="w-2.5 h-2.5 rounded bg-red-500 animate-occupied"></span>
            <span>Occupied ({occupiedOnFloor})</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
            <span>Total: {totalOnFloor} spots</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
          {Array.from({ length: 70 }).map((_, idx) => (
            <div key={idx} className="h-14 bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        /* Slots Map grid layout */
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {floorSlots.map((slot) => {
            const isOccupied = slot.status === 'occupied';
            const vehicle = slot.currentVehicle;

            return (
              <motion.div
                key={slot.slotId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSlotClick(slot)}
                className={`h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isOccupied
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 font-bold hover:shadow-lg hover:shadow-red-500/10'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:shadow-lg hover:shadow-brand-500/10'
                }`}
              >
                <span className="text-[10px] opacity-60 block">{slot.slotId}</span>
                <div className="flex items-center gap-1">
                  {slot.type === 'car' ? <Car size={15} /> : <Bike size={15} />}
                  {isOccupied && (
                    <span className="text-[10px] font-mono tracking-tighter truncate max-w-[50px] uppercase">
                      {vehicle?.vehicleNumber ? `${vehicle.vehicleNumber.slice(-4)}` : ''}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected Slot Vehicle Detail Popover (Modal) */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Info size={20} className="text-brand-500" />
                  <span>Spot Details: {selectedSlot.slotId}</span>
                </h3>
                <button
                  onClick={() => { setSelectedSlot(null); setCheckoutCalc(null); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-350">
                {selectedSlot.status === 'occupied' ? (
                  <>
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">License Plate:</span>
                      <span className="font-mono font-bold uppercase text-slate-800 dark:text-slate-100">
                        {selectedSlot.currentVehicle?.vehicleNumber}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Vehicle Type:</span>
                      <span className="font-bold uppercase text-slate-800 dark:text-slate-100">
                        {selectedSlot.currentVehicle?.type}
                      </span>
                    </div>
                    {selectedSlot.currentVehicle?.driverName && (
                      <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">Driver Name:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {selectedSlot.currentVehicle.driverName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Check-In Time:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {selectedSlot.currentVehicle?.checkInTime ? formatDate(selectedSlot.currentVehicle.checkInTime) : ''}
                      </span>
                    </div>

                    {/* Show Checkout calculation panel if loaded */}
                    {checkoutCalc ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2 mt-4">
                        <div className="flex justify-between text-xs">
                          <span>Duration:</span>
                          <span className="font-bold">{checkoutCalc.duration} hour(s)</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Hourly Rate:</span>
                          <span className="font-bold">₹{checkoutCalc.hourlyRate}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-800 dark:text-slate-250">Final Charges:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-450 text-base">₹{checkoutCalc.charge}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-2">
                        Click "Process Checkout" below to calculate parking fees and check-out the vehicle.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Spot Status:</span>
                      <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold text-xs">
                        AVAILABLE / VACANT
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Floor Level:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {selectedSlot.floor} Floor
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Parking Type:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">
                        {selectedSlot.type} Parking Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-2">
                      This parking spot is vacant. You can direct new incoming vehicles of type "{selectedSlot.type}" to this spot.
                    </p>
                  </>
                )}
              </div>

              {/* Action Controls for Staff/Admins */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex gap-3">
                <button
                  onClick={() => { setSelectedSlot(null); setCheckoutCalc(null); }}
                  className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold text-sm"
                >
                  Close
                </button>
                {selectedSlot.status === 'occupied' && (isAdmin || isStaff) && (
                  checkoutCalc ? (
                    <button
                      onClick={handleProcessCheckout}
                      disabled={checkoutLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-brand-600 text-white font-bold rounded-xl text-sm shadow-md"
                    >
                      <Receipt size={16} />
                      <span>{checkoutLoading ? 'Processing...' : 'Confirm Payment & Release'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCalculateCheckout}
                      disabled={checkoutLoading}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white font-bold rounded-xl text-sm shadow-md"
                    >
                      <span>Checkout Invoice</span>
                    </button>
                  )
                )}
                {selectedSlot.status === 'available' && (isAdmin || isStaff) && (
                  <button
                    onClick={() => { setSelectedSlot(null); navigate('/entry'); }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    <span>Check-In Vehicle</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Receipt Print Modal overlay */}
      {printedReceipt && (
        <PrintReceiptModal
          vehicle={printedReceipt}
          onClose={() => setPrintedReceipt(null)}
        />
      )}

    </div>
  );
};
