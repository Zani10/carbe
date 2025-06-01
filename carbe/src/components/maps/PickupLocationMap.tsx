'use client';

import { useState, useEffect } from 'react';
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

  const copyAddress = async () => {
    if (address !== "Contact host for pickup location") {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const openDirections = () => {
    if (address === "Contact host for pickup location") return;
    
    const encodedAddress = encodeURIComponent(address);
    
    // Detect user agent and open appropriate maps app
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      // Open Apple Maps on iOS
      window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
    } else if (isAndroid) {
      // Open Google Maps on Android
      window.open(`google.navigation:q=${encodedAddress}`, '_blank');
    } else {
      // Open Google Maps in browser as fallback
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Leaflet Map */}
      <div className="relative h-48 rounded-xl overflow-hidden border border-gray-700/50">
        <DynamicMap 
          center={coordinates}
          address={address}
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
            {address !== "Contact host for pickup location" && (
              <p className="text-xs text-gray-400 mt-1">Pickup and return location</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={openDirections}
            disabled={address === "Contact host for pickup location"}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              address === "Contact host for pickup location"
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-[#FF2800] hover:text-[#FF2800]/80 hover:bg-[#FF2800]/5'
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>Get Directions</span>
          </button>

          {address !== "Contact host for pickup location" && (
            <button
              onClick={copyAddress}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
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