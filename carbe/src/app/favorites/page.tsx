'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import CarCard from '@/components/car/CarCard';
import { ArrowLeft, Heart, Clock, Car, Search } from 'lucide-react';

// Mock recently viewed cars data
const mockRecentlyViewed = [
  {
    id: 'car1',
    name: 'Tesla Model 3',
    brand: 'Tesla',
    year: 2023,
    price_per_day: 85,
    location: 'Amsterdam, Netherlands',
    images: ['/api/placeholder/400/300'],
    rating: 4.8,
    total_reviews: 124,
    fuel_type: 'Electric',
    transmission: 'Automatic',
    seats: 5
  },
  {
    id: 'car2',
    name: 'BMW 3 Series',
    brand: 'BMW',
    year: 2022,
    price_per_day: 75,
    location: 'Amsterdam, Netherlands',
    images: ['/api/placeholder/400/300'],
    rating: 4.6,
    total_reviews: 89,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5
  },
  {
    id: 'car3',
    name: 'Mercedes C-Class',
    brand: 'Mercedes',
    year: 2023,
    price_per_day: 95,
    location: 'Amsterdam, Netherlands',
    images: ['/api/placeholder/400/300'],
    rating: 4.9,
    total_reviews: 156,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5
  }
];

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { favorites, isLoading } = useFavorites();
  const [activeTab, setActiveTab] = useState<'saved' | 'recent'>('saved');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter functions
  const filteredFavorites = favorites.filter(car =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecentlyViewed = mockRecentlyViewed.filter(car =>
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center px-4">
          <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to see your favorites</h2>
          <p className="text-gray-400 mb-6">Save cars you love to view them later</p>
          <button 
            onClick={() => router.push('/signin')}
            className="px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] pb-20">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">Saved</h1>
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
            className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF2800]/50 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#2A2A2A] border border-gray-700/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'saved' 
                ? 'bg-[#FF2800] text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Heart className="h-4 w-4 mr-2" />
            Saved ({filteredFavorites.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'recent' 
                ? 'bg-[#FF2800] text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            Recent ({filteredRecentlyViewed.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'saved' && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF2800]"></div>
              </div>
            ) : filteredFavorites.length > 0 ? (
              <div className="space-y-4">
                {filteredFavorites.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onCardClick={() => router.push(`/car/${car.id}`)}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                <p className="text-gray-400">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No saved cars yet</h3>
                <p className="text-gray-400 mb-6">
                  Start exploring cars and save your favorites here
                </p>
                <button 
                  onClick={() => router.push('/explore')}
                  className="px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90 transition-colors font-medium"
                >
                  Explore Cars
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div>
            {filteredRecentlyViewed.length > 0 ? (
              <div className="space-y-4">
                {filteredRecentlyViewed.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onCardClick={() => router.push(`/car/${car.id}`)}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                <p className="text-gray-400">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No recently viewed cars</h3>
                <p className="text-gray-400 mb-6">
                  Cars you view will appear here for easy access
                </p>
                <button 
                  onClick={() => router.push('/explore')}
                  className="px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90 transition-colors font-medium"
                >
                  Explore Cars
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {(filteredFavorites.length > 0 || filteredRecentlyViewed.length > 0) && (
          <div className="mt-8 p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => router.push('/explore')}
                className="flex items-center justify-center p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors"
              >
                <Car className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-white">Explore More</span>
              </button>
              
              <button 
                onClick={() => setSearchQuery('')}
                className="flex items-center justify-center p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors"
              >
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-white">Clear Search</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
