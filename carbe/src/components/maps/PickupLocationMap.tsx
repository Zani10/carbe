'use client';

import { useState } from 'react';
import { MapPin, Navigation, Copy, ExternalLink } from 'lucide-react';

interface PickupLocationMapProps {
  address?: string;
  className?: string;
}

export default function PickupLocationMap({ 
  address = "Contact host for pickup location", 
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
      {/* Map Placeholder */}
      <div className="relative h-48 bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50">
        {/* Map placeholder with marker */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center relative">
          {/* Grid pattern overlay for map feel */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          {/* Center marker */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#FF2800] rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <MapPin className="h-5 w-5 text-white" />
            </div>
          </div>
          
          {/* Map attribution style text */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Map view
          </div>
        </div>
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