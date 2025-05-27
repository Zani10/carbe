'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Map, List } from 'lucide-react';

interface MapToggleButtonProps {
  isMapView: boolean;
  onToggle: () => void;
}

const MapToggleButton: React.FC<MapToggleButtonProps> = ({ isMapView, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-40 bg-white hover:bg-gray-50 text-gray-800 rounded-full p-3 shadow-lg border border-gray-200 flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {isMapView ? (
        <>
          <List className="w-5 h-5" />
          <span className="text-sm font-medium">List</span>
        </>
      ) : (
        <>
          <Map className="w-5 h-5" />
          <span className="text-sm font-medium">Map</span>
        </>
      )}
    </motion.button>
  );
};

export default MapToggleButton; 