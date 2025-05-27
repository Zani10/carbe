'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CarWithCoordinates, Coordinates } from '@/lib/geocode';

// Fix for default markers in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom car marker icon
const carIcon = new L.DivIcon({
  html: `
    <div class="car-marker">
      <div class="car-marker-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 16.94V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.06"/>
          <path d="M14 9V5.5A2.5 2.5 0 0 0 11.5 3h-2A2.5 2.5 0 0 0 7 5.5V9"/>
          <path d="M2 12h20"/>
          <path d="M7 12v0M17 12v0"/>
          <circle cx="7" cy="16.94" r="2.94"/>
          <circle cx="17" cy="16.94" r="2.94"/>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

// User location marker icon
const userIcon = new L.DivIcon({
  html: `
    <div class="user-marker">
      <div class="user-marker-inner"></div>
      <div class="user-marker-pulse"></div>
    </div>
  `,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map updates
const MapUpdater: React.FC<{ center: Coordinates }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  
  return null;
};

interface MapProps {
  center: Coordinates;
  listings: CarWithCoordinates[];
  userLocation: Coordinates | null;
  onMarkerClick: (car: CarWithCoordinates) => void;
}

const Map: React.FC<MapProps> = ({ center, listings, userLocation, onMarkerClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Add custom styles for markers */}
      <style jsx global>{`
        .car-marker {
          width: 44px;
          height: 44px;
          position: relative;
          cursor: pointer;
        }
        
        .car-marker-inner {
          width: 44px;
          height: 44px;
          background: #10b981;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        
        .car-marker:hover .car-marker-inner {
          transform: scale(1.1);
          background: #059669;
        }
        
        .user-marker {
          width: 20px;
          height: 20px;
          position: relative;
        }
        
        .user-marker-inner {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 2;
          position: relative;
        }
        
        .user-marker-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite;
          z-index: 1;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
      
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={center} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>Your location</Popup>
          </Marker>
        )}
        
        {/* Car markers */}
        {listings.map((car) => (
          <Marker
            key={car.id}
            position={[car.lat, car.lng]}
            icon={carIcon}
            eventHandlers={{
              click: () => onMarkerClick(car),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg mb-1">
                  {car.make} {car.model}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{car.location}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-600">
                    {formatPrice(car.pricePerDay)}/day
                  </span>
                  {car.rating && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      <span className="text-sm">{car.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default Map; 