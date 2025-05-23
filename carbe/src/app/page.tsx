'use client'

import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import SearchBar from '@/components/home/SearchBar';
import MapView from '@/components/home/MapView';
import CarList from '@/components/home/CarList';

const SEARCHBAR_HEIGHT_PX = 68; // Consistent with SearchBar and CarList

export default function HomePage() {
  const [carListY, setCarListY] = useState(0);

  const handleCarListDrag = (yValue: number) => {
    setCarListY(yValue);
  };

  const handleSearch = (params: {
    location: string;
    dates: [Date | null, Date | null];
  }) => {
    // Here you would typically fetch cars based on the search parameters
    console.log('Searching with params:', params);
  };

  // The map should translate upwards by the same amount the CarList panel effectively moves up.
  // carListY is the direct y offset from react-spring (negative when panel moves up).
  const mapAnimation = useSpring({
    transform: `translateY(${carListY}px)`,
    config: { tension: 280, friction: 30 } // Match CarList's spring for synchronization
  });

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#212121] overflow-hidden">
      {/* MapView container: Fixed position, padded at the top for SearchBar, animated */}
      <animated.div 
        className="absolute inset-0 z-0 w-full h-full"
        style={{
          paddingTop: `${SEARCHBAR_HEIGHT_PX}px`,
          ...mapAnimation
        }}
      >
        <MapView />
      </animated.div>

      {/* SearchBar: Fixed at the top */}
      <header className="fixed top-0 left-0 right-0 z-30 w-full">
        <SearchBar onSearch={handleSearch} />
      </header>

      {/* CarList: Draggable panel, provides drag data via onDrag */}
      <CarList onDrag={handleCarListDrag} />
    </main>
  );
}
