import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import Sheet from '@/components/ui/Sheet';
import FilterOption from '@/components/ui/FilterOption';
import RangeSlider from '@/components/ui/RangeSlider';
import Switch from '@/components/ui/Switch';
import Button from '@/components/ui/Button';
import FilterGroup from '@/components/ui/FilterGroup';

import {
  VEHICLE_TYPES,
  CAR_FEATURES,
  CAR_BRANDS,
  ECO_FRIENDLY_OPTIONS,
  TRANSMISSION_TYPES,
  SEAT_OPTIONS,
  YEAR_RANGES,
} from '@/constants/carTypes';

// Define the filter state type for better type safety
export interface FilterState {
  vehicleTypes: string[];
  brands: string[];
  priceRange: [number, number];
  features: string[];
  ecoFriendly: string[];
  years: string[];
  seats: string[];
  transmission: string[];
  mileage: number;
  deliveryOption: boolean;
  deluxeClass: boolean;
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
    features: [],
    ecoFriendly: [],
    years: [],
    seats: [],
    transmission: [],
    mileage: 100,
    deliveryOption: false,
    deluxeClass: false,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters || defaultFilters);

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

  const handleFeatureToggle = (featureId: string) => {
    setFilters({
      ...filters,
      features: toggleArrayItem(filters.features, featureId),
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

  const handleMileageChange = (min: number, max: number) => {
    setFilters({
      ...filters,
      mileage: max,
    });
  };

  const handleDeliveryOptionToggle = () => {
    setFilters({
      ...filters,
      deliveryOption: !filters.deliveryOption,
    });
  };

  const handleDeluxeClassToggle = () => {
    setFilters({
      ...filters,
      deluxeClass: !filters.deluxeClass,
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
    if (filters.features.length > 0) count++;
    if (filters.ecoFriendly.length > 0) count++;
    if (filters.years.length > 0) count++;
    if (filters.seats.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.priceRange[0] > 10 || filters.priceRange[1] < 500) count++;
    if (filters.mileage < 100) count++;
    if (filters.deliveryOption) count++;
    if (filters.deluxeClass) count++;
    
    return count > 0 ? count : undefined;
  })();

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
      <div className="pb-32">
        {/* Vehicle Type */}
        <FilterGroup title="Vehicle type">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {VEHICLE_TYPES.map((type) => (
              <FilterOption
                key={type.id}
                id={type.id}
                label={type.name}
                icon={type.icon}
                isSelected={filters.vehicleTypes.includes(type.id)}
                onClick={() => handleVehicleTypeToggle(type.id)}
                className={filters.vehicleTypes.includes(type.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}
              />
            ))}
          </div>
        </FilterGroup>

        {/* Price Range */}
        <FilterGroup title="Daily price">
          <RangeSlider
            min={10}
            max={500}
            step={10}
            minValue={filters.priceRange[0]}
            maxValue={filters.priceRange[1]}
            onChange={handlePriceRangeChange}
            formatValue={(value) => `${value} US$`}
            unit="/day"
          />
        </FilterGroup>

        {/* Vehicle Attributes */}
        <FilterGroup title="Vehicle attributes">
          {/* Make */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-white">Make</span>
              <span className="text-[#FF4646]">All makes</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {CAR_BRANDS.slice(0, 8).map((brand) => (
                <FilterOption
                  key={brand.id}
                  id={brand.id}
                  label={brand.name}
                  isSelected={filters.brands.includes(brand.id)}
                  onClick={() => handleBrandToggle(brand.id)}
                  className={`p-2 ${filters.brands.includes(brand.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Years */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-white">Years</span>
              <span className="text-[#FF4646]">All years</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {YEAR_RANGES.map((year) => (
                <FilterOption
                  key={year.id}
                  id={year.id}
                  label={year.name}
                  isSelected={filters.years.includes(year.id)}
                  onClick={() => handleYearToggle(year.id)}
                  className={filters.years.includes(year.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}
                />
              ))}
            </div>
          </div>

          {/* Seats */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-white">Number of seats</span>
              <span className="text-[#FF4646]">All seats</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SEAT_OPTIONS.map((seat) => (
                <FilterOption
                  key={seat.id}
                  id={seat.id}
                  label={seat.name}
                  isSelected={filters.seats.includes(seat.id)}
                  onClick={() => handleSeatToggle(seat.id)}
                  className={filters.seats.includes(seat.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}
                />
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-white">Transmission</span>
              <span className="text-[#FF4646]">All transmissions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TRANSMISSION_TYPES.map((transmission) => (
                <FilterOption
                  key={transmission.id}
                  id={transmission.id}
                  label={transmission.name}
                  isSelected={filters.transmission.includes(transmission.id)}
                  onClick={() => handleTransmissionToggle(transmission.id)}
                  className={filters.transmission.includes(transmission.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}
                />
              ))}
            </div>
          </div>
        </FilterGroup>

        {/* Eco-friendly */}
        <FilterGroup title="Eco-friendly">
          <div className="grid grid-cols-2 gap-4">
            {ECO_FRIENDLY_OPTIONS.map((option) => (
              <FilterOption
                key={option.id}
                id={option.id}
                label={option.name}
                icon={option.icon}
                isSelected={filters.ecoFriendly.includes(option.id)}
                onClick={() => handleEcoFriendlyToggle(option.id)}
                className={filters.ecoFriendly.includes(option.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}
              />
            ))}
          </div>
        </FilterGroup>

        {/* Features */}
        <FilterGroup title="Features">
          <div className="grid grid-cols-3 gap-4">
            {CAR_FEATURES.slice(0, 6).map((feature) => (
              <FilterOption
                key={feature.id}
                id={feature.id}
                label={feature.name}
                icon={feature.icon}
                isSelected={filters.features.includes(feature.id)}
                onClick={() => handleFeatureToggle(feature.id)}
                className={filters.features.includes(feature.id) ? 'border-[#FF4646] bg-[#FF4646]/10' : ''}
              />
            ))}
          </div>
          
          <button className="mt-4 text-[#FF4646] flex items-center hover:underline">
            <span className="mr-1">Show more</span>
            <ChevronRight size={16} />
          </button>
        </FilterGroup>

        {/* Mileage included */}
        <FilterGroup title="Mileage included">
          <RangeSlider
            min={0}
            max={500}
            step={10}
            minValue={0}
            maxValue={filters.mileage}
            onChange={handleMileageChange}
            formatValue={(value) => value === 0 ? 'Any mileage' : `${value} miles/day`}
          />
        </FilterGroup>

        {/* Pickup options */}
        <FilterGroup title="Pickup options">
          <Switch
            isChecked={filters.deliveryOption}
            onChange={handleDeliveryOptionToggle}
            label="Host brings the car to me"
            description="Show cars that can be delivered directly to an address or specific location."
          />
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter an address"
              className="w-full p-4 rounded-2xl bg-transparent border border-gray-700 text-white placeholder-gray-400"
              disabled={!filters.deliveryOption}
            />
          </div>
        </FilterGroup>

        {/* Elevate experience */}
        <FilterGroup title="Elevate your experience">
          <Switch
            isChecked={filters.deluxeClass}
            onChange={handleDeluxeClassToggle}
            label="Deluxe Class"
            description="Exclusive cars for guests ages 25+"
          />
        </FilterGroup>
      </div>

      {/* Floating Apply Button - Always visible while scrolling */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button 
          onClick={handleApplyFilters}
          className="bg-[#FF4646] hover:bg-[#FF3333] text-white px-6 py-3 rounded-full shadow-lg"
        >
          Apply Filters
        </Button>
      </div>

      {/* Apply button - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#212121] border-t border-gray-800">
        <Button 
          onClick={handleApplyFilters}
          size="lg"
          className="w-full"
        >
          Show 200+ results
        </Button>
      </div>
    </Sheet>
  );
};

export default FilterModal; 