import React, { useState } from 'react';
import { ChevronRight, Users, Car } from 'lucide-react';

import Sheet from '@/components/ui/Sheet';
import FilterOption from '@/components/ui/FilterOption';
import RangeSlider from '@/components/ui/RangeSlider';
import Button from '@/components/ui/Button';
import FilterGroup from '@/components/ui/FilterGroup';

import {
  VEHICLE_TYPES,
  CAR_BRANDS,
  ECO_FRIENDLY_OPTIONS,
  TRANSMISSION_TYPES,
  YEAR_RANGES,
} from '@/constants/carTypes';

// Extended car brands list for better selection
const EXTENDED_CAR_BRANDS = [
  ...CAR_BRANDS,
  { id: 'tesla', name: 'Tesla', logo: 'tesla.svg' },
  { id: 'porsche', name: 'Porsche', logo: 'porsche.svg' },
  { id: 'jaguar', name: 'Jaguar', logo: 'jaguar.svg' },
  { id: 'land_rover', name: 'Land Rover', logo: 'land_rover.svg' },
  { id: 'volvo', name: 'Volvo', logo: 'volvo.svg' },
  { id: 'mazda', name: 'Mazda', logo: 'mazda.svg' },
  { id: 'subaru', name: 'Subaru', logo: 'subaru.svg' },
  { id: 'kia', name: 'Kia', logo: 'kia.svg' },
  { id: 'hyundai', name: 'Hyundai', logo: 'hyundai.svg' },
  { id: 'peugeot', name: 'Peugeot', logo: 'peugeot.svg' },
  { id: 'renault', name: 'Renault', logo: 'renault.svg' },
  { id: 'citroen', name: 'Citroën', logo: 'citroen.svg' },
  { id: 'fiat', name: 'Fiat', logo: 'fiat.svg' },
  { id: 'seat', name: 'SEAT', logo: 'seat.svg' },
  { id: 'skoda', name: 'Škoda', logo: 'skoda.svg' },
];

// Seat options with icons
const ENHANCED_SEAT_OPTIONS = [
  { id: '2', name: '2', icon: <Users size={16} /> },
  { id: '4', name: '4', icon: <Users size={16} /> },
  { id: '5', name: '5', icon: <Users size={16} /> },
  { id: '6', name: '6', icon: <Users size={16} /> },
  { id: '7+', name: '7+', icon: <Users size={16} /> },
];

