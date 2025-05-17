import React from 'react';
import CarCard, { CarCardProps } from '../car/CarCard';

const mockedCars: CarCardProps[] = [
  {
    image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80', // BMW image from design
    rating: 4.8,
    isFavorite: true,
    makeModel: 'BMW B-Series', // From design
    location: 'Brussels, BE',
    transmission: 'Automatic',
    pricePerDay: 70, // From design
    distance: '2km', // From design
    brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png' // BMW Logo
  },
  {
    image: 'https://images.unsplash.com/photo-1580273916550-4c53a792947c?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80', // Mercedes image from design
    rating: 5.0,
    isFavorite: true, // Assuming favorite based on filled heart in second card of design
    makeModel: 'Mercedes GLB', // Approximation from design
    location: 'Ghent, BE',
    transmission: 'Automatic',
    pricePerDay: 85,
    distance: '10km',
    brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Benz_Logo_2010.svg/200px-Mercedes-Benz_Logo_2010.svg.png' // Mercedes Logo
  },
  // Add more mock cars if needed
];

const CarList = () => {
  return (
    <div 
      className="bg-slate-900/95 backdrop-blur-lg rounded-t-3xl pt-3 pb-[calc(4rem+1rem)] fixed bottom-0 left-0 right-0 h-[60vh] shadow-2xl z-10"
    >
      {/* Draggable handle bar */}
      <div className="w-16 h-1.5 bg-gray-600 hover:bg-gray-500 cursor-grab active:cursor-grabbing rounded-full mx-auto mb-3"></div>
      {/* Scrollable car cards area, ensure padding for the handle and bottom nav clearance */}
      <div className="overflow-y-auto h-[calc(100%_-_1.5rem_-_0.75rem)]"> {/* Total height minus handle height and its margin-bottom*/}
        {/* Removed px-2 and space-y-1 from here, CarCard now handles its own horizontal padding and vertical spacing */}
        {mockedCars.map((car, index) => (
          <CarCard key={index} {...car} />
        ))}
      </div>
    </div>
  );
};

export default CarList; 