'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { CarWithCoordinates, getUserLocation, calculateDistance, Coordinates } from '@/lib/geocode';
import MapListingCard from '../maps/MapListingCard';
import MapSkeleton from '../ui/MapSkeleton';

// Dynamic import to avoid SSR issues with Leaflet
const Map = dynamic(() => import('../maps/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
      <div className="text-gray-600">Loading map...</div>
    </div>
  )
});

interface MapViewProps {
  listings?: CarWithCoordinates[];
  isLoading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ listings = [], isLoading = false }) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarWithCoordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 52.3676, lng: 4.9041 });

  // Get user location on mount
  useEffect(() => {
    getUserLocation().then((location) => {
      setUserLocation(location);
      setMapCenter(location);
    });
  }, []);

  // Calculate distances for the selected car
  const selectedCarDistance = useMemo(() => {
    if (!selectedCar || !userLocation) return undefined;
    return calculateDistance(userLocation, { lat: selectedCar.lat, lng: selectedCar.lng });
  }, [selectedCar, userLocation]);

  const handleMarkerClick = (car: CarWithCoordinates) => {
    setSelectedCar(car);
  };

  const handleCloseCard = () => {
    setSelectedCar(null);
  };

  // Show skeleton while loading or if no listings yet
  if (isLoading || listings.length === 0) {
    return <MapSkeleton />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Map
        center={mapCenter}
        listings={listings}
        userLocation={userLocation}
        onMarkerClick={handleMarkerClick}
      />
      
      {/* Selected car panel */}
      <AnimatePresence>
        {selectedCar && (
          <MapListingCard
            car={selectedCar}
            distance={selectedCarDistance}
            onClose={handleCloseCard}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapView; 