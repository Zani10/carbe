import React from 'react';
import SearchBar from '@/components/home/SearchBar';
import MapView from '@/components/home/MapView';
import CarList from '@/components/home/CarList';
import BottomNav from '@/components/layout/BottomNav';

export default function HomePage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      {/* SearchBar positioned at the top, over the map */}
      <header className="absolute top-0 left-0 right-0 z-30 w-full flex justify-center pt-3 pb-2">
        {/* Added pb-2 to header for slight spacing if searchbar has outer margin y */}
        <SearchBar />
      </header>

      {/* MapView takes up available space, CarList will overlay it */}
      <div className="flex-grow h-screen w-full absolute inset-0"> {/* Ensure MapView fills entire screen behind overlays*/}
        <MapView />
      </div>

      {/* CarList is the scrollable sheet from the bottom (z-10 in its own file) */}
      <CarList />

      {/* BottomNav is fixed at the very bottom (z-30 in its own file, to be updated) */}
      <BottomNav />
    </div>
  );
}
