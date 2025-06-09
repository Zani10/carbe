import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, MapPin, Settings2 } from 'lucide-react';
import clsx from 'clsx';
import { useFavorites } from '@/hooks/useFavorites';
import { useCarMinPrice } from '@/hooks/useCarMinPrice';

export interface DesktopCarCardProps {
  id: string;
  image: string;
  rating: number;
  make: string;
  model: string;
  location: string;
  transmission: string;
  pricePerDay: number;
  distance?: string;
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

const DesktopCarCard: React.FC<DesktopCarCardProps> = ({
  id,
  image,
  rating,
  make,
  model,
  location,
  transmission,
  pricePerDay,
  distance,
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
  const brandLogoUrl = getBrandLogoUrl(make);

  // Base64 fallback image for broken car images
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMkEyQTJBIi8+CjxzdmcgeD0iMTUwIiB5PSI4MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDEwMCA4MCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMCA0MEgzMFYxMEg3MFY0MEg5MFY2MEg4MFY3MEg3MFY2MEgzMFY3MEgyMFY2MEgxMFY0MFoiIGZpbGw9IiM2NjY2NjYiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSI2NSIgcj0iOCIgZmlsbD0iIzk5OTk5OSIvPgo8Y2lyY2xlIGN4PSI3NSIgY3k9IjY1IiByPSI4IiBmaWxsPSIjOTk5OTk5Ii8+CjwvcmVjdD4KPC9zdmc+Cjwvc3ZnPgo=';

  return (
    <div 
      className={clsx(
        "group bg-[#2A2A2A] rounded-2xl overflow-hidden hover:bg-[#333333] transition-all duration-200 cursor-pointer",
        "hover:scale-[1.02] hover:shadow-lg"
      )}
      onClick={onCardClick}
    >
      <div className="relative">
        <Image
          src={imageError ? fallbackImage : image}
          alt={`${make} ${model}`}
          width={400}
          height={240}
          className="w-full h-48 object-cover"
          sizes="(max-width: 1024px) 50vw, 25vw"
          onError={() => setImageError(true)}
        />
        
        {/* Rating badge with proper star icon */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm flex items-center">
          <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 fill-yellow-400" />
          <span className="font-medium">{rating.toFixed(1)}</span>
        </div>
        
        {/* Heart/Favorite button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          aria-label={isCarFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={clsx(
              'h-4 w-4 transition-colors',
              isCarFavorite 
                ? 'text-red-500 fill-red-500' 
                : 'text-white hover:text-red-200'
            )}
          />
        </button>
      </div>
      
      <div className="p-4">
        {/* Brand logo and title */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center min-w-0 flex-1">
            <Image 
              src={brandLogoUrl} 
              alt={`${make} Logo`} 
              width={32}
              height={32}
              className="w-8 h-8 rounded-full mr-2.5 border border-gray-600 object-contain p-0.5 bg-white flex-shrink-0"
            />
            <h3 className="text-lg font-semibold text-white truncate leading-tight">
              {make} {model}
            </h3>
          </div>
          
          {/* Price - styled like mobile */}
          <div className="text-right flex-shrink-0 pl-2">
            <p className="text-lg font-bold text-white">
              €{minPrice}<span className="text-xs font-normal text-gray-400">/day</span>
            </p>
            {distance && (
              <p className="text-xs text-green-400 font-medium mt-0.5">{distance}</p>
            )}
          </div>
        </div>

        {/* Location and transmission with icons */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center min-w-0 flex-1">
            <MapPin className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center ml-4 flex-shrink-0">
            <Settings2 className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{transmission}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopCarCard; 