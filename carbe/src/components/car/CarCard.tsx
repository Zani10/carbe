import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, MapPin, Settings2 } from 'lucide-react';
import clsx from 'clsx';
import { useFavorites } from '@/hooks/useFavorites';
import { useCarMinPrice } from '@/hooks/useCarMinPrice';

export interface CarCardProps {
  id: string;
  image: string;
  rating: number;
  makeModel: string;
  location: string;
  transmission: string;
  pricePerDay: number;
  distance?: string;
  brandLogoUrl?: string;
  onCardClick?: () => void;
}

// Dynamic brand logo mapping with GitHub raw URLs from car-logos-dataset
const getBrandLogoUrl = (make: string): string => {
  const makeLower = make.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
  
  // Map common name variations
  const brandMap: Record<string, string> = {
    'mercedes-benz': 'mercedes-benz',
    'mercedes': 'mercedes-benz',
    'volkswagen': 'volkswagen',
    'vw': 'volkswagen',
    'bmw': 'bmw',
    'audi': 'audi',
    'ford': 'ford',
    'toyota': 'toyota',
    'honda': 'honda',
    'chevrolet': 'chevrolet',
    'chevy': 'chevrolet',
    'nissan': 'nissan',
    'hyundai': 'hyundai',
    'kia': 'kia',
    'mazda': 'mazda',
    'subaru': 'subaru',
    'volvo': 'volvo',
    'lexus': 'lexus',
    'infiniti': 'infiniti',
    'acura': 'acura',
    'tesla': 'tesla',
    'porsche': 'porsche',
    'jaguar': 'jaguar',
    'land-rover': 'land-rover',
    'range-rover': 'land-rover',
    'mini': 'mini',
    'fiat': 'fiat',
    'alfa-romeo': 'alfa-romeo',
    'ferrari': 'ferrari',
    'lamborghini': 'lamborghini',
    'maserati': 'maserati',
    'bentley': 'bentley',
    'rolls-royce': 'rolls-royce',
    'aston-martin': 'aston-martin',
    'mclaren': 'mclaren',
    'bugatti': 'bugatti',
    'lotus': 'lotus',
    'peugeot': 'peugeot',
    'renault': 'renault',
    'citroen': 'citroen',
    'opel': 'opel',
    'vauxhall': 'opel',
    'seat': 'seat',
    'skoda': 'skoda',
    'dacia': 'dacia',
    'saab': 'saab',
    'smart': 'smart',
    'mitsubishi': 'mitsubishi',
    'suzuki': 'suzuki',
    'isuzu': 'isuzu',
    'jeep': 'jeep',
    'dodge': 'dodge',
    'chrysler': 'chrysler',
    'ram': 'ram',
    'cadillac': 'cadillac',
    'buick': 'buick',
    'gmc': 'gmc',
    'lincoln': 'lincoln',
    'mercury': 'mercury',
    'pontiac': 'pontiac',
    'oldsmobile': 'oldsmobile',
    'saturn': 'saturn',
    'hummer': 'hummer',
    'scion': 'scion',
  };

  const brandSlug = brandMap[makeLower] || makeLower;
  
  // Return GitHub raw URL for the optimized logo
  return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${brandSlug}.png`;
};

const CarCard: React.FC<CarCardProps> = ({
  id,
  image,
  rating,
  makeModel,
  location,
  transmission,
  pricePerDay,
  distance,
  brandLogoUrl,
  onCardClick,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { minPrice } = useCarMinPrice(id, pricePerDay);
  const [imageError, setImageError] = useState(false);
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await toggleFavorite(id);
  };

  const isCarFavorite = isFavorite(id);

  // Extract make from makeModel for logo generation
  const make = makeModel.split(' ')[0];
  const dynamicBrandLogoUrl = getBrandLogoUrl(make);
  const logoUrl = brandLogoUrl || dynamicBrandLogoUrl;

  // Base64 fallback image for broken car images
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE3NiIgdmlld0JveD0iMCAwIDQwMCAxNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTc2IiBmaWxsPSIjMkEyQTJBIi8+CjxzdmcgeD0iMTUwIiB5PSI2OCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDEwMCA0MCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCAyMEgzMFY1SDcwVjIwSDkwVjMwSDgwVjM1SDcwVjMwSDMwVjM1SDIwVjMwSDEwVjIwWiIgZmlsbD0iIzY2NjY2NiIvPgo8Y2lyY2xlIGN4PSIyNSIgY3k9IjMyLjUiIHI9IjQiIGZpbGw9IiM5OTk5OTkiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSIzMi41IiByPSI0IiBmaWxsPSIjOTk5OTk5Ii8+CjwvcmVjdD4KPC9zdmc+Cjwvc3ZnPgo=';

  return (
    <div className="w-full px-4 py-2">
      <div 
        className={clsx(
          "bg-[#2A2A2A] rounded-2xl shadow-md overflow-hidden text-white flex flex-col",
          onCardClick && "cursor-pointer"
        )}
        onClick={onCardClick}
      >
        <div className="relative">
          {/* Car image */}
          <Image 
            src={imageError ? fallbackImage : image} 
            alt={makeModel} 
            width={400}
            height={176}
            className="w-full h-44 object-cover" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          /> 
          
          {/* Rating badge */}
          <div className="absolute top-2.5 left-2.5 bg-black/50 text-white px-2 py-0.5 rounded-md text-xs flex items-center">
            <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 fill-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
          
          {/* Heart button */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 right-3 p-1 rounded-full hover:bg-black/20 transition-colors"
            aria-label={isCarFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={clsx(
                'h-7 w-7 transition-colors',
                isCarFavorite 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-white stroke-[3] drop-shadow-md hover:text-red-200'
              )}
            />
          </button>
        </div>

        {/* Details section */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <Image 
                src={logoUrl} 
                alt="Brand Logo" 
                width={40}
                height={40}
                className="w-10 h-10 rounded-full mr-2.5 border-2 border-slate-700 object-contain p-0.5 bg-white"
              />
              <h3 className="text-lg font-bold text-white truncate leading-tight">
                {makeModel}
              </h3>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <p className="text-lg font-bold text-white">
                €{minPrice}<span className="text-xs font-normal text-gray-400">/day</span>
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