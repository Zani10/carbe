import React from 'react';

interface DetailItem {
  label: string;
  value: string;
  iconUrl?: string;
}

interface DetailsSectionProps {
  details: DetailItem[];
}

const DetailsSection: React.FC<DetailsSectionProps> = ({ details }) => {
  return (
    <div className="w-full mb-6">
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">{detail.label}</span>
            <div className="flex items-center">
              {detail.iconUrl && (
                <img 
                  src={detail.iconUrl} 
                  alt={detail.label} 
                  className="w-8 h-8 mr-2 object-contain" 
                />
              )}
              <span className="text-white font-medium">{detail.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailsSection; 