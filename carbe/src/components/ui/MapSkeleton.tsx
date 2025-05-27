import React from 'react';

const MapSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-300 relative overflow-hidden">
      {/* Skeleton map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 animate-pulse">
        {/* Fake roads/paths */}
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-500 opacity-30 transform rotate-12"></div>
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-500 opacity-30 transform -rotate-6"></div>
        <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-500 opacity-30 transform rotate-3"></div>
        
        {/* Fake building blocks */}
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-gray-400 opacity-40"></div>
        <div className="absolute top-1/2 left-3/4 w-6 h-6 bg-gray-400 opacity-40"></div>
        <div className="absolute bottom-1/3 right-1/4 w-10 h-6 bg-gray-400 opacity-40"></div>
      </div>
      
      {/* Skeleton markers */}
      <div className="absolute top-1/4 left-1/3 w-10 h-10 bg-gray-400 rounded-full animate-pulse"></div>
      <div className="absolute top-2/3 right-1/3 w-10 h-10 bg-gray-400 rounded-full animate-pulse delay-100"></div>
      <div className="absolute bottom-1/4 left-2/3 w-10 h-10 bg-gray-400 rounded-full animate-pulse delay-200"></div>
      
      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 rounded-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading map data...</span>
        </div>
      </div>
    </div>
  );
};

export default MapSkeleton; 