// Define the filter state type for better type safety
export interface FilterState {
  vehicleTypes: string[];
  brands: string[];
  priceRange: [number, number];
  ecoFriendly: string[];
  years: string[];
  seats: string[];
  transmission: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters?: () => void;
  initialFilters?: FilterState | null;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  initialFilters,
}) => {
  const defaultFilters: FilterState = {
    vehicleTypes: ['cars'],
    brands: [],
    priceRange: [10, 500],
    ecoFriendly: [],
    years: [],
    seats: [],
    transmission: [],
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters || defaultFilters);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Bottom nav visibility is handled by SearchBar component

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleVehicleTypeToggle = (typeId: string) => {
    setFilters({
      ...filters,
      vehicleTypes: toggleArrayItem(filters.vehicleTypes, typeId),
    });
  };

  const handleBrandToggle = (brandId: string) => {
    setFilters({
      ...filters,
      brands: toggleArrayItem(filters.brands, brandId),
    });
  };

  const handleEcoFriendlyToggle = (optionId: string) => {
    setFilters({
      ...filters,
      ecoFriendly: toggleArrayItem(filters.ecoFriendly, optionId),
    });
  };

  const handleYearToggle = (yearId: string) => {
    setFilters({
      ...filters,
      years: toggleArrayItem(filters.years, yearId),
    });
  };

  const handleSeatToggle = (seatId: string) => {
    setFilters({
      ...filters,
      seats: toggleArrayItem(filters.seats, seatId),
    });
  };

  const handleTransmissionToggle = (transmissionId: string) => {
    setFilters({
      ...filters,
      transmission: toggleArrayItem(filters.transmission, transmissionId),
    });
  };
  
  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters({
      ...filters,
      priceRange: [min, max],
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    if (onResetFilters) {
      onResetFilters();
    }
  };

  const activeFilterCount = (() => {
    let count = 0;
    
    if (filters.vehicleTypes.length > 0 && filters.vehicleTypes[0] !== 'cars') count++;
    if (filters.brands.length > 0) count++;
    if (filters.ecoFriendly.length > 0) count++;
    if (filters.years.length > 0) count++;
    if (filters.seats.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.priceRange[0] > 10 || filters.priceRange[1] < 500) count++;
    
    return count > 0 ? count : undefined;
  })();

  const brandsToShow = showAllBrands ? EXTENDED_CAR_BRANDS : EXTENDED_CAR_BRANDS.slice(0, 12);

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
      showCloseButton={true}
      headerAction={
        <button 
          onClick={handleResetFilters} 
          className="text-[#FF4646] text-base font-medium hover:underline"
        >
          Reset
        </button>
      }
      height="90vh"
    >
      <div className="pb-24">
        {/* Vehicle Type - More compact */}
        <FilterGroup title="Vehicle type">
          <div className="grid grid-cols-4 gap-2">
            {VEHICLE_TYPES.slice(0, 4).map((type) => (
              <FilterOption
                key={type.id}
                id={type.id}
                label={type.name}
                icon={<span className="text-lg">{type.icon}</span>}
                isSelected={filters.vehicleTypes.includes(type.id)}
                onClick={() => handleVehicleTypeToggle(type.id)}
                className={`p-3 text-xs ${filters.vehicleTypes.includes(type.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
              />
            ))}
          </div>
          {VEHICLE_TYPES.length > 4 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {VEHICLE_TYPES.slice(4).map((type) => (
                <FilterOption
                  key={type.id}
                  id={type.id}
                  label={type.name}
                  icon={<span className="text-lg">{type.icon}</span>}
                  isSelected={filters.vehicleTypes.includes(type.id)}
                  onClick={() => handleVehicleTypeToggle(type.id)}
                  className={`p-3 text-xs ${filters.vehicleTypes.includes(type.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
                />
              ))}
            </div>
          )}
        </FilterGroup>

        {/* Transmission - moved higher up */}
        <FilterGroup title="Transmission">
          <div className="grid grid-cols-2 gap-3">
            {TRANSMISSION_TYPES.map((transmission) => (
              <FilterOption
                key={transmission.id}
                id={transmission.id}
                label={transmission.name}
                icon={<Car size={16} />}
                isSelected={filters.transmission.includes(transmission.id)}
                onClick={() => handleTransmissionToggle(transmission.id)}
                className={`p-4 ${filters.transmission.includes(transmission.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
              />
            ))}
          </div>
        </FilterGroup>

        {/* Price Range - Improved */}
        <FilterGroup title="Daily price range">
          <div className="px-2">
            <RangeSlider
              min={10}
              max={500}
              step={5}
              minValue={filters.priceRange[0]}
              maxValue={filters.priceRange[1]}
              onChange={handlePriceRangeChange}
              formatValue={(value) => `€${value}`}
              color="#FF4646"
            />
          </div>
        </FilterGroup>

        {/* Make - Improved with more brands */}
        <FilterGroup title="Make">
          <div className="grid grid-cols-4 gap-2">
            {brandsToShow.map((brand) => (
              <FilterOption
                key={brand.id}
                id={brand.id}
                label={brand.name}
                isSelected={filters.brands.includes(brand.id)}
                onClick={() => handleBrandToggle(brand.id)}
                className={`p-3 text-xs ${filters.brands.includes(brand.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
              />
            ))}
          </div>
          {!showAllBrands && EXTENDED_CAR_BRANDS.length > 12 && (
            <button 
              onClick={() => setShowAllBrands(true)}
              className="mt-4 text-[#FF4646] flex items-center hover:underline"
            >
              <span className="mr-1">Show more brands</span>
              <ChevronRight size={16} />
            </button>
          )}
          {showAllBrands && (
            <button 
              onClick={() => setShowAllBrands(false)}
              className="mt-4 text-[#FF4646] flex items-center hover:underline"
            >
              <span className="mr-1">Show less</span>
            </button>
          )}
        </FilterGroup>

        {/* Seats - Enhanced with icons */}
        <FilterGroup title="Number of seats">
          <div className="grid grid-cols-5 gap-2">
            {ENHANCED_SEAT_OPTIONS.map((seat) => (
              <FilterOption
                key={seat.id}
                id={seat.id}
                label={seat.name}
                icon={seat.icon}
                isSelected={filters.seats.includes(seat.id)}
                onClick={() => handleSeatToggle(seat.id)}
                className={`p-4 ${filters.seats.includes(seat.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
              />
            ))}
          </div>
        </FilterGroup>

        {/* Years */}
        <FilterGroup title="Vehicle year">
          <div className="grid grid-cols-2 gap-3">
            {YEAR_RANGES.map((year) => (
              <FilterOption
                key={year.id}
                id={year.id}
                label={year.name}
                isSelected={filters.years.includes(year.id)}
                onClick={() => handleYearToggle(year.id)}
                className={`p-4 ${filters.years.includes(year.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
              />
            ))}
          </div>
        </FilterGroup>

        {/* Eco-friendly */}
        <FilterGroup title="Eco-friendly">
          <div className="grid grid-cols-2 gap-3">
            {ECO_FRIENDLY_OPTIONS.map((option) => (
              <FilterOption
                key={option.id}
                id={option.id}
                label={option.name}
                icon={<span className="text-lg">{option.icon}</span>}
                isSelected={filters.ecoFriendly.includes(option.id)}
                onClick={() => handleEcoFriendlyToggle(option.id)}
                className={`p-4 ${filters.ecoFriendly.includes(option.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
              />
            ))}
          </div>
        </FilterGroup>
      </div>

      {/* Apply button - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#212121] border-t border-gray-800 z-50">
        <Button 
          onClick={handleApplyFilters}
          size="lg"
          className="w-full bg-[#FF4646] hover:bg-[#FF3333] text-white"
        >
          Apply Filters
        </Button>
      </div>
    </Sheet>
  );
};

export default FilterModal; 