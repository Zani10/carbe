import React from 'react';
import { Clock } from 'lucide-react';

interface HostDetailsProps {
  responseRate: number;
  responseTime: string;
  address: string;
  city: string;
  postalCode: string;
  price: number;
}

const HostDetails: React.FC<HostDetailsProps> = ({
  responseRate,
  responseTime,
  address,
  city,
  postalCode,
  price,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#2A2A2A] rounded-xl p-4">
        <div className="text-lg font-medium mb-1">Details</div>
        
        <div className="flex items-center justify-between border-b border-gray-700 py-2">
          <div className="text-gray-300">Response rate</div>
          <div className="font-medium text-white">{responseRate}%</div>
        </div>
        
        <div className="flex items-center py-2">
          <Clock className="w-5 h-5 text-green-500 mr-2" />
          <div className="text-gray-300">{responseTime}</div>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-4">
        <div className="text-lg font-medium mb-1">Address</div>
        <div className="text-gray-300">
          {address}<br />
          {city}, {postalCode}
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-4">
        <div className="text-gray-400 text-sm">From</div>
        <div className="text-white font-bold text-2xl">
          ${price}<span className="text-sm font-normal text-gray-400">/day</span>
        </div>
      </div>
    </div>
  );
};

export default HostDetails; 