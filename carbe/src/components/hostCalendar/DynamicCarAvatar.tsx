import React from 'react';
import { Car } from 'lucide-react';
import Image from 'next/image';

import { Vehicle } from '@/types/calendar';

interface DynamicCarAvatarProps {
  selectedCarIds: string[];
  allCars: Vehicle[];
  size?: 'sm' | 'md' | 'lg';
}

export default function DynamicCarAvatar({
  selectedCarIds,
  allCars,
  size = 'md'
}: DynamicCarAvatarProps) {
  const selectedCars = allCars.filter(car => selectedCarIds.includes(car.id));
  const isAllCarsSelected = selectedCarIds.length === allCars.length;
  
  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // All cars selected - show default icon with "All" label
  if (isAllCarsSelected) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600`}>
          <Car className={`${iconSizes[size]} text-gray-300`} />
        </div>
        <span className="text-white text-sm font-medium">All</span>
      </div>
    );
  }
  
  // Single car selected - show that car's primary image
  if (selectedCars.length === 1) {
    const car = selectedCars[0];
    const primaryImage = car.image;
    
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-600 bg-gray-700 flex items-center justify-center`}>
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={`${car.make} ${car.model}`}
            width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            className="w-full h-full object-cover"
          />
        ) : (
          <Car className={`${iconSizes[size]} text-gray-300`} />
        )}
      </div>
    );
  }
  
  // Multiple cars selected (but not all) - stack up to 3 images
  if (selectedCars.length > 1 && selectedCars.length < allCars.length) {
    const displayCars = selectedCars.slice(0, 3);
    const hasMore = selectedCars.length > 3;
    

    
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-700 border-2 border-gray-600 relative overflow-hidden flex items-center justify-center`}>
        {displayCars.length === 2 ? (
          // Two cars - split vertically
          <div className="flex w-full h-full">
            {displayCars.map((car) => (
              <div key={car.id} className="flex-1 h-full relative">
                {car.image ? (
                  <Image
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <Car className="w-2 h-2 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Three cars - arrange in triangle/grid
          <div className="grid grid-cols-2 w-full h-full gap-px">
            {/* Top left */}
            <div className="relative">
              {displayCars[0]?.image ? (
                <Image
                  src={displayCars[0].image}
                  alt={`${displayCars[0].make} ${displayCars[0].model}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <Car className="w-1.5 h-1.5 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Top right */}
            <div className="relative">
              {displayCars[1]?.image ? (
                <Image
                  src={displayCars[1].image}
                  alt={`${displayCars[1].make} ${displayCars[1].model}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <Car className="w-1.5 h-1.5 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Bottom - spans both columns */}
            <div className="col-span-2 relative">
              {displayCars[2]?.image ? (
                <Image
                  src={displayCars[2].image}
                  alt={`${displayCars[2].make} ${displayCars[2].model}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <Car className="w-1.5 h-1.5 text-gray-400" />
                </div>
              )}
              
              {/* Show +X indicator if there are more cars */}
              {hasMore && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">
                    +{selectedCars.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback - default car icon
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600`}>
      <Car className={`${iconSizes[size]} text-gray-300`} />
    </div>
  );
} 