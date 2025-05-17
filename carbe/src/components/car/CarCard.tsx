import React from 'react';
import { Star, Heart, MapPin, Settings2 } from 'lucide-react';
import clsx from 'clsx';

export interface CarCardProps {
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
  brandLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png', // Default BMW logo to match design
}) => {
  return (
    // The outer div is for margin and ensuring it takes full width within its column in CarList
    <div className="w-full px-2 py-1.5">
      <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden text-white flex flex-col">
        <div className="relative">
          {/* Image takes full width of the card, height adjusted */}
          <img src={image} alt={makeModel} className="w-full h-44 object-cover" /> 
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 fill-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
          <button className="absolute top-2.5 right-2.5 p-1.5 bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/90 transition-colors">
            <Heart
              className={clsx(
                'h-5 w-5',
                isFavorite ? 'text-red-500 fill-red-500' : 'text-white'
              )}
              strokeWidth={isFavorite ? 2 : 2.5}
            />
          </button>
        </div>
        {/* Details section with a very dark background as per design */}
        <div className="bg-slate-900 p-4 flex-grow">
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center">
              {brandLogoUrl && (
                <img 
                  src={brandLogoUrl} 
                  alt="Brand Logo" 
                  className="w-10 h-10 rounded-full mr-2.5 border-2 border-slate-700 object-contain p-0.5 bg-white"
                />
              )}
              <h3 className="text-lg font-bold text-gray-50 truncate leading-tight">
                {makeModel}
              </h3>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <p className="text-lg font-bold text-gray-50">
                ${pricePerDay}<span className="text-xs font-semibold text-gray-400">/day</span>
              </p>
              {distance && (
                <p className="text-xs text-green-400 font-medium mt-0.5">{distance}</p>
              )}
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-400 mb-1">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Settings2 className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
            <span>{transmission}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard; 