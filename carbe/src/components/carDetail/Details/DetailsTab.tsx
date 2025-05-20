import React from 'react';
import { Car, Gauge, Fuel, ShieldCheck } from 'lucide-react';

const DetailsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Driving Details</h2>
      
      <div className="bg-[#2A2A2A] rounded-xl p-5 space-y-5">
        <h3 className="text-lg font-medium flex items-center">
          <Car className="w-5 h-5 mr-2 text-[#FF2800]" />
          Performance
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Engine</p>
            <p className="font-medium">3.0L Inline-6 Turbo</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Power</p>
            <p className="font-medium">335 hp</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">0-60 mph</p>
            <p className="font-medium">4.8 seconds</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Top Speed</p>
            <p className="font-medium">155 mph (limited)</p>
          </div>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-5 space-y-5">
        <h3 className="text-lg font-medium flex items-center">
          <Gauge className="w-5 h-5 mr-2 text-[#FF2800]" />
          Fuel Economy
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-400">Combined</p>
            <p className="font-medium">27 mpg</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">City</p>
            <p className="font-medium">23 mpg</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Highway</p>
            <p className="font-medium">32 mpg</p>
          </div>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-5 space-y-5">
        <h3 className="text-lg font-medium flex items-center">
          <Fuel className="w-5 h-5 mr-2 text-[#FF2800]" />
          Fuel Requirements
        </h3>
        
        <div>
          <p className="text-gray-300">Premium unleaded fuel (91 octane or higher) is required for this vehicle.</p>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-5 space-y-5">
        <h3 className="text-lg font-medium flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-[#FF2800]" />
          Safety Features
        </h3>
        
        <ul className="space-y-2 text-gray-300">
          <li>• Adaptive Cruise Control</li>
          <li>• Lane Departure Warning</li>
          <li>• Blind Spot Monitoring</li>
          <li>• Automatic Emergency Braking</li>
          <li>• 360° Camera System</li>
          <li>• Night Vision Assistant</li>
        </ul>
      </div>
    </div>
  );
};

export default DetailsTab; 