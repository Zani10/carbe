import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import MapView from '../../home/MapView';
import type { Car } from '@/types/car';

interface PickupTabProps {
  car: Car;
}

const PickupTab: React.FC<PickupTabProps> = ({ car }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6">Pickup Location</h2>
      
      {/* Mobile: Show map, Desktop: Hide map (since it's on the right side) */}
      <div className="bg-[#2A2A2A] rounded-xl overflow-hidden lg:hidden">
        <div className="w-full h-48 rounded-xl overflow-hidden">
          <MapView
            listings={[{
              id: car.id,
              make: car.make,
              model: car.model,
              location: car.location || 'Brussels',
              pricePerDay: car.price_per_day,
              lat: 50.8503, // Default Brussels coordinates
              lng: 4.3517,
              images: car.images || [],
              rating: car.rating || 4.5
            }]}
            mapCenter={{
              lat: 50.8503,
              lng: 4.3517,
              zoom: 15
            }}
            activeId={car.id}
          />
        </div>
      </div>
      
      {/* Address and Details */}
      <div className="bg-[#2A2A2A] rounded-xl p-6 lg:p-8 border border-gray-700">
        <h3 className="text-lg lg:text-xl font-medium mb-4">Address</h3>
        <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
          Avenue de la Diplomé 23<br />
          Koekelberg, 1081<br />
          Brussels, Belgium
        </p>
        
        <div className="mt-6 space-y-6">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF4646] mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white lg:text-lg">Availability</h4>
              <p className="text-gray-300 text-sm lg:text-base mt-1">
                Available 7 days a week<br />
                Minimum rental: 1 day<br />
                Maximum rental: 30 days
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF4646] mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white lg:text-lg">Pickup/Return Hours</h4>
              <p className="text-gray-300 text-sm lg:text-base mt-1">
                Pickup: 9:00 AM - 7:00 PM<br />
                Return: 9:00 AM - 6:00 PM<br />
                <span className="text-yellow-400">Note: After-hours pickup available on request</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-6 lg:p-8 border border-gray-700">
        <h3 className="text-lg lg:text-xl font-medium mb-4 text-white">Parking Instructions</h3>
        <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
          The car is parked in the designated Carbe parking area, marked with green signs. When you arrive, look for parking spot B12. The car will be unlocked remotely once you confirm your arrival through the app.
        </p>
      </div>
    </div>
  );
};

export default PickupTab; 