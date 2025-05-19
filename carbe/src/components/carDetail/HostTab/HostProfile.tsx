import React from 'react';
import { MapPin, Star } from 'lucide-react';

interface HostProfileProps {
  name: string;
  description: string;
  profilePicture: string;
  languages: string;
  nationality: string;
  distance: string;
  rating: number;
}

const HostProfile: React.FC<HostProfileProps> = ({
  name,
  description,
  profilePicture,
  languages,
  nationality,
  distance,
  rating,
}) => {
  return (
    <div className="text-white">
      <h2 className="text-2xl font-semibold mb-2">{name}</h2>
      <p className="text-gray-300 mb-4">{description}</p>
      
      <div className="bg-[#2A2A2A] rounded-xl p-4 flex flex-col md:flex-row">
        {/* Profile picture and basic info */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={profilePicture} 
              alt={`${name} profile`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-400">Name</div>
            <div className="font-medium">{name}</div>
            
            <div className="text-sm text-gray-400 mt-2">Nationality</div>
            <div className="font-medium">{nationality}</div>
          </div>
        </div>
        
        {/* Languages and rating info */}
        <div className="flex flex-col mt-4 md:mt-0 md:ml-8">
          <div className="text-sm text-gray-400">Languages</div>
          <div className="font-medium">{languages}</div>
          
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-green-500 mr-1" />
              <span>{distance}</span>
            </div>
            
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile; 