import React from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

const PickupTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Pickup Location</h2>
      
      <div className="bg-[#2A2A2A] rounded-xl overflow-hidden">
        {/* Placeholder for map - in a real implementation, this would be a Google Map or similar */}
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center relative">
          <div className="text-gray-400">Interactive map will be displayed here</div>
          <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center">
            <MapPin className="w-4 h-4 text-green-500 mr-1.5" />
            <span className="text-white text-sm">1.5km from you</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Address</h3>
          <p className="text-gray-300">
            Avenue de la Diplomé 23<br />
            Koekelberg, 1081<br />
            Brussels, Belgium
          </p>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-[#FF2800] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Availability</h4>
                <p className="text-gray-300 text-sm">
                  Available 7 days a week<br />
                  Minimum rental: 1 day<br />
                  Maximum rental: 30 days
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-[#FF2800] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Pickup/Return Hours</h4>
                <p className="text-gray-300 text-sm">
                  Pickup: 9:00 AM - 7:00 PM<br />
                  Return: 9:00 AM - 6:00 PM<br />
                  <span className="text-yellow-400">Note: After-hours pickup available on request</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#2A2A2A] rounded-xl p-4">
        <h3 className="text-lg font-medium mb-2">Parking Instructions</h3>
        <p className="text-gray-300">
          The car is parked in the designated Carbe parking area, marked with green signs. When you arrive, look for parking spot B12. The car will be unlocked remotely once you confirm your arrival through the app.
        </p>
      </div>
    </div>
  );
};

export default PickupTab; 