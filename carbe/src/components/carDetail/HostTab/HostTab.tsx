import React from 'react';
import HostProfile from './HostProfile';
import HostDetails from './HostDetails';
import HostActions from './HostActions';
import HostPolicies from './HostPolicies';

interface HostData {
  name: string;
  description: string;
  profilePicture: string;
  languages: string;
  nationality: string;
  distance: string;
  rating: number;
  responseRate: number;
  responseTime: string;
  address: string;
  city: string;
  postalCode: string;
}

interface HostTabProps {
  hostData: HostData;
  price: number;
}

const HostTab: React.FC<HostTabProps> = ({ hostData, price }) => {
  return (
    <div className="flex flex-col space-y-6">
      <HostProfile 
        name={hostData.name}
        description={hostData.description}
        profilePicture={hostData.profilePicture}
        languages={hostData.languages}
        nationality={hostData.nationality}
        distance={hostData.distance}
        rating={hostData.rating}
      />
      
      <HostDetails 
        responseRate={hostData.responseRate}
        responseTime={hostData.responseTime}
        address={hostData.address}
        city={hostData.city}
        postalCode={hostData.postalCode}
        price={price}
      />
      
      <HostActions />
      
      <HostPolicies />
    </div>
  );
};

export default HostTab; 