'use client';

import { useEffect, useState } from 'react';
import { Check, Car, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';

interface BookingSuccessOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  carData: {
    make: string;
    model: string;
    year: number;
    image?: string;
    location?: string;
  };
  bookingData: {
    startDate: string;
    endDate: string;
    totalAmount: number;
  };
  duration?: number; // Duration in milliseconds
}

export default function BookingSuccessOverlay({
  isVisible,
  onComplete,
  carData,
  bookingData,
  duration = 3000
}: BookingSuccessOverlayProps) {
  const [stage, setStage] = useState<'hidden' | 'appearing' | 'visible' | 'disappearing'>('hidden');

  useEffect(() => {
    if (isVisible) {
      setStage('appearing');
      
      // Show the overlay content
      const appearTimer = setTimeout(() => {
        setStage('visible');
      }, 100);

      // Start disappearing after duration
      const disappearTimer = setTimeout(() => {
        setStage('disappearing');
      }, duration - 500);

      // Complete and hide
      const completeTimer = setTimeout(() => {
        setStage('hidden');
        onComplete();
      }, duration);

      return () => {
        clearTimeout(appearTimer);
        clearTimeout(disappearTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, duration, onComplete]);

  if (stage === 'hidden') return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${
        stage === 'appearing' || stage === 'visible' 
          ? 'bg-black/80 backdrop-blur-sm' 
          : 'bg-transparent'
      }`}
    >
      <div 
        className={`relative bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 mx-4 max-w-sm w-full transform transition-all duration-500 ${
          stage === 'appearing' 
            ? 'scale-75 opacity-0 translate-y-8' 
            : stage === 'visible'
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-110 opacity-0 translate-y-[-8px]'
        }`}
      >
        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-6">
          <div 
            className={`w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-700 ${
              stage === 'visible' ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}
          >
            <Check 
              className={`w-10 h-10 text-white transition-all duration-500 delay-300 ${
                stage === 'visible' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`} 
            />
          </div>
        </div>

        {/* Car Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-white/90 text-lg">
            {carData.make} {carData.model} {carData.year}
          </p>
        </div>

        {/* Car Image */}
        {carData.image && (
          <div className="mb-6 mx-auto w-32 h-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md">
            <Image
              src={carData.image}
              alt={`${carData.make} ${carData.model}`}
              width={128}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-white/90">
            <Calendar className="w-5 h-5 mr-3" />
            <span>
              {formatDate(bookingData.startDate)} - {formatDate(bookingData.endDate)}
            </span>
          </div>
          
          {carData.location && (
            <div className="flex items-center text-white/90">
              <MapPin className="w-5 h-5 mr-3" />
              <span>{carData.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-white font-semibold">
            <Car className="w-5 h-5 mr-3" />
            <span>€{bookingData.totalAmount}</span>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="text-center">
          <div className="inline-flex items-center text-white/80 text-sm">
            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
            Redirecting to your trips...
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 