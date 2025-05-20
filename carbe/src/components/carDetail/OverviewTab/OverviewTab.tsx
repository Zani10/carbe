import React from 'react';
import CarHeader from '../CarHeader';
import SpecsGrid from '../SpecsGrid';
import DetailsSection from '../DetailsSection';

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
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  carName,
  description,
  specs,
  details,
}) => {
  return (
    <div className="space-y-6">
      <CarHeader 
        name={carName} 
        description={description} 
      />
      <SpecsGrid specs={specs} />
      <DetailsSection details={details} />
    </div>
  );
};

export default OverviewTab; 