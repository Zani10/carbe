'use client'

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBar from '@/components/home/SearchBar';
import MapView from '@/components/home/MapView';
import CarCard from '@/components/car/CarCard';
import MapListingCard from '@/components/maps/MapListingCard';
import RenterBottomNav from '@/components/layout/RenterBottomNav';

import { useCars } from '@/hooks/useCars';
import { geocodeAll, CarWithCoordinates } from '@/lib/geocode';
import { FilterState } from '@/components/home/FilterModal';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Map, Heart, User, SlidersHorizontal } from 'lucide-react';

const SEARCHBAR_HEIGHT = 68;

export default function HomePage() {
  const [screenHeight, setScreenHeight] = useState(800);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedListingIndex, setSelectedListingIndex] = useState(0);
  const [mapListings, setMapListings] = useState<CarWithCoordinates[]>([]);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [searchParams, setSearchParams] = useState<{
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  } | null>(null);
  const [isAIExpanded, setIsAIExpanded] = useState(false);
<<<<<<< Updated upstream
=======
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  
  // Desktop-specific state
  const [showDesktopMap, setShowDesktopMap] = useState(false);
  const [desktopSearchLocation, setDesktopSearchLocation] = useState('');
  const [desktopCheckIn, setDesktopCheckIn] = useState('');
  const [desktopCheckOut, setDesktopCheckOut] = useState('');
