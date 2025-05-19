import React from 'react';
import { Calendar } from 'lucide-react';

interface StickyFooterBarProps {
  price: number;
  currency?: string;
  onSelectDates?: () => void;
}

const StickyFooterBar: React.FC<StickyFooterBarProps> = ({
  price,
  currency = '$',
  onSelectDates = () => {},
}) => {
  return (
    <div 
      className="fixed bottom-4 left-4 right-4 rounded-full px-5 py-4 flex justify-between items-center"
      style={{
        backgroundColor: '#292929',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="flex flex-col ml-2">
        <span className="text-gray-400 text-xs">From</span>
        <span className="text-white font-bold text-2xl">
          {currency}{price}<span className="text-sm font-normal text-gray-400">/day</span>
        </span>
      </div>
      
      <button
        onClick={onSelectDates}
        className="bg-gradient-to-b from-[#E6E6E6] to-[#B0B0B0] rounded-full py-3 px-5 font-medium flex items-center"
      >
        <Calendar className="w-5 h-5 mr-2 text-gray-700" />
        <span className="text-gray-700">Select dates</span>
      </button>
    </div>
  );
};

export default StickyFooterBar; 