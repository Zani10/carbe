import React from 'react';
import Image from 'next/image';

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
    <div className="w-full mb-8">
      <div className="space-y-6">
        {details.map((detail, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-400 text-sm">{detail.label}</span>
            </div>
            <div className="flex items-center">
              {detail.iconUrl && (
                <Image 
                  src={detail.iconUrl} 
                  alt={detail.label} 
                  width={36}
                  height={36}
                  className="w-9 h-9 mr-3 object-contain" 
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