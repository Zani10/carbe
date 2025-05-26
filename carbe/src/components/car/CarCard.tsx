import React from 'react';
import Image from 'next/image';
import { Star, Heart, MapPin, Settings2 } from 'lucide-react';
import clsx from 'clsx';

export interface CarCardProps {
  id: string;
  image: string;
  rating: number;
  isFavorite: boolean;
  makeModel: string;
  location: string;
  transmission: string;
  pricePerDay: number;
  distance?: string;
  brandLogoUrl?: string;
}

const CarCard: React.FC<CarCardProps> = ({
  image,
  rating,
  isFavorite,
  makeModel,
  location,
  transmission,
  pricePerDay,
  distance,
  brandLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png',
}) => {
  return (
    <div className="w-full px-4 py-2">
      <div className="bg-[#2A2A2A] rounded-2xl shadow-md overflow-hidden text-white flex flex-col">
        <div className="relative">
          {/* Car image */}
          <Image 
            src={image} 
            alt={makeModel} 
            width={400}
            height={176}
            className="w-full h-44 object-cover" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          /> 
          
          {/* Rating badge */}
          <div className="absolute top-2.5 left-2.5 bg-black/50 text-white px-2 py-0.5 rounded-md text-xs flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 fill-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
          
          {/* Heart button */}
          <button 
            className="absolute top-2 right-3 p-1 rounded-full"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={clsx(
                'h-7 w-7',
                isFavorite 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-white stroke-[3] drop-shadow-md'
              )}
            />
          </button>
        </div>

        {/* Details section */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              {brandLogoUrl && (
                <Image 
                  src={brandLogoUrl} 
                  alt="Brand Logo" 
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full mr-2.5 border-2 border-slate-700 object-contain p-0.5 bg-white"
                />
              )}
              <h3 className="text-lg font-bold text-white truncate leading-tight">
                {makeModel}
              </h3>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <p className="text-lg font-bold text-white">
                ${pricePerDay}<span className="text-xs font-normal text-gray-400">/day</span>
              </p>
              {distance && (
                <p className="text-xs text-green-400 font-medium mt-0.5">{distance}</p>
              )}
            </div>
          </div>

          {/* Location and transmission */}
          <div className="flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex items-center ml-4">
              <Settings2 className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
              <span>{transmission}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard; 