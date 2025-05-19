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
      className="fixed bottom-0 left-0 right-0 rounded-t-xl shadow-lg px-4 py-3 flex justify-between items-center"
      style={{
        backgroundColor: '#292929',
        boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div className="flex flex-col">
        <span className="text-gray-400 text-xs">From</span>
        <span className="text-white font-bold text-2xl">
          {currency}{price}<span className="text-sm font-normal text-gray-400">/day</span>
        </span>
      </div>
      
      <button
        onClick={onSelectDates}
        className="text-white rounded-full py-3 px-5 font-medium flex items-center"
        style={{
          background: 'linear-gradient(to bottom, #E6E6E6, #B0B0B0)'
        }}
      >
        <Calendar className="w-5 h-5 mr-2 text-gray-700" />
        <span className="text-gray-700">Select dates</span>
      </button>
    </div>
  );
};

export default StickyFooterBar; 