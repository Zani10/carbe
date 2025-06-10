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

// Create price marker with active and hovered states (like Airbnb)
const createPriceIcon = (price: number, isActive: boolean = false, isHovered: boolean = false) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const activeClass = isActive ? 'price-marker-active' : '';
  const hoveredClass = isHovered ? 'price-marker-hovered' : '';
  const scale = isActive ? 1.15 : (isHovered ? 1.1 : 1);
  const zIndex = isActive ? 2000 : (isHovered ? 1500 : 1000); // Higher z-index for active/hovered markers

  return new L.DivIcon({
    html: `
      <div class="price-marker ${activeClass} ${hoveredClass}" style="transform: scale(${scale}); z-index: ${zIndex}; position: relative;">
        <span class="price-text">${formatPrice(price)}</span>
      </div>
    `,
    className: '',
    iconSize: [60, 32],
    iconAnchor: [30, 16],
    popupAnchor: [0, -16],
  });
};

// Add small random jitter to coordinates to prevent exact overlaps
const addJitter = (coords: { lat: number; lng: number }) => {
  const jitterAmount = 0.0002; // ~20 meters
  return {
    lat: coords.lat + (Math.random() - 0.5) * jitterAmount,
    lng: coords.lng + (Math.random() - 0.5) * jitterAmount,
  };
};

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

// Component to handle map updates and resize
const MapUpdater: React.FC<{ center: Coordinates; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
    // Fix rendering issues by invalidating size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, map, zoom]);

  // Handle resize when container changes
  useEffect(() => {
    const container = map.getContainer();
    
    const resizeObserver = new ResizeObserver(() => {
      // Multiple invalidations with different timings to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize({ animate: false });
      }, 50);
      setTimeout(() => {
        map.invalidateSize({ animate: false });
      }, 150);
      setTimeout(() => {
        map.invalidateSize({ animate: false });
      }, 300);
    });

    if (container) {
      resizeObserver.observe(container);
    }

    // Also listen for window resize
    const handleWindowResize = () => {
      setTimeout(() => {
        map.invalidateSize({ animate: false });
      }, 100);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [map]);
  
  return null;
};

interface MapProps {
  center: Coordinates;
  zoom: number;
  listings: CarWithCoordinates[];
  userLocation: Coordinates | null;
  onMarkerClick: (car: CarWithCoordinates) => void;
  activeId?: string | null;
  hoveredId?: string | null;
}

const Map: React.FC<MapProps> = ({ center, zoom, listings, userLocation, onMarkerClick, activeId, hoveredId }) => {
  return (
    <>
      {/* Add custom styles for markers */}
      <style jsx global>{`
        .price-marker {
          background: white;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 6px 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 13px;
          color: #222;
          position: relative;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .price-marker:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          z-index: 1001;
        }
        
        .price-marker-active {
          background: #FF4646 !important;
          color: white !important;
          border-color: #FF4646 !important;
          box-shadow: 0 4px 12px rgba(255, 70, 70, 0.4) !important;
        }
        
        .price-marker-active .price-text {
          color: white !important;
        }
        
        .price-marker-hovered {
          background: #FF4646 !important;
          color: white !important;
          border-color: #FF4646 !important;
          box-shadow: 0 4px 12px rgba(255, 70, 70, 0.3) !important;
          transform: scale(1.1) !important;
        }
        
        .price-marker-hovered .price-text {
          color: white !important;
        }
        
        .price-text {
          white-space: nowrap;
          line-height: 1;
          text-align: center;
          display: block;
        }
        
        .user-marker {
          width: 20px;
          height: 20px;
          position: relative;
        }
        
        .user-marker-inner {
          width: 20px;
          height: 20px;
          background: #FF4646;
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
          background: rgba(255, 70, 70, 0.3);
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
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>Your location</Popup>
          </Marker>
        )}
        
        {/* Car markers with jitter */}
        {listings.map((car) => {
          const jitteredCoords = addJitter({ lat: car.lat, lng: car.lng });
          const isActive = activeId === car.id;
          const isHovered = hoveredId === car.id;
          
          return (
            <Marker
              key={car.id}
              position={[jitteredCoords.lat, jitteredCoords.lng]}
              icon={createPriceIcon(car.pricePerDay, isActive, isHovered)}
              eventHandlers={{
                click: () => onMarkerClick(car),
              }}
            >

            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
};

export default Map; 