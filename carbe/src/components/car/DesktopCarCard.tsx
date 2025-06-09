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

// Dynamic brand logo mapping
const getBrandLogoUrl = (make: string): string => {
  const brandLogos: Record<string, string> = {
    'BMW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png',
    'Mercedes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png',
    'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png',
    'Audi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/200px-Audi-Logo_2016.svg.png',
    'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png',
    'Ford': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/200px-Ford_logo_flat.svg.png',
    'Toyota': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota.svg/200px-Toyota.svg.png',
    'Honda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Honda.svg/200px-Honda.svg.png',
    'Nissan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nissan_2020_logo.svg/200px-Nissan_2020_logo.svg.png',
    'Porsche': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Porsche_logo.svg/200px-Porsche_logo.svg.png',
    'Tesla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/200px-Tesla_T_symbol.svg.png',
    'Chevrolet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Chevrolet-logo.svg/200px-Chevrolet-logo.svg.png',
    'Ferrari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Ferrari_Logo.svg/200px-Ferrari_Logo.svg.png',
    'Lamborghini': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Lamborghini_Logo.svg/200px-Lamborghini_Logo.svg.png',
    'Maserati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Maserati_logo.png/200px-Maserati_logo.png',
    'Jaguar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jaguar_logo_2012.svg/200px-Jaguar_logo_2012.svg.png',
    'Land Rover': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Land_Rover_logo.svg/200px-Land_Rover_logo.svg.png',
    'Mini': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/MINI_logo.svg/200px-MINI_logo.svg.png',
    'Volvo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Volvo_logo_%282014%29.svg/200px-Volvo_logo_%282014%29.svg.png',
    'Subaru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Subaru_logo.svg/200px-Subaru_logo.svg.png',
    'Mazda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mazda_logo.svg/200px-Mazda_logo.svg.png',
    'Hyundai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Hyundai_logo.svg/200px-Hyundai_logo.svg.png',
    'Kia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kia_logo2.svg/200px-Kia_logo2.svg.png',
  };

  // Try exact match first, then partial match
  const exactMatch = brandLogos[make];
  if (exactMatch) return exactMatch;

  // Look for partial matches (case insensitive)
  const makeUpper = make.toUpperCase();
  for (const [brand, url] of Object.entries(brandLogos)) {
    if (makeUpper.includes(brand.toUpperCase()) || brand.toUpperCase().includes(makeUpper)) {
      return url;
    }
  }

  // Default fallback - generic car logo
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzNzM3MzciLz4KPHN2ZyB4PSI4IiB5PSIxMiIgd2lkdGg9IjI0IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMTYiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMyA4VjEzSDIxVjhIMThaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSI2IiBjeT0iMTIiIHI9IjIiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjE4IiBjeT0iMTIiIHI9IjIiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00IDhMNiAzSDE4TDIwIDhINCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
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