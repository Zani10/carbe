import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Car, MapPin, Fuel, Info, Phone, MessageCircle } from 'lucide-react';
import { CalendarBooking } from '@/types/calendar';

interface GuestBookingDetailsProps {
  booking: CalendarBooking;
  fuelDeposit?: number;
  pickupLocation?: string;
  additionalInfo?: string;
  onMessage?: () => void;
  onCall?: () => void;
}

export default function GuestBookingDetails({
  booking,
  fuelDeposit = 50,
  pickupLocation = "123 Main Street, Brussels\nMeet at parking spot #15",
  additionalInfo = "Check-in instructions will be sent 24h before pickup. Vehicle has GPS tracking.",
  onMessage,
  onCall
}: GuestBookingDetailsProps) {
  const startDate = parseISO(booking.start_date);
  const endDate = parseISO(booking.end_date);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

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
      return { text: 'Active - Enjoy your trip!', color: 'text-green-400', bgColor: 'bg-green-400/20' };
    }
    if (isUpcoming) {
      return { text: 'Upcoming', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' };
    }
    return { text: 'Confirmed', color: 'text-green-400', bgColor: 'bg-green-400/20' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Trip</h2>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">€{booking.total_amount}</div>
            <div className="text-gray-400 text-sm">Total paid</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Trip Overview */}
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <div className="text-white font-medium">
              {format(startDate, 'EEEE, MMM d')} - {format(endDate, 'EEEE, MMM d, yyyy')}
            </div>
            <div className="text-gray-400 text-sm">{nights} nights</div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Pickup Location</span>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
            {pickupLocation}
          </p>
        </div>

        {/* Vehicle Status */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Car className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Vehicle Status</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">Ready for pickup</span>
            </div>
            <div className="flex items-center space-x-2">
              <Fuel className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Full tank</span>
            </div>
          </div>
        </div>

        {/* Trip Information */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">Important Information</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {additionalInfo}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-800/30 rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Rental ({nights} nights)</span>
              <span>€{booking.daily_rate * nights}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Service fee</span>
              <span>€{Math.round((booking.daily_rate * nights) * 0.05)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Fuel deposit</span>
              <span>€{fuelDeposit}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-medium text-white">
                <span>Total</span>
                <span>€{booking.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Host */}
        {(onMessage || onCall) && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {onMessage && (
              <button
                onClick={onMessage}
                className="flex items-center justify-center space-x-2 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message Host</span>
              </button>
            )}
            
            {onCall && (
              <button
                onClick={onCall}
                className="flex items-center justify-center space-x-2 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
              >
                <Phone className="h-4 w-4" />
                <span>Call Host</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 