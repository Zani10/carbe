'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pickup location marker
const pickupIcon = new L.DivIcon({
  html: `
    <div class="pickup-marker">
      <div class="pickup-marker-inner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="white"/>
          <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" fill="#FF2800"/>
        </svg>
      </div>
      <div class="pickup-marker-pulse"></div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map updates
const MapUpdater: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], 15);
    // Fix rendering issues
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, map]);

  return null;
};

interface PickupMapRendererProps {
  center: { lat: number; lng: number };
}

const PickupMapRenderer: React.FC<PickupMapRendererProps> = ({ center }) => {
  return (
    <>
      {/* Custom styles for pickup marker */}
      <style jsx global>{`
        .pickup-marker {
          width: 32px;
          height: 32px;
          position: relative;
          z-index: 1000;
        }
        
        .pickup-marker-inner {
          width: 32px;
          height: 32px;
          background: #FF2800;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 2;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pickup-marker-inner svg {
          transform: rotate(45deg);
        }
        
        .pickup-marker-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: rgba(255, 40, 0, 0.3);
          animation: pickup-pulse 2s infinite;
          z-index: 1;
          transform: rotate(-45deg);
        }
        
        @keyframes pickup-pulse {
          0% {
            transform: rotate(-45deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: rotate(-45deg) scale(1.3);
            opacity: 0.7;
          }
          100% {
            transform: rotate(-45deg) scale(1.6);
            opacity: 0;
          }
        }
        
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 12px;
        }
        
        /* Dark theme for the map */
        .leaflet-tile {
          filter: brightness(0.8) contrast(1.2) saturate(0.8);
        }
      `}</style>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[center.lat, center.lng]} icon={pickupIcon}>
        </Marker>
        <MapUpdater center={center} />
      </MapContainer>
    </>
  );
};

export default PickupMapRenderer; 