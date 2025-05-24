'use client';

import { useState } from 'react';
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
  Pause,
  Play,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
      toast.error('Failed to delete car');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    router.push(`/car/${car.id}`);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality coming soon');
  };

  const handleSettings = () => {
    // TODO: Implement car settings
    toast.info('Car settings coming soon');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 group relative"
      >
        {/* Car Image and Basic Info */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="relative">
            <img
              src={car.images?.[0] || '/api/placeholder/80/80'}
              alt={`${car.make} ${car.model}`}
              className="w-20 h-20 rounded-lg object-cover"
            />
            {car.next_booking && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2A2A2A]"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {formatCurrency(car.price_per_day)}/day
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-8 w-40 bg-[#1F1F1F] border border-gray-700/50 rounded-lg shadow-lg z-10"
                    >
                      <button
                        onClick={() => {
                          handleView();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Listing
                      </button>
                      <button
                        onClick={() => {
                          handleEdit();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          handleSettings();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
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
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 rounded-b-lg flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Rating and Status */}
            <div className="flex items-center space-x-3 mt-2">
              {car.rating && (
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-yellow-500 text-xs font-medium">
                    {car.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">
                {car.bookings_count} booking{car.bookings_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-lg p-3 text-center">
            <Calendar className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">{car.bookings_count}</p>
            <p className="text-gray-400 text-xs">Bookings</p>
          </div>
          
          <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-lg p-3 text-center">
            <TrendingUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">{formatCurrency(car.revenue)}</p>
            <p className="text-gray-400 text-xs">Revenue</p>
          </div>
          
          <div className="bg-[#1F1F1F] border border-gray-700/50 rounded-lg p-3 text-center">
            <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
            <p className="text-white font-semibold text-sm">
              {car.rating ? car.rating.toFixed(1) : '—'}
            </p>
            <p className="text-gray-400 text-xs">Rating</p>
          </div>
        </div>

        {/* Next Booking */}
        {car.next_booking && (
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-green-400 mr-2" />
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

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleView}
            className="flex items-center justify-center py-2 px-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors text-gray-300 hover:text-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">View</span>
          </button>
          
          <button
            onClick={handleEdit}
            className="flex items-center justify-center py-2 px-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors text-gray-300 hover:text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span className="text-xs">Edit</span>
          </button>
          
          <button
            onClick={handleSettings}
            className="flex items-center justify-center py-2 px-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors text-gray-300 hover:text-white"
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
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Delete Car Listing</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to delete "{car.year} {car.make} {car.model}"? 
                  This action cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
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