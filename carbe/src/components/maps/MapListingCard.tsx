'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { CarWithCoordinates } from '@/lib/geocode';

interface MapListingCardProps {
  cars: CarWithCoordinates[]; // Array of cars instead of single car
  selectedIndex: number; // Current selected car index
  distance?: number;
  onCardChange?: (index: number) => void;
}

const MapListingCard: React.FC<MapListingCardProps> = ({ 
  cars, 
  selectedIndex,
  distance, 
  onCardChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleScroll = () => {
    if (!scrollRef.current || isDragging) return;
    
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 280; // 280px card width + 8px gap = 288px total spacing
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < cars.length) {
      // Debounce the card change to avoid lag
      setTimeout(() => {
        onCardChange?.(newIndex);
      }, 50);
    }
  };

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 280; // Consistent with handle scroll
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  // Optimized scroll to selected card
  React.useEffect(() => {
    if (!isDragging) {
      scrollToCard(selectedIndex);
    }
  }, [selectedIndex, isDragging]);

  if (!cars.length) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-32 left-0 right-0 z-50" // Higher up from bottom
    >
      {/* Horizontal scrollable cards */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 gap-2"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain' // Prevent overscroll
        }}
        onScroll={handleScroll}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => {
          setIsDragging(false);
          // Small delay to ensure smooth transition
          setTimeout(() => setIsDragging(false), 100);
        }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {cars.map((car, index) => (
          <motion.div
            key={car.id}
            className="flex-shrink-0 w-72 snap-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              <Link href={`/car/${car.id}`} className="block">
                <div className="flex h-28"> {/* Fixed height for consistency */}
                  {/* Car image - better proportions */}
                  <div className="relative w-28 h-28 flex-shrink-0 rounded-l-2xl overflow-hidden">
                    <Image
                      src={car.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                  {/* Car details - better spacing */}
                  <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm leading-tight truncate mb-1">
                        {car.make} {car.model}
                      </h3>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-xs truncate">{car.location}</span>
                        {distance && index === selectedIndex && (
                          <span className="text-gray-400 text-xs ml-1">• {distance}km</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-white">
                        <span className="text-base font-bold">{formatPrice(car.pricePerDay)}</span>
                        <span className="text-gray-400 text-xs ml-1">per day</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#FF4646] hover:bg-[#FF3333] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                      >
                        View
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-4 gap-2">
        {cars.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === selectedIndex ? 'bg-[#FF4646]' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default MapListingCard; 