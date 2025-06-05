import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, User, Calendar, MessageCircle, AlertTriangle, Car, MapPin, Fuel, Edit3, Check, Phone, Info } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CalendarBooking } from '@/types/calendar';
import { CARBE_COMMISSION_PERCENT, SERVICE_FEE_PERCENT } from '@/constants/pricing';
import { cancelBooking, messageGuest, callGuest, updateBookingDetails } from '@/lib/booking/actions';

interface BookingDetailsSheetProps {
  isOpen: boolean;
  booking: CalendarBooking;
  onMessage?: () => void;
  onCancel?: () => Promise<void>;
  onClose: () => void;
}

export default function BookingDetailsSheet({
  isOpen,
  booking,
  onMessage,
  onCancel,
  onClose
}: BookingDetailsSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Editable fields state
  const [editingFuel, setEditingFuel] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  
  const [fuelDeposit, setFuelDeposit] = useState(50); // Default €50, but editable
  const [pickupLocation, setPickupLocation] = useState("123 Main Street, Brussels\nMeet at parking spot #15");
  const [additionalInfo, setAdditionalInfo] = useState("Check-in instructions will be sent 24h before pickup. Vehicle has GPS tracking.");

  const startDate = parseISO(booking.start_date);
  const endDate = parseISO(booking.end_date);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Price calculations
  const subtotal = booking.daily_rate * nights;
  const serviceFee = Math.round(subtotal * (SERVICE_FEE_PERCENT / 100));
  const carbeCommission = Math.round(subtotal * (CARBE_COMMISSION_PERCENT / 100));
  const hostEarnings = subtotal - carbeCommission;
  const totalToGuest = subtotal + serviceFee + fuelDeposit;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150 || info.velocity.y > 300) {
      onClose();
    }
    setDragY(0);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelBooking(booking.id);
      if (onCancel) await onCancel();
      onClose();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleMessage = async () => {
    try {
      await messageGuest(booking.id);
      if (onMessage) onMessage();
      onClose();
    } catch (error) {
      console.error('Failed to open chat:', error);
    }
  };

  const handleCall = async () => {
    try {
      await callGuest(booking.guest_email);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const getStatusInfo = () => {
    const now = new Date();
    const isUpcoming = now < startDate;
    const isActive = now >= startDate && now <= endDate;
    const isCompleted = now > endDate;

    if (booking.status === 'cancelled') {
      return { text: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-400/20' };
    }
    if (isCompleted) {
      return { text: 'Completed', color: 'text-blue-400', bgColor: 'bg-blue-400/20' };
    }
    if (isActive) {
      return { text: 'Active', color: 'text-green-400', bgColor: 'bg-green-400/20' };
    }
    if (isUpcoming) {
      return { text: 'Upcoming', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' };
    }
    return { text: 'Confirmed', color: 'text-green-400', bgColor: 'bg-green-400/20' };
  };

  const statusInfo = getStatusInfo();
  const canCancel = booking.status === 'confirmed' && new Date() < startDate;

  const saveField = async (field: string) => {
    try {
      const updates: {
        fuelDeposit?: number;
        pickupLocation?: string;
        additionalInfo?: string;
      } = {};
      
      if (field === 'fuel') {
        updates.fuelDeposit = fuelDeposit;
        setEditingFuel(false);
      } else if (field === 'location') {
        updates.pickupLocation = pickupLocation;
        setEditingLocation(false);
      } else if (field === 'info') {
        updates.additionalInfo = additionalInfo;
        setEditingInfo(false);
      }

      await updateBookingDetails(booking.id, updates);
    } catch (error) {
      console.error('Failed to save field:', error);
      // Optionally show error toast
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDrag={(event, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ y: dragY }}
          >
            <div className="bg-[#212121] rounded-t-[28px] shadow-2xl border border-gray-700/50 overflow-hidden max-w-md mx-auto">
              
              {/* Handle Bar */}
              <div className="flex justify-center pt-2">
                <div className="w-10 h-1 bg-gray-400 rounded-full opacity-50" />
              </div>

              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{booking.guest_name}</h3>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                
                {/* Trip Overview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-white font-medium">
                      {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">{nights} nights</span>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Earnings</span>
                    <span className="text-green-400 font-bold">€{hostEarnings}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>€{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Carbe fee ({CARBE_COMMISSION_PERCENT}%)</span>
                      <span>-€{carbeCommission}</span>
                    </div>
                  </div>
                </div>

                {/* Guest Payment */}
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Guest pays:</span>
                      <span className="font-medium">€{totalToGuest}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>• Service fee</span>
                      <span>€{serviceFee}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>• Fuel deposit</span>
                      <div className="flex items-center space-x-1">
                        {editingFuel ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              value={fuelDeposit}
                              onChange={(e) => setFuelDeposit(Number(e.target.value))}
                              className="w-12 px-1 py-0.5 bg-gray-700 text-white text-xs rounded"
                            />
                            <button onClick={() => saveField('fuel')} className="text-green-400">
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span>€{fuelDeposit}</span>
                            <button onClick={() => setEditingFuel(true)} className="text-gray-500 hover:text-gray-300">
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Location - Editable */}
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-medium">Pickup Location</span>
                    </div>
                    {!editingLocation && (
                      <button onClick={() => setEditingLocation(true)} className="text-gray-500 hover:text-gray-300">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editingLocation ? (
                    <div className="space-y-2">
                      <textarea
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded resize-none"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button onClick={() => saveField('location')} className="text-green-400 text-sm flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                        <button onClick={() => setEditingLocation(false)} className="text-gray-400 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm whitespace-pre-line">{pickupLocation}</p>
                  )}
                </div>

                {/* Additional Information - Editable */}
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-medium">Trip Information</span>
                    </div>
                    {!editingInfo && (
                      <button onClick={() => setEditingInfo(true)} className="text-gray-500 hover:text-gray-300">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editingInfo ? (
                    <div className="space-y-2">
                      <textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded resize-none"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button onClick={() => saveField('info')} className="text-green-400 text-sm flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                        <button onClick={() => setEditingInfo(false)} className="text-gray-400 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm">{additionalInfo}</p>
                  )}
                </div>

                {/* Vehicle Status - Compact */}
                <div className="flex items-center justify-between py-2 border-t border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Car className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Ready</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Fuel className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">100%</span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">{format(new Date(), 'HH:mm')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-700/50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {onMessage && (
                    <button
                      onClick={handleMessage}
                      className="flex items-center justify-center space-x-1 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200 text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleCall}
                    className="flex items-center justify-center space-x-1 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200 text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </button>
                </div>
                
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>{isCancelling ? 'Cancelling...' : 'Cancel Reservation'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 