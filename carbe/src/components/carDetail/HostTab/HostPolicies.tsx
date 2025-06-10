import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PolicySectionProps {
  title: string;
  summary: string;
  details?: string;
}

const PolicySection: React.FC<PolicySectionProps> = ({
  title,
  summary,
  details = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-700 py-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-base font-medium text-white">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{summary}</p>
        </div>
        <button 
          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          {isExpanded ? 
            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
            <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </button>
      </div>
      
      {isExpanded && details && (
        <div className="mt-3 text-gray-300 text-sm leading-relaxed">
          {details}
        </div>
      )}
    </div>
  );
};

const HostPolicies: React.FC = () => {
  return (
    <div className="mt-4">
      <PolicySection 
        title="Cancellation policy"
        summary="Free cancellation up to 48 hours before pickup"
        details="Free cancellation up to 48 hours before the trip starts. After that, the booking is non-refundable. If you're more than 1 hour late for pickup, the booking will be considered a no-show and you will be charged the full amount."
      />
      
      <PolicySection 
        title="Car rules"
        summary="No smoking, same fuel level, clean return required"
        details="1. No smoking in the car
2. Return with the same fuel level
3. Return in a clean condition
4. No pets allowed
5. No food or drinks in the car
6. Check-in after 9:00 AM
7. Check-out before 6:00 PM"
      />
      
      <PolicySection 
        title="Safety & insurance"
        summary="Comprehensive coverage with €500 deductible"
        details="This car comes with comprehensive insurance covering damage and theft up to €20,000 with a €500 deductible. In case of an accident, you will only be liable for the deductible amount. Road-side assistance is included in the rental."
      />
    </div>
  );
};

export default HostPolicies; 