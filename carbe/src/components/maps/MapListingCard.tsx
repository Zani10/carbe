'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { CarWithCoordinates } from '@/lib/geocode';

interface MapListingCardProps {
  car: CarWithCoordinates;
  distance?: number;
  onClose: () => void;
}

const MapListingCard: React.FC<MapListingCardProps> = ({ car, distance, onClose }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400 text-sm">No reviews</span>;
    
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-white font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#212121] rounded-t-3xl shadow-2xl"
    >
      {/* Handle bar */}
      <div className="w-full py-4 flex justify-center">
        <button 
          onClick={onClose}
          className="w-16 h-1.5 bg-gray-500 hover:bg-gray-400 active:bg-gray-300 rounded-full"
        />
      </div>

      {/* Card content */}
      <div className="px-6 pb-8">
        <Link href={`/car/${car.id}`} className="block">
          <div className="flex gap-4">
            {/* Car image */}
            <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={car.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={`${car.make} ${car.model}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Car details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-white font-semibold text-lg leading-tight truncate">
                  {car.make} {car.model}
                </h3>
                {renderStars(car.rating)}
              </div>

              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm truncate">{car.location}</span>
                {distance && (
                  <span className="text-gray-400 text-sm ml-2">• {distance}km away</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-white">
                  <span className="text-xl font-bold">{formatPrice(car.pricePerDay)}</span>
                  <span className="text-gray-400 text-sm ml-1">per day</span>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  View Details
                </motion.div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default MapListingCard; 