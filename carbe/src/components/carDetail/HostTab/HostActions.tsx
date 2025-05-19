import React from 'react';
import { MessageCircle, Calendar } from 'lucide-react';

interface HostActionsProps {
  onMessageHost?: () => void;
  onSelectDates?: () => void;
}

const HostActions: React.FC<HostActionsProps> = ({
  onMessageHost = () => {},
  onSelectDates = () => {},
}) => {
  return (
    <div className="mt-4">
      <button
        onClick={onMessageHost}
        className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-medium py-3.5 px-4 rounded-full flex items-center justify-center transition-colors"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        Message host
      </button>
      
      <div className="hidden">
        <button
          onClick={onSelectDates}
          className="bg-gradient-to-b from-[#E6E6E6] to-[#B0B0B0] rounded-full py-3 px-5 font-medium flex items-center"
        >
          <Calendar className="w-5 h-5 mr-2 text-gray-700" />
          <span className="text-gray-700">Select dates</span>
        </button>
      </div>
    </div>
  );
};

export default HostActions; 