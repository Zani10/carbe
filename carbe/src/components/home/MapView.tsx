'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CarWithCoordinates, getUserLocation, Coordinates } from '@/lib/geocode';
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
  activeId?: string | null;
  hoveredId?: string | null;
  onMarkerClick?: (id: string) => void;
  mapCenter?: { lat: number; lng: number; zoom?: number } | null;
}

const MapView: React.FC<MapViewProps> = ({ 
  listings = [], 
  isLoading = false, 
  activeId,
  hoveredId,
  onMarkerClick,
  mapCenter: externalMapCenter
}) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 50.8503, lng: 4.3517 }); // Brussels coordinates
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Get user location on mount
  useEffect(() => {
    getUserLocation().then((location) => {
      setUserLocation(location);
      if (!externalMapCenter) {
        setMapCenter(location);
      }
    });
  }, [externalMapCenter]);

  // Update map center and zoom when external mapCenter changes
  useEffect(() => {
    if (externalMapCenter) {
      setMapCenter({ lat: externalMapCenter.lat, lng: externalMapCenter.lng });
      if (externalMapCenter.zoom) {
        setMapZoom(externalMapCenter.zoom);
      }
    }
  }, [externalMapCenter]);

  const handleMarkerClick = (car: CarWithCoordinates) => {
    // Pan map to marker's coordinates
    setMapCenter({ lat: car.lat, lng: car.lng });
    // Notify parent about marker click
    if (onMarkerClick) {
      onMarkerClick(car.id);
    }
  };

  // Show skeleton while loading or if no listings yet
  if (isLoading || listings.length === 0) {
    return <MapSkeleton />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Map
        center={mapCenter}
        zoom={mapZoom}
        listings={listings}
        userLocation={userLocation}
        onMarkerClick={handleMarkerClick}
        activeId={activeId}
        hoveredId={hoveredId}
      />
      
    </div>
  );
};

export default MapView; 