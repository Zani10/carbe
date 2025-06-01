import React from 'react';
import CarHeader from '../CarHeader';
import SpecsGrid from '../SpecsGrid';
import DetailsSection from '../DetailsSection';
import MessageHostButton from '../MessageHostButton';

interface OverviewTabProps {
  carName: string;
  description: string;
  specs: {
    icon: 'range' | 'seats' | 'powertrain';
    value: string;
    subtext: string;
  }[];
  details: {
    label: string;
    value: string;
    iconUrl?: string;
  }[];
  carId?: string;
  hostId?: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  carName,
  description,
  specs,
  details,
  carId,
  hostId,
}) => {
  return (
    <div className="space-y-6">
      <CarHeader 
        name={carName} 
        description={description} 
      />
      <SpecsGrid specs={specs} />
      <DetailsSection details={details} />
      
      {/* Message Host Button */}
      {carId && hostId && (
        <div className="pt-4">
          <MessageHostButton
            carId={carId}
            hostId={hostId}
            carName={carName}
            variant="secondary"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default OverviewTab; 