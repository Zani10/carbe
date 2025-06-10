'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Copy, ExternalLink, Loader2 } from 'lucide-react';

// Dynamically import the map to avoid SSR issues
const DynamicMap = dynamic(() => import('./PickupMapRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-gray-800 rounded-xl border border-gray-700/50 flex items-center justify-center">
      <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
    </div>
  ),
});

interface PickupLocationMapProps {
  address?: string;
  coordinates?: { lat: number; lng: number };
  className?: string;
}

export default function PickupLocationMap({ 
  address = "Contact host for pickup location",
  coordinates = { lat: 52.3676, lng: 4.9041 }, // Default Amsterdam center 
  className = '' 
}: PickupLocationMapProps) {
  const [copied, setCopied] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState(coordinates);

  // Geocode address to get actual coordinates
  const geocodeAddress = async (addressToGeocode: string) => {
    if (addressToGeocode.includes("Contact host for pickup")) return;
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressToGeocode)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setMapCoordinates(newCoords);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  // Effect to geocode address when it changes
  React.useEffect(() => {
    if (address && !address.includes("Contact host for pickup")) {
      geocodeAddress(address);
    }
  }, [address]);

  const copyAddress = async () => {
    if (!address || address.includes("Contact host for pickup")) {
      console.warn('Cannot copy address: invalid or placeholder address');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy method also failed:', fallbackErr);
      }
    }
  };

  const openDirections = () => {
    if (address.includes("Contact host for pickup")) return;
    
    const encodedAddress = encodeURIComponent(address);
    const coords = `${mapCoordinates.lat},${mapCoordinates.lng}`;
    
    // Detect user agent and open appropriate maps app
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      // Try Apple Maps with coordinates first, fallback to address
      window.open(`maps://maps.apple.com/?daddr=${coords}&dirflg=d`, '_blank');
    } else if (isAndroid) {
      // Open Google Maps with navigation to coordinates
      window.open(`google.navigation:q=${coords}`, '_blank');
    } else {
      // Open Google Maps in browser with directions
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Leaflet Map */}
      <div className="relative h-48 rounded-xl overflow-hidden border border-gray-700/50">
        <DynamicMap 
          center={mapCoordinates}
        />
      </div>

      {/* Address and Actions */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-white text-sm leading-relaxed">
              {address}
            </p>
            {!address.includes("Contact host for pickup") && (
              <p className="text-xs text-gray-400 mt-1">Pickup and return location</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={openDirections}
            disabled={address.includes("Contact host for pickup")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              address.includes("Contact host for pickup")
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-white bg-[#FF4646] hover:bg-[#FF4646]/90 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>Get Directions</span>
          </button>

          {address && !address.includes("Contact host for pickup") && (
            <button
              onClick={copyAddress}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 transition-all"
            >
              {copied ? (
                <>
                  <ExternalLink className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 