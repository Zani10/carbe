import React from 'react';
import { Car, Gauge, Fuel, ShieldCheck } from 'lucide-react';

const DetailsTab: React.FC = () => {
  return (
    <div className="space-y-6 lg:space-y-8">
      <h2 className="text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6">Driving Details</h2>
      
      {/* Desktop: 2-column layout, Mobile: Single column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-[#2A2A2A] rounded-xl p-6 lg:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-lg lg:text-xl font-medium flex items-center mb-6">
              <Car className="w-6 h-6 mr-3 text-[#FF4646]" />
              Performance
            </h3>
            
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">Engine</p>
                <p className="font-semibold text-white">3.0L Inline-6 Turbo</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">Power</p>
                <p className="font-semibold text-white">335 hp</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">0-60 mph</p>
                <p className="font-semibold text-white">4.8 seconds</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">Top Speed</p>
                <p className="font-semibold text-white">155 mph (limited)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-xl p-6 lg:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-lg lg:text-xl font-medium flex items-center mb-6">
              <Gauge className="w-6 h-6 mr-3 text-[#FF4646]" />
              Fuel Economy
            </h3>
            
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">Combined</p>
                <p className="font-semibold text-white">27 mpg</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">City</p>
                <p className="font-semibold text-white">23 mpg</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm lg:text-base text-gray-400">Highway</p>
                <p className="font-semibold text-white">32 mpg</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#2A2A2A] rounded-xl p-6 lg:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-lg lg:text-xl font-medium flex items-center mb-6">
              <Fuel className="w-6 h-6 mr-3 text-[#FF4646]" />
              Fuel Requirements
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
                Premium unleaded fuel (91 octane or higher) is required for optimal performance and engine protection.
              </p>
              <div className="bg-[#212121] rounded-lg p-4 border border-gray-600">
                <p className="text-[#FF4646] font-medium text-sm">⛽ Fuel Grade: Premium (91+ octane)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-xl p-6 lg:p-8 border border-gray-700 hover:border-gray-600 transition-colors">
            <h3 className="text-lg lg:text-xl font-medium flex items-center mb-6">
              <ShieldCheck className="w-6 h-6 mr-3 text-[#FF4646]" />
              Safety Features
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                'Adaptive Cruise Control',
                'Lane Departure Warning', 
                'Blind Spot Monitoring',
                'Automatic Emergency Braking',
                '360° Camera System',
                'Night Vision Assistant'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#FF4646] rounded-full flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm lg:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab; 