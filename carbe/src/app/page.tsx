'use client'

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBar from '@/components/home/SearchBar';
import DesktopSearchBar from '@/components/home/DesktopSearchBar';
import MapView from '@/components/home/MapView';
import CarCard from '@/components/car/CarCard';
import DesktopCarCard from '@/components/car/DesktopCarCard';
import MapListingCard from '@/components/maps/MapListingCard';
import RenterBottomNav from '@/components/layout/RenterBottomNav';

import { supabase } from '@/lib/supabase';
import { Car } from '@/types/car';
import { geocodeAll, CarWithCoordinates } from '@/lib/geocode';
import { FilterState } from '@/components/home/FilterModal';
import Link from 'next/link';
import Image from 'next/image';
import { Map, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SEARCHBAR_HEIGHT = 68;

export default function HomePage() {
  const { user, profile } = useAuth();
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
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  
  // Desktop-specific state
  const [showDesktopMap, setShowDesktopMap] = useState(false);
  const [desktopSearchLocation, setDesktopSearchLocation] = useState('');
  const [desktopCheckIn, setDesktopCheckIn] = useState('');
  const [desktopCheckOut, setDesktopCheckOut] = useState('');
  const [isDesktopSearchActive, setIsDesktopSearchActive] = useState(false);
  const [desktopSearchParams, setDesktopSearchParams] = useState<{
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  } | null>(null);
  const [desktopFilters, setDesktopFilters] = useState({
    priceMin: '',
    priceMax: '',
    carType: '',
    transmission: '',
    fuelType: '',
  });

  // Fetch cars with direct Supabase query
  useEffect(() => {
    const fetchCars = async () => {
      setCarsLoading(true);
      try {
        let query = supabase
          .from('cars')
          .select('*')
          .eq('is_available', true);

        // Apply mobile search filters if provided
        if (searchParams?.location && searchParams.location !== 'Anywhere') {
          query = query.ilike('location', `%${searchParams.location}%`);
        }

        // Apply desktop search filters if provided
        if (desktopSearchParams?.location && desktopSearchParams.location !== 'Anywhere') {
          query = query.ilike('location', `%${desktopSearchParams.location}%`);
        }

        // Apply other filters from either search
        const activeFilters = searchParams?.filters || desktopSearchParams?.filters;
        if (activeFilters) {
          const { priceRange, vehicleTypes, transmission, seats, brands } = activeFilters;
          
          if (priceRange) {
            query = query.gte('price_per_day', priceRange[0]).lte('price_per_day', priceRange[1]);
          }
          if (vehicleTypes && vehicleTypes.length > 0 && !vehicleTypes.includes('cars')) {
            // Map vehicle types to database fuel_type field
            const typeConditions = vehicleTypes.map(type => `fuel_type.ilike.%${type}%`);
            query = query.or(typeConditions.join(','));
          }
          if (transmission && transmission.length > 0) {
            const transmissionConditions = transmission.map(t => `transmission.eq.${t.charAt(0).toUpperCase() + t.slice(1)}`);
            query = query.or(transmissionConditions.join(','));
          }
          if (seats && seats.length > 0) {
            const seatNumbers = seats.map(s => s === '7+' ? 7 : parseInt(s)).filter(n => !isNaN(n));
            if (seatNumbers.length > 0) {
              const seatConditions = seatNumbers.map(n => `seats.gte.${n}`);
              query = query.or(seatConditions.join(','));
            }
          }
          if (brands && brands.length > 0) {
            const brandConditions = brands.map(brand => `make.ilike.%${brand}%`);
            query = query.or(brandConditions.join(','));
          }
        }

        // Apply desktop filter values directly if no structured filters
        if (!activeFilters && isDesktopSearchActive) {
          // Apply price filtering
          if (desktopFilters.priceMin && !isNaN(Number(desktopFilters.priceMin))) {
            query = query.gte('price_per_day', Number(desktopFilters.priceMin));
          }
          if (desktopFilters.priceMax && !isNaN(Number(desktopFilters.priceMax))) {
            query = query.lte('price_per_day', Number(desktopFilters.priceMax));
          }
          
          // Apply car type filtering
          if (desktopFilters.carType && desktopFilters.carType !== '') {
            query = query.ilike('vehicle_type', `%${desktopFilters.carType}%`);
          }
          
          // Apply transmission filtering
          if (desktopFilters.transmission && desktopFilters.transmission !== '') {
            query = query.eq('transmission', desktopFilters.transmission.charAt(0).toUpperCase() + desktopFilters.transmission.slice(1));
          }
          
          // Apply fuel type filtering
          if (desktopFilters.fuelType && desktopFilters.fuelType !== '') {
            query = query.eq('fuel_type', desktopFilters.fuelType.charAt(0).toUpperCase() + desktopFilters.fuelType.slice(1));
          }
        }

        const { data, error } = await query
          .order('rating', { ascending: false })
          .order('price_per_day', { ascending: true });

        if (error) throw error;
        setCars(data || []);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setCars([]);
      } finally {
        setCarsLoading(false);
      }
    };

    fetchCars();
  }, [searchParams, desktopSearchParams, desktopFilters, isDesktopSearchActive]);

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
      bounds: { top: fullListHeight - defaultHeight, bottom: fullMapHeight - defaultHeight },
      rubberband: true 
    }
  );

  const handleSearch = (params: {
    location: string;
    dates: [Date | null, Date | null];
    filters?: FilterState;
  }) => {
    console.log('Search params:', params);
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
          cars.filter(car => car.location && car.images).map(car => ({
            id: car.id,
            location: car.location!,
            price_per_day: car.price_per_day,
            make: car.make,
            model: car.model,
            images: car.images!,
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
    // Create search parameters from desktop inputs
    const searchDates: [Date | null, Date | null] = [
      desktopCheckIn ? new Date(desktopCheckIn) : null,
      desktopCheckOut ? new Date(desktopCheckOut) : null
    ];

    // Create filter object from desktop filters
    const filterState: FilterState | undefined = (
      desktopFilters.priceMin || 
      desktopFilters.priceMax || 
      desktopFilters.carType || 
      desktopFilters.transmission || 
      desktopFilters.fuelType
    ) ? {
      priceRange: [
        Number(desktopFilters.priceMin) || 10,
        Number(desktopFilters.priceMax) || 500
      ] as [number, number],
      vehicleTypes: desktopFilters.carType ? [desktopFilters.carType.toLowerCase()] : ['cars'],
      transmission: desktopFilters.transmission ? [desktopFilters.transmission.toLowerCase()] : [],
      seats: [],
      brands: [],
      ecoFriendly: desktopFilters.fuelType ? [desktopFilters.fuelType.toLowerCase()] : [],
      years: []
    } : undefined;

    const searchParamsObj = {
      location: desktopSearchLocation || 'Anywhere',
      dates: searchDates,
      filters: filterState
    };

    console.log('Desktop search:', searchParamsObj);
    setDesktopSearchParams(searchParamsObj);
    setIsDesktopSearchActive(true);
  };

  const resetDesktopSearch = () => {
    setDesktopSearchLocation('');
    setDesktopCheckIn('');
    setDesktopCheckOut('');
    setDesktopSearchParams(null);
    setIsDesktopSearchActive(false);
  };

  // Calculate active filter count for desktop
  const getDesktopFilterCount = () => {
    let count = 0;
    if (desktopFilters.priceMin || desktopFilters.priceMax) count++;
    if (desktopFilters.carType) count++;
    if (desktopFilters.transmission) count++;
    if (desktopFilters.fuelType) count++;
    return count;
  };

  const handleDesktopFiltersChange = (filters: {
    priceMin: string;
    priceMax: string;
    carType: string;
    transmission: string;
    fuelType: string;
  }) => {
    setDesktopFilters(filters);
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
      <main className="hidden lg:block min-h-screen bg-[#212121]">
        {/* Desktop Navigation */}
        <nav className="bg-[#212121] border-b border-gray-800 sticky top-0 z-[100] relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/" onClick={resetDesktopSearch} className="text-3xl font-bold text-white">
                  carbe
                </Link>
              </div>

                {/* Compact Search Bar - Absolutely centered */}
                {isDesktopSearchActive && desktopSearchParams && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-16 flex items-center z-[101]">
                    <DesktopSearchBar
                      location={desktopSearchLocation}
                      onLocationChange={setDesktopSearchLocation}
                      checkIn={desktopCheckIn}
                      onCheckInChange={setDesktopCheckIn}
                      checkOut={desktopCheckOut}
                      onCheckOutChange={setDesktopCheckOut}
                      onSearch={handleDesktopSearch}
                      isCompact={true}
                      activeFilterCount={getDesktopFilterCount()}
                      currentFilters={desktopFilters}
                      onFiltersChange={handleDesktopFiltersChange}
                    />
                  </div>
                )}
              {/* Right Side Actions */}
              <div className="flex items-center space-x-6 flex-shrink-0">
                {/* Navigation Links */}
                <Link
                  href="/dashboard/renter"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Rides
                </Link>
                
                <Link
                  href="/chat"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Inbox
                </Link>
                
                {/* Conditionally show Become a host button */}
                {user && profile && !profile.is_host && (
                  <Link
                  href="/host/setup"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF4646] hover:bg-red-600 rounded-lg transition-colors duration-200"
                  >
                    Become a host
                  </Link>
                )}
                
                <Link
                  href="/favorites"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
                  >
                  Saved
                </Link>
                
                <Link
                  href={user ? "/profile" : "/signin"}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
                  >
                  <User className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
          
        </nav>

        {/* Hero Section - Hide/Fade when search is active */}
        {!isDesktopSearchActive && (
          <motion.section 
          className="relative h-96 bg-gradient-to-r from-[#212121] to-[#2A2A2A] overflow-hidden"
          initial={{ opacity: 1, height: 384 }}
          animate={{ 
              opacity: isDesktopSearchActive ? 0 : 1,
              height: isDesktopSearchActive ? 0 : 384
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Hero Background Image */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop"
                alt="Cars on road"
                fill
                className="object-cover opacity-40"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#212121]/80 to-[#2A2A2A]/60"></div>
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
              <DesktopSearchBar
                location={desktopSearchLocation}
                onLocationChange={setDesktopSearchLocation}
                checkIn={desktopCheckIn}
                onCheckInChange={setDesktopCheckIn}
                checkOut={desktopCheckOut}
                onCheckOutChange={setDesktopCheckOut}
                onSearch={handleDesktopSearch}
                currentFilters={desktopFilters}
                onFiltersChange={handleDesktopFiltersChange}
              />
            </div>
          </motion.section>
        )}

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {cars.length} car{cars.length !== 1 ? 's' : ''} available
            </h2>
            
                         <button
               onClick={() => setShowDesktopMap(!showDesktopMap)}
               className="flex items-center space-x-2 bg-[#2A2A2A] hover:bg-[#333333] text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-gray-600"
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
                <div className={`grid gap-6 ${showDesktopMap ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-[#2A2A2A] rounded-2xl p-4 animate-pulse">
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
                <div className={`grid gap-6 ${showDesktopMap ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {cars.slice(0, showDesktopMap ? 8 : 12).map((car) => (
                    <Link key={car.id} href={`/car/${car.id}`}>
                      <DesktopCarCard
                        id={car.id}
                        image={car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                        rating={car.rating || 0}
                        make={car.make}
                        model={car.model}
                        location={car.location || 'Location not specified'}
                        transmission={car.transmission || 'Automatic'}
                        pricePerDay={car.price_per_day}
                        onCardClick={() => {
                          // The Link already handles navigation
                        }}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Map - Made Sticky */}
            {showDesktopMap && (
              <div className="w-1/2">
                <div className="sticky top-20 h-[calc(100vh-6rem)] rounded-2xl overflow-hidden bg-[#2A2A2A]">
                  <MapView 
                    listings={mapListings} 
                    isLoading={isGeocodingLoading || carsLoading}
                    activeId={selectedListingId}
                    onMarkerClick={handleMarkerClick}
                    mapCenter={mapCenter}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
