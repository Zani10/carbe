import React, { useState } from 'react';
import { X, Car, Check } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Vehicle } from '@/types/calendar';
import Image from 'next/image';

interface VehicleSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  selectedCarIds: string[];
  onVehicleChange: (vehicleIds: string[]) => void;
}

export default function VehicleSelectionSheet({
  isOpen,
  onClose,
  vehicles,
  selectedCarIds,
  onVehicleChange
}: VehicleSelectionSheetProps) {
  const [dragY, setDragY] = useState(0);

  const handleVehicleToggle = (vehicleId: string) => {
    const newSelection = selectedCarIds.includes(vehicleId)
      ? selectedCarIds.filter(id => id !== vehicleId)
      : [...selectedCarIds, vehicleId];
    
    onVehicleChange(newSelection);
  };

  const handleSelectAllVehicles = () => {
    if (selectedCarIds.length === vehicles.length) {
      // If all selected, deselect all except first one
      onVehicleChange([vehicles[0]?.id].filter(Boolean));
    } else {
      // Select all
      onVehicleChange(vehicles.map(v => v.id));
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150 || info.velocity.y > 300) {
      onClose();
    }
    setDragY(0);
  };

  const totalVehicleCount = vehicles.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDrag={(event, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ y: dragY }}
          >
            <div className="bg-[#212121] rounded-t-[28px] shadow-2xl border border-gray-700/50 overflow-hidden max-w-md mx-auto">
              
              {/* Handle Bar */}
              <div className="flex justify-center pt-2">
                <div className="w-10 h-1 bg-gray-400 rounded-full opacity-50" />
              </div>

              {/* Header */}
              <div className="px-4 pt-4 pb-2 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Select Vehicles</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedCarIds.length} of {totalVehicleCount} selected
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                
                {/* Select All Option */}
                <button
                  onClick={handleSelectAllVehicles}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-all duration-200 rounded-2xl group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center group-hover:bg-gray-600/50 transition-colors">
                      <Car className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">All Vehicles</div>
                      <div className="text-gray-400 text-sm">Select entire fleet</div>
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    selectedCarIds.length === vehicles.length
                      ? 'bg-red-500 border-red-500 scale-110'
                      : 'border-gray-600 group-hover:border-gray-500'
                  }`}>
                    {selectedCarIds.length === vehicles.length && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>

                {/* Divider */}
                <div className="border-t border-gray-700/50" />

                {/* Individual Vehicles */}
                <div className="space-y-2">
                  {vehicles.map(vehicle => {
                    const isSelected = selectedCarIds.includes(vehicle.id);
                    
                    return (
                      <button
                        key={vehicle.id}
                        onClick={() => handleVehicleToggle(vehicle.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-all duration-200 rounded-2xl group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Car Image or Icon */}
                          <div className="w-12 h-12 bg-gray-700/50 rounded-xl overflow-hidden flex items-center justify-center group-hover:bg-gray-600/50 transition-colors">
                            {vehicle.image ? (
                              <Image
                                src={vehicle.image}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Car className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          
                          {/* Vehicle Info */}
                          <div className="text-left">
                            <div className="text-white font-medium">
                              {vehicle.name || `${vehicle.make} ${vehicle.model}`}
                            </div>
                            <div className="text-gray-400 text-sm">
                              €{vehicle.base_price}/day • {vehicle.type}
                            </div>
                          </div>
                        </div>
                        
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-red-500 border-red-500 scale-110'
                            : 'border-gray-600 group-hover:border-gray-500'
                        }`}>
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700/50">
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-[#FF4646] hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Done ({selectedCarIds.length} selected)
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 