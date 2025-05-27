'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import CarCard from '@/components/car/CarCard';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import { Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="min-h-screen bg-[#212121] pb-24">
        {/* Header - Simple title without back button */}
        <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">Saved Cars</h1>
              <span className="text-sm text-gray-400">
                {filteredFavorites.length} saved
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-4">
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
      <RenterBottomNav />
    </>
  );
}
