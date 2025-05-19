'use client'

import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import CarCard, { CarCardProps } from '../car/CarCard';
import Link from 'next/link';

interface CarListProps {
  onDrag?: (yPosition: number) => void;
}

// Initial default values, will be updated on client mount
const DEFAULT_SCREEN_HEIGHT = 800; // Fallback for SSR or if window is not available initially
const INITIAL_CARLIST_HEIGHT_VH = 70;
const SEARCHBAR_HEIGHT_PX = 68;

const vhToPx = (vh: number, screenHeight: number) => (vh / 100) * screenHeight;

const mockedCars: CarCardProps[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
    rating: 4.8,
    isFavorite: true,
    makeModel: 'BMW B-Series',
    location: 'Brussels, BE',
    transmission: 'Automatic',
    pricePerDay: 70,
    distance: '2km',
    brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1580273916550-4c53a792947c?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
    rating: 5.0,
    isFavorite: true,
    makeModel: 'Mercedes GLB',
    location: 'Ghent, BE',
    transmission: 'Automatic',
    pricePerDay: 85,
    distance: '10km',
    brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Benz_Logo_2010.svg/200px-Mercedes-Benz_Logo_2010.svg.png'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    isFavorite: false,
    makeModel: 'Audi A6 Avant',
    location: 'Antwerp, BE',
    transmission: 'Automatic',
    pricePerDay: 95,
    distance: '15km',
    brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Audi_logo_detail.svg'
  }
];

const CarList: React.FC<CarListProps> = ({ onDrag }) => {
  const [screenHeight, setScreenHeight] = useState(DEFAULT_SCREEN_HEIGHT);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setScreenHeight(window.innerHeight);
    setIsClient(true);
  }, []);

  const initialHeightPx = vhToPx(INITIAL_CARLIST_HEIGHT_VH, screenHeight);
  const expandedPanelHeightPx = screenHeight - SEARCHBAR_HEIGHT_PX;
  
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  const [{ y }, api] = useSpring(() => ({ 
    y: 0,
    config: { tension: 280, friction: 30 },
    onChange: ({ value }) => {
      if (onDrag) {
        onDrag(value.y);
      }
    }
  }));

  const openPanel = () => {
    api.start({ y: -(expandedPanelHeightPx - initialHeightPx) });
  };

  const closePanel = () => {
    api.start({ y: 0 });
  };

  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy], memo = y.get() }) => {
      const newY = memo + my;
      const isExpandedTarget = -(expandedPanelHeightPx - initialHeightPx);

      if (last) {
        if (vy > 0.5 && dy > 0) { 
          closePanel();
        } else if (vy < -0.5 && dy < 0) { 
          openPanel();
        } else {
          if (newY < isExpandedTarget / 2) {
            openPanel();
          } else {
            closePanel();
          }
        }
      } else {
        const clampedY = Math.max(isExpandedTarget, Math.min(0, newY));
        api.start({ y: clampedY, immediate: true });
      }
      return memo;
    },
    { 
      from: () => [0, y.get()], 
      filterTaps: true, 
      rubberband: 0.2, 
      axis: 'y',
      eventOptions: { passive: false }, 
      preventDefault: true 
    }
  );

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isClient) return; // Ensure calculations are based on client dimensions

    const currentScrollTop = scrollableContentRef.current?.scrollTop ?? 0;
    const currentY = y.get();
    const isExpandedTarget = -(expandedPanelHeightPx - initialHeightPx);
    const isInitialTarget = 0;

    // User scrolls down (swipe up on list) - try to move panel up
    if (event.deltaY > 0) {
      if (currentY > isExpandedTarget) { // If panel is not fully expanded
        event.preventDefault();
        // Move panel up, but don't exceed expanded target
        // This is a simplified move; could be proportional to deltaY for "natural" feel
        openPanel(); 
      }
      // Else, allow normal content scroll if panel is already fully up
    }
    // User scrolls up (swipe down on list) - try to move panel down
    else if (event.deltaY < 0) {
      if (currentScrollTop === 0 && currentY < isInitialTarget) { // If content at top & panel not fully initial
        event.preventDefault();
        // Move panel down, but don't exceed initial target
        // This is a simplified move; could be proportional to deltaY
        closePanel();
      }
      // Else, allow normal content scroll if panel is already initial or content not at top
    }
  };

  if (!isClient) {
    return null; 
  }

  return (
    <animated.div 
      className="fixed left-0 right-0 bg-[#212121] rounded-t-3xl shadow-xl z-20"
      style={{
        height: expandedPanelHeightPx,
        bottom: `calc(${initialHeightPx}px - ${expandedPanelHeightPx}px)`,
        y, 
        touchAction: 'none'
      }}
    >
      <div 
        {...bind()} 
        className="w-full py-4 flex justify-center cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }} // Explicitly add touch-action: none to the drag handle
      >
        <div className="w-16 h-1.5 bg-gray-500 hover:bg-gray-400 active:bg-gray-300 rounded-full"></div>
      </div>
      
      <div 
        ref={scrollableContentRef}
        onWheel={handleWheel} // Attach refined wheel handler
        className="overflow-y-auto pb-20 bg-[#212121]"
        style={{ height: `calc(100% - 48px)` }}
      >
        {mockedCars.map((car) => (
          <Link key={car.id} href={`/car/${car.id}`}> 
            <CarCard {...car} />
          </Link>
        ))}
      </div>
    </animated.div>
  );
};

export default CarList; 