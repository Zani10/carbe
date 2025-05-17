import React from 'react';

// interface MapViewProps {} // Removed empty interface

const MapView = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-300">
      {/* Fake map image - using a brighter, cleaner map style */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/4.35,50.85,12,0/1280x1280?access_token=pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xqcWthMm03MGlrMDNkbzRvcXg0bm9lZSJ9.i8RbC-b3En6-Zk2itEkSGQ')",
          filter: "saturate(0.8) brightness(1.1) contrast(0.95)"
        }}
      ></div>
      
      {/* Car Markers - larger, more prominent, and styled like the XD */}
      {[ // Array of marker positions for easier management
        { left: '25%', top: '35%' },
        { left: '50%', top: '20%' },
        { left: '65%', top: '50%' },
      ].map((pos, index) => (
        <div 
          key={index}
          className="absolute w-11 h-11 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: pos.left, top: pos.top }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 16.94V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.06"/>
            <path d="M14 9V5.5A2.5 2.5 0 0 0 11.5 3h-2A2.5 2.5 0 0 0 7 5.5V9"/>
            <path d="M2 12h20"/>
            <path d="M7 12v0M17 12v0"/>
            <circle cx="7" cy="16.94" r="2.94"/>
            <circle cx="17" cy="16.94" r="2.94"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default MapView; 