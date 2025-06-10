'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import CarCard from '@/components/car/CarCard';
import DesktopCarCard from '@/components/car/DesktopCarCard';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import { Heart, Search, ArrowLeft, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { favorites, isLoading } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (car.location && car.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCarClick = (carId: string) => {
    router.push(`/car/${carId}`);
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-[#212121] flex items-center justify-center pb-24">
          <div className="text-center px-4">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign in to see your favorites</h2>
            <p className="text-gray-400 mb-6">Save cars you love to view them later</p>
            <button 
              onClick={() => router.push('/signin')}
              className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
        <RenterBottomNav />
      </>
    );
  }

  return (
    <>
      {/* Mobile Layout - Hidden on Desktop */}
      <div className="lg:hidden min-h-screen bg-[#212121] pb-24">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search saved cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4646]"></div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredFavorites.map((car) => (
                  <motion.div
                    key={car.id}
                    layoutId={car.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1, height: 'auto' }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      height: 0,
                      marginBottom: 0,
                      transition: { duration: 0.3, ease: 'easeInOut' }
                    }}
                    transition={{ 
                      layout: { duration: 0.3, ease: 'easeInOut' },
                      opacity: { duration: 0.2 }
                    }}
                    className="mb-4"
                  >
                    <CarCard
                      id={car.id}
                      image={car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      rating={car.rating || 0}
                      makeModel={`${car.make} ${car.model}`}
                      location={car.location || 'Unknown location'}
                      transmission={car.transmission || 'Unknown'}
                      pricePerDay={car.price_per_day}
                      onCardClick={() => handleCarClick(car.id)}
                    />
                  </motion.div>
                ))}

                {filteredFavorites.length === 0 && (
                  <motion.div
                    key={searchQuery ? "no-results" : "empty"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    className="text-center py-12"
                  >
                    {searchQuery ? (
                      <>
                        <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                        <p className="text-gray-400">Try adjusting your search terms</p>
                      </>
                    ) : (
                      <>
                        <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No saved cars yet</h3>
                        <p className="text-gray-400 mb-6">
                          Start exploring cars and save your favorites here
                        </p>
                        <button 
                          onClick={() => router.push('/')}
                          className="px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
                        >
                          Explore Cars
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden lg:block min-h-screen bg-[#212121]">
        {/* Desktop Navigation */}
        <nav className="bg-[#212121] border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left - Back Button & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Back</span>
                </button>
                <div className="h-4 w-px bg-gray-700"></div>
                <Link href="/" className="text-xl font-semibold text-white hover:text-[#FF4646] transition-colors duration-200">
                  carbe
                </Link>
              </div>

              {/* Right - Navigation */}
              <div className="flex items-center space-x-6 flex-shrink-0">
                <Link
                  href="/favorites"
                  className="text-sm font-medium text-white"
                >
                  Saved
                </Link>
                
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

        {/* Desktop Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {!user ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Heart className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-4">Sign in to see your favorites</h2>
                <p className="text-gray-400 mb-8 text-lg">Save cars you love to view them later</p>
                <button 
                  onClick={() => router.push('/signin')}
                  className="px-8 py-4 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium text-lg"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mb-6 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search saved cars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-400 text-lg">
                  {searchQuery ? (
                    `${filteredFavorites.length} result${filteredFavorites.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  ) : (
                    `${favorites.length} saved car${favorites.length !== 1 ? 's' : ''}`
                  )}
                </p>
              </div>

              {/* Cars Grid */}
              <div>
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4646]"></div>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredFavorites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFavorites.map((car) => (
                          <motion.div
                            key={car.id}
                            layoutId={`desktop-${car.id}`}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{
                              opacity: 0,
                              scale: 0.95,
                              transition: { duration: 0.2 }
                            }}
                            transition={{ 
                              layout: { duration: 0.3, ease: 'easeInOut' },
                              opacity: { duration: 0.2 }
                            }}
                            className="max-w-sm mx-auto w-full"
                          >
                            <DesktopCarCard
                              id={car.id}
                              image={car.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                              rating={car.rating || 0}
                              make={car.make}
                              model={car.model}
                              location={car.location || 'Unknown location'}
                              transmission={car.transmission || 'Unknown'}
                              pricePerDay={car.price_per_day}
                              onCardClick={() => handleCarClick(car.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        key={searchQuery ? "no-results" : "empty"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        className="text-center py-20"
                      >
                        {searchQuery ? (
                          <>
                            <Search className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-medium text-white mb-4">No results found</h3>
                            <p className="text-gray-400 text-lg">Try adjusting your search terms</p>
                          </>
                        ) : (
                          <>
                            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-medium text-white mb-4">No saved cars yet</h3>
                            <p className="text-gray-400 mb-8 text-lg">
                              Start exploring cars and save your favorites here
                            </p>
                            <button 
                              onClick={() => router.push('/')}
                              className="px-8 py-4 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium text-lg"
                            >
                              Explore Cars
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Hidden on Desktop */}
      <div className="lg:hidden">
        <RenterBottomNav />
      </div>
    </>
  );
}
