'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHostCars } from '@/hooks/useHostCars';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import { 
  Plus,
  Car,
  CheckCircle
} from 'lucide-react';
import HostCarCard from '@/components/car/HostCarCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import GlassCard from '@/components/ui/GlassCard';
import { COLORS } from '@/constants/colors';
import { motion } from 'framer-motion';

export default function HostGaragePage() {
  const { user, isHostMode } = useAuth();
  const { cars, stats, isLoading, error, refreshData, deleteCar } = useHostCars();
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
            className="inline-block px-6 py-3 rounded-xl text-white transition-colors"
            style={{ 
              backgroundColor: COLORS.primary.red,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.redHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.red}
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const activeCars = cars; // All cars are active for now
  const inactiveCars: typeof cars = []; // No inactive cars for now
  
  const tabs = [
    { id: 'active' as const, title: 'Active', count: activeCars.length },
    { id: 'inactive' as const, title: 'Inactive', count: inactiveCars.length }
  ];

  return (
    <>
    <div className="min-h-screen bg-[#212121] pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
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

        {/* Stats Cards with Glassmorphism */}
        {stats && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalCars}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Cars</div>
              </div>
            </div>
            
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.totalBookings}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Bookings</div>
              </div>
            </div>
            
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent border border-gray-600/20 rounded-2xl p-4 shadow-lg hover:border-gray-500/30 transition-all">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Revenue</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add New Car CTA */}
        {!isLoading && activeCars.length === 0 && !error && (
          <GlassCard padding="lg" className="mb-6 text-center">
            <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Add Your First Car</h3>
            <p className="text-gray-400 mb-4">
              Start earning money by sharing your car with others
            </p>
            <button 
              onClick={() => router.push('/host/garage/new')}
              className="w-full text-white py-3 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: COLORS.primary.red }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.redHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.red}
            >
              Add New Car
            </button>
          </GlassCard>
        )}

        {/* Smart Tabs with Sliding Animation */}
        {!isLoading && activeCars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 backdrop-blur-xl bg-gradient-to-r from-gray-900/30 via-gray-800/20 to-gray-900/30 border border-gray-700/30 rounded-2xl p-1 shadow-lg"
          >
            {/* Sliding Background Indicator */}
            <div 
              className="absolute top-1 bottom-1 rounded-xl shadow-lg transition-all duration-300 ease-out"
              style={{
                background: `linear-gradient(to right, ${COLORS.primary.red}, ${COLORS.primary.red}CC)`,
                width: `${100 / tabs.length}%`,
                left: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`,
              }}
            />
            
            {/* Tab Buttons */}
            <div className="relative flex">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-3 text-center rounded-xl transition-all duration-300 font-medium text-sm relative z-10 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{tab.title}</span>
                    {tab.count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-600/50 text-gray-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Car List */}
        {!isLoading && (
          <div className="space-y-4">
            {(activeTab === 'active' ? activeCars : inactiveCars).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-700">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {activeTab === 'active' ? 'No active cars' : 'No inactive cars'}
                </h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  {activeTab === 'active' 
                    ? 'Add your first car to start earning' 
                    : 'All your cars are currently active'
                  }
                </p>
              </div>
            ) : (
              (activeTab === 'active' ? activeCars : inactiveCars).map((car, index) => (
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
              ))
            )}
          </div>
        )}

        {/* Add Another Car Button */}
        {!isLoading && activeCars.length > 0 && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push('/host/garage/new')}
            className="w-full mt-6 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
            style={{ backgroundColor: COLORS.primary.red }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.redHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.red}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Car
          </motion.button>
        )}

        {/* Average Rating Display */}
        {stats && stats.averageRating > 0 && !isLoading && (
          <GlassCard className="mt-6">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
              <span className="text-white font-medium">
                {stats.averageRating.toFixed(1)} average rating
              </span>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
    <HostBottomNav />
    </>
  );
} 