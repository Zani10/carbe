'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CarWithBookingStats } from '@/lib/car/hostCars';
import { 
  Eye, 
  Edit, 
  Settings, 
  MoreVertical, 
  Calendar,
  TrendingUp,
  Star,
  Trash2,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';

interface HostCarCardProps {
  car: CarWithBookingStats;
  onDelete: (carId: string) => Promise<boolean>;
  onRefresh: () => void;
}

export default function HostCarCard({ car, onDelete, onRefresh }: HostCarCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(car.id);
      if (success) {
        setShowDeleteConfirm(false);
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    router.push(`/car/${car.id}`);
  };

  const handleEdit = () => {
    router.push(`/host/garage/edit/${car.id}`);
  };

  const handleSettings = () => {
    // TODO: Implement car settings
    toast('Car settings coming soon');
  };

  return (
    <>
      <GlassCard className="group">
        {/* Car Image and Basic Info */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-600/30">
              <Image
                src={car.images?.[0] || '/api/placeholder/80/80'}
                alt={`${car.make} ${car.model}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            {car.next_booking && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {car.make} {car.model}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {formatCurrency(car.price_per_day)}/day
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-8 w-40 backdrop-blur-xl bg-gray-900/90 border border-gray-700/50 rounded-xl shadow-lg z-10"
                    >
                      <button
                        onClick={() => {
                          handleView();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 rounded-t-xl flex items-center transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Listing
                      </button>
                      <button
                        onClick={() => {
                          handleEdit();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          handleSettings();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </button>
                      <div className="border-t border-gray-700/50"></div>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 rounded-b-xl flex items-center transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Rating */}
            {car.rating && (
              <div className="flex items-center mt-2">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-xs font-medium">
                  {car.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row - Centered */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="aspect-square backdrop-blur-sm bg-gray-800/30 border border-gray-700/30 rounded-xl p-2 text-center hover:bg-gray-800/40 transition-colors flex flex-col items-center justify-center">
            <p className="text-white font-bold text-lg leading-none">{car.bookings_count || 0}</p>
            <p className="text-gray-400 text-[10px] leading-tight mt-1">Bookings</p>
          </div>
          
          <div className="aspect-square backdrop-blur-sm bg-gray-800/30 border border-gray-700/30 rounded-xl p-2 text-center hover:bg-gray-800/40 transition-colors flex flex-col items-center justify-center">
            <p className="text-white font-bold text-xs leading-none">{formatCurrency(car.revenue || 0)}</p>
            <p className="text-gray-400 text-[10px] leading-tight mt-1">Revenue</p>
          </div>
          
          <div className="aspect-square backdrop-blur-sm bg-gray-800/30 border border-gray-700/30 rounded-xl p-2 text-center hover:bg-gray-800/40 transition-colors flex flex-col items-center justify-center">
            <p className="text-white font-bold text-lg leading-none">
              {car.rating ? car.rating.toFixed(1) : '—'}
            </p>
            <p className="text-gray-400 text-[10px] leading-tight mt-1">Rating</p>
          </div>
        </div>

        {/* Next Booking */}
        {car.next_booking && (
          <div className="backdrop-blur-sm bg-gradient-to-br from-green-500/10 via-green-400/5 to-transparent border border-green-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60"></div>
              </div>
              <div className="flex-1">
                <p className="text-green-300 text-xs font-medium">Next Booking</p>
                <p className="text-green-200 text-sm">
                  {formatDate(car.next_booking.start_date)} - {formatDate(car.next_booking.end_date)}
                </p>
                <p className="text-green-400 text-xs mt-0.5">
                  by {car.next_booking.user_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Centered */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleView}
            className="flex items-center justify-center py-2 px-3 backdrop-blur-sm bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">View</span>
          </button>
          
          <button
            onClick={handleEdit}
            className="flex items-center justify-center py-2 px-3 backdrop-blur-sm bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span className="text-xs">Edit</span>
          </button>
          
          <button
            onClick={handleSettings}
            className="flex items-center justify-center py-2 px-3 backdrop-blur-sm bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white"
          >
            <Settings className="h-4 w-4 mr-1" />
            <span className="text-xs">Settings</span>
          </button>
        </div>

        {/* Click-outside handler */}
        {showActions && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowActions(false)}
          />
        )}
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="backdrop-blur-xl bg-gray-900/90 border border-gray-700/50 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Delete Car Listing</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to delete &ldquo;{car.make} {car.model}&rdquo;? 
                  This action cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-4 backdrop-blur-sm bg-gray-700/50 text-white rounded-xl hover:bg-gray-700/70 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 