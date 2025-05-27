'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHostCars } from '@/hooks/useHostCars';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import { 
  Plus,
  Car,
  Calendar,
  RefreshCw,
  Star,
  Euro
} from 'lucide-react';
import HostCarCard from '@/components/car/HostCarCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { motion } from 'framer-motion';

export default function HostGaragePage() {
  const { user, isHostMode } = useAuth();
  const { cars, stats, isLoading, isRefreshing, error, refreshData, deleteCar } = useHostCars();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] p-4">
        <div className="bg-[#2A2A2A] p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to access your garage.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-block px-6 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const activeCars = cars; // All cars are active for now
  const inactiveCars: typeof cars = []; // No inactive cars for now

  return (
    <>
    <div className="min-h-screen bg-[#212121] pb-24">
      {/* Header - Simple title without back button */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">My Garage</h1>
            <div className="flex items-center space-x-2">
              <button 
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => router.push('/host/garage/new')}
                className="p-2 bg-[#FF4646] text-white rounded-lg hover:bg-[#FF4646]/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner size="lg" text="Loading your garage..." />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorMessage 
            title="Error Loading Cars"
            message={error}
            onRetry={refreshData}
          />
        )}

        {/* Stats Cards */}
        {stats && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-center">
              <Car className="h-6 w-6 text-[#FF4646] mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.totalCars}</p>
              <p className="text-sm text-gray-400">Cars</p>
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-center">
              <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{stats.totalBookings}</p>
              <p className="text-sm text-gray-400">Bookings</p>
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-center">
              <Euro className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-400">Revenue</p>
            </div>
          </motion.div>
        )}

        {/* Add New Car CTA */}
        {!isLoading && activeCars.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-6 mb-6 text-center"
          >
            <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Add Your First Car</h3>
            <p className="text-gray-400 mb-4">
              Start earning money by sharing your car with others
            </p>
            <button 
              onClick={() => router.push('/host/garage/new')}
              className="w-full bg-[#FF4646] text-white py-3 rounded-xl font-medium hover:bg-[#FF4646]/90 transition-colors"
            >
              Add New Car
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        {!isLoading && activeCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-1 bg-[#2A2A2A] border border-gray-700/50 p-1 rounded-xl mb-6"
          >
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'active' 
                  ? 'bg-[#FF4646] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Active ({activeCars.length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'inactive' 
                  ? 'bg-[#FF4646] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Inactive ({inactiveCars.length})
            </button>
          </motion.div>
        )}

        {/* Car List */}
        {!isLoading && (
          <div className="space-y-4">
            {(activeTab === 'active' ? activeCars : inactiveCars).map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <HostCarCard
                  car={car}
                  onDelete={deleteCar}
                  onRefresh={refreshData}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Another Car Button */}
        {!isLoading && activeCars.length > 0 && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push('/host/garage/new')}
            className="w-full mt-6 bg-[#FF4646] text-white py-3 rounded-xl font-medium hover:bg-[#FF4646]/90 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Car
          </motion.button>
        )}

        {/* Average Rating Display */}
        {stats && stats.averageRating > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-white font-medium">
                {stats.averageRating.toFixed(1)} average rating
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    <HostBottomNav />
    </>
  );
} 