>>>>>>> Stashed changes

  
  // Convert search params to useCars format
  const carsSearchParams = searchParams ? {
    location: searchParams.location === 'Anywhere' ? undefined : searchParams.location,
    startDate: searchParams.dates[0] || undefined,
    endDate: searchParams.dates[1] || undefined,
    filters: searchParams.filters
  } : undefined;
  
  const { cars, isLoading: carsLoading } = useCars(carsSearchParams);

  useEffect(() => {
    setScreenHeight(window.innerHeight);
  }, []);

  // Simple three positions
  const fullMapHeight = 70; // Only handle visible (smaller)
  const defaultHeight = screenHeight * 0.7; // 70% for car list
  const fullListHeight = screenHeight - SEARCHBAR_HEIGHT - 50; // Almost full screen

  const [{ height }, api] = useSpring(() => ({ 
    height: defaultHeight,
    config: { tension: 120, friction: 26 } // Smoother, more natural motion
  }));

  // Function to expand map to full screen
  const expandToFullMap = () => {
    api.start({ height: fullMapHeight });
    setIsFullMap(true);
    console.log('🗺️ MAP CLICKED - EXPANDING TO FULL MAP');
  };

  // Function to expand from minimal (smoother)
  const expandFromMinimal = () => {
    api.start({ height: defaultHeight });
    setIsFullMap(false);
    console.log('📱 EXPANDING FROM MINIMAL');
  };

  // Function to cancel/close compact cards
  const cancelSelection = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedListingId(null);
    setSelectedListingIndex(0);
    // Clear map center zoom to reset to default view
    setMapCenter(null);
    // Don't change the draggable section height - just remove the selection
  };

  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy] }) => {
      if (last) {
        const newHeight = defaultHeight - my;
        
        // More natural fast swipe detection (reduced threshold)
        if (Math.abs(vy) > 0.25) {
          if (vy < 0) {
            // Fast swipe up - full list
            api.start({ height: fullListHeight });
            setIsFullMap(false);
          } else {
            // Fast swipe down - full map
            api.start({ height: fullMapHeight });
            setIsFullMap(true);
          }
        } else {
          // Slow drag - snap to nearest
          if (newHeight < (fullMapHeight + defaultHeight) / 2) {
            api.start({ height: fullMapHeight });
            setIsFullMap(true);
          } else if (newHeight > (defaultHeight + fullListHeight) / 2) {
            api.start({ height: fullListHeight });
            setIsFullMap(false);
          } else {
            api.start({ height: defaultHeight });
            setIsFullMap(false);
          }
        }
      } else {
        // During drag - smoother movement with damping
        const dampingFactor = 0.8; // Add resistance
        const newHeight = Math.max(fullMapHeight, Math.min(fullListHeight, defaultHeight - (my * dampingFactor)));
        api.start({ height: newHeight, immediate: true, config: { tension: 300, friction: 30 } });
        
        // Update state during drag
        if (newHeight <= fullMapHeight + 20) {
          if (!isFullMap) {
            setIsFullMap(true);
          }
        } else {
          if (isFullMap) {
            setIsFullMap(false);
          }
        }
      }
    },
    { 
      axis: 'y',
      rubberband: 0.15, // Slight resistance at boundaries
      filterTaps: true
    }
  );

  const handleSearch = (params: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => {
    console.log('Searching with params:', params);
    setSearchParams(params);
  };

  const handleMarkerClick = (carId: string) => {
    setSelectedListingId(carId);
    const index = mapListings.findIndex(car => car.id === carId);
    if (index !== -1) {
      setSelectedListingIndex(index);
      // Zoom in on selected marker
      const selectedCar = mapListings[index];
      setMapCenter({ 
        lat: selectedCar.lat, 
        lng: selectedCar.lng, 
        zoom: 16 // Zoomed in view
      });
    }
  };

  const handleCardChange = (index: number) => {
    setSelectedListingIndex(index);
    setSelectedListingId(mapListings[index]?.id || null);
    // Zoom in on the new selected car
    const selectedCar = mapListings[index];
    if (selectedCar) {
      setMapCenter({ 
        lat: selectedCar.lat, 
        lng: selectedCar.lng, 
        zoom: 16 // Zoomed in view
      });
    }
  };

  // Geocode cars when loaded
  useEffect(() => {
    const geocodeCars = async () => {
      if (cars.length === 0 || carsLoading) return;
      
      setIsGeocodingLoading(true);
      try {
        const geocodedCars = await geocodeAll(
          cars.filter(car => car.location).map(car => ({
            id: car.id,
            location: car.location!,
            price_per_day: car.price_per_day,
            make: car.make,
            model: car.model,
            images: car.images,
            rating: car.rating
          }))
        );
        setMapListings(geocodedCars);
      } catch (error) {
        console.error('Failed to geocode cars:', error);
      } finally {
        setIsGeocodingLoading(false);
      }
    };

    geocodeCars();
  }, [cars, carsLoading]);

  const handleDesktopSearch = () => {
    // Handle desktop search
    console.log('Desktop search:', { desktopSearchLocation, desktopCheckIn, desktopCheckOut });
  };

  return (
    <>
      {/* Mobile Layout - Hidden on Desktop */}
      <main className="lg:hidden relative w-full h-screen bg-[#212121] overflow-hidden">
        {/* SearchBar - Fixed at top */}
        <header className="fixed top-0 left-0 right-0 z-30 w-full">
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={carsLoading || isGeocodingLoading}
            onAIExpandedChange={setIsAIExpanded}
          />
        </header>

        {/* Search Summary - Show after search */}
        {searchParams && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-[68px] left-0 right-0 z-20 bg-[#212121] px-4 py-2 border-b border-gray-800"
          >
            <div className="text-gray-300 text-sm">
              Showing {cars.length} car{cars.length !== 1 ? 's' : ''} for{' '}
              <span className="text-white font-medium">
                {searchParams.location || 'Anywhere'}
              </span>
              {searchParams.dates[0] && searchParams.dates[1] && (
                <>
                  {' '}from{' '}
                  <span className="text-white font-medium">
                    {searchParams.dates[0].toLocaleDateString()} to {searchParams.dates[1].toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Map - Takes remaining space, clickable to expand when not fullscreen */}
        <animated.div 
          className={`absolute left-0 right-0 z-10 ${!isFullMap ? 'cursor-pointer' : ''}`}
          style={{
            top: searchParams ? SEARCHBAR_HEIGHT + 40 : SEARCHBAR_HEIGHT, // Account for search summary
            height: height.to(h => screenHeight - h - (searchParams ? SEARCHBAR_HEIGHT + 40 : SEARCHBAR_HEIGHT))
          }}
          onClick={!isFullMap ? expandToFullMap : undefined}
        >
          <MapView 
            listings={mapListings} 
            isLoading={isGeocodingLoading || carsLoading}
            activeId={selectedListingId}
            onMarkerClick={handleMarkerClick}
            mapCenter={mapCenter}
          />
        </animated.div>

        {/* Car List - Draggable from bottom with proper rounded corners */}
        <animated.div 
          className="absolute left-0 right-0 bg-[#212121] shadow-2xl z-20"
          style={{
            bottom: 0,
            height: height,
            touchAction: 'none',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Drag handle - always visible, shows Cancel when compact cards are visible */}
          <div 
            {...bind()} 
            className="w-full flex flex-col items-center cursor-grab active:cursor-grabbing bg-[#212121] rounded-t-[28px]"
            style={{ 
              touchAction: 'none',
              paddingTop: selectedListingId ? '16px' : (isFullMap ? '12px' : '16px'),
              paddingBottom: selectedListingId ? '12px' : (isFullMap ? '8px' : '12px')
            }}
            onClick={!selectedListingId ? (isFullMap ? expandFromMinimal : undefined) : undefined}
          >
            <div className="w-14 h-1.5 bg-gray-400 hover:bg-gray-300 rounded-full mb-2 transition-colors"></div>
            
            {/* Show Cancel when compact cards are visible */}
            {selectedListingId ? (
              <div 
                className="text-[#FF4646] text-sm font-medium cursor-pointer hover:text-[#FF3333] transition-colors z-50 relative"
                onClick={cancelSelection}
              >
                Cancel
              </div>
            ) : (
              /* Show car count in all other cases (including fullscreen) */
              <div className="text-gray-400 text-xs font-medium">
                {cars.length} car{cars.length !== 1 ? 's' : ''} available
              </div>
            )}
          </div>
          
          {/* Cars list - only visible when not in full map mode and no compact card */}
          {!isFullMap && !selectedListingId && (
            <div className="overflow-y-auto h-full pb-24 bg-[#212121]">
              {cars.map((car) => (
                <Link key={car.id} href={`/car/${car.id}`}>
                  <CarCard 
                    id={car.id}
                    image={car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    rating={car.rating || 0}
                    makeModel={`${car.make} ${car.model}`}
                    location={car.location || 'Location not specified'}
                    transmission={car.transmission || 'Not specified'}
                    pricePerDay={car.price_per_day}
                  />
                </Link>
              ))}
            </div>
          )}
        </animated.div>

        {/* Map listing card - swipeable horizontal cards */}
        <AnimatePresence>
          {selectedListingId && mapListings.length > 0 && (
            <MapListingCard
              cars={mapListings}
              selectedIndex={selectedListingIndex}
              onCardChange={handleCardChange}
            />
          )}
        </AnimatePresence>

        {/* Bottom Navigation - Only show when NOT in full map mode and NOT in AI results */}
        {!isFullMap && !isAIExpanded && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 z-40"
            initial={{ y: 0 }}
            animate={{ y: isAIExpanded ? 100 : 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <RenterBottomNav />
          </motion.div>
        )}
      </main>

      {/* Desktop Layout - Hidden on Mobile */}
      <main className="hidden lg:block min-h-screen bg-gray-900">
        {/* Desktop Navigation */}
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="text-3xl font-bold text-white">
                  carbe
                </Link>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-6">
                <Link
                  href="/host/setup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Become a host
                </Link>
                
                <Link
                  href="/favorites"
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Heart className="w-6 h-6" />
                </Link>
                
                <Link
                  href="/profile"
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <User className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-96 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop"
              alt="Cars on road"
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-800/60"></div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-center">
            {/* Hero Title */}
            <div className="text-center mb-8">
              <h1 className="text-5xl lg:text-6xl font-light text-white mb-4">
                <span className="font-bold">Drive</span> dreams, share stories
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Discover unique cars from trusted hosts around the world
              </p>
            </div>

            {/* Desktop Search Bar */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center">
                <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200">
                  {/* Location */}
                  <div className="px-4 py-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Where
                    </label>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={desktopSearchLocation}
                      onChange={(e) => setDesktopSearchLocation(e.target.value)}
                      className="w-full text-sm text-gray-900 placeholder-gray-400 border-0 p-0 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  {/* Check In */}
                  <div className="px-4 py-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Check in
                    </label>
                    <input
                      type="date"
                      value={desktopCheckIn}
                      onChange={(e) => setDesktopCheckIn(e.target.value)}
                      className="w-full text-sm text-gray-900 border-0 p-0 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  {/* Check Out */}
                  <div className="px-4 py-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Check out
                    </label>
                    <input
                      type="date"
                      value={desktopCheckOut}
                      onChange={(e) => setDesktopCheckOut(e.target.value)}
                      className="w-full text-sm text-gray-900 border-0 p-0 focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleDesktopSearch}
                  className="ml-2 bg-[#FF4646] hover:bg-red-600 text-white p-3 rounded-xl transition-colors duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Button */}
              <div className="flex justify-end mt-4">
                <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {cars.length} car{cars.length !== 1 ? 's' : ''} available
            </h2>
            
            <button
              onClick={() => setShowDesktopMap(!showDesktopMap)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showDesktopMap ? 'Hide map' : 'Show map'}
              </span>
            </button>
          </div>

          <div className="flex gap-6">
            {/* Car Grid */}
            <div className={`${showDesktopMap ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
              {carsLoading || isGeocodingLoading ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-2xl p-4 animate-pulse">
                      <div className="bg-gray-700 h-48 rounded-xl mb-4"></div>
                      <div className="bg-gray-700 h-4 rounded mb-2"></div>
                      <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No cars found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {cars.slice(0, showDesktopMap ? 6 : 8).map((car) => (
                    <Link key={car.id} href={`/car/${car.id}`}>
                                             <div className="group bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-700 transition-colors duration-200">
                        <div className="relative">
                          <Image
                            src={car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={`${car.make} ${car.model}`}
                            width={400}
                            height={240}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm flex items-center">
                            ⭐ {(car.rating || 0).toFixed(1)}
                          </div>
                          <button className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors">
                            <Heart className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {car.make} {car.model}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {car.location || 'Location not specified'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">
                              {car.transmission || 'Automatic'}
                            </span>
                            <span className="text-white font-semibold">
                              €{car.price_per_day}/day
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Map */}
            {showDesktopMap && (
              <div className="w-1/2 h-[600px] rounded-2xl overflow-hidden bg-gray-800">
                <MapView 
                  listings={mapListings} 
                  isLoading={isGeocodingLoading || carsLoading}
                  activeId={selectedListingId}
                  onMarkerClick={handleMarkerClick}
                  mapCenter={mapCenter}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
