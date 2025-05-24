'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Car,
  Settings,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';

// Mock data for demonstration
const mockCars = [
  {
    id: '1',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price_per_day: 85,
    images: ['/api/placeholder/300/200'],
    status: 'active',
    bookings_count: 12,
    rating: 4.8
  },
  {
    id: '2',
    make: 'BMW',
    model: '3 Series',
    year: 2022,
    price_per_day: 75,
    images: ['/api/placeholder/300/200'],
    status: 'active',
    bookings_count: 8,
    rating: 4.6
  }
];

export default function HostGaragePage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

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
            className="inline-block px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const activeCars = mockCars.filter(car => car.status === 'active');
  const inactiveCars = mockCars.filter(car => car.status === 'inactive');

  return (
    <div className="min-h-screen bg-[#212121] pb-20">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">My Garage</h1>
            </div>
            <button 
              onClick={() => router.push('/host/garage/new')}
              className="p-2 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-center">
            <Car className="h-6 w-6 text-[#FF2800] mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{activeCars.length}</p>
            <p className="text-sm text-gray-400">Active Cars</p>
          </div>
          
          <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-center">
            <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              {activeCars.reduce((sum, car) => sum + car.bookings_count, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Bookings</p>
          </div>
          
          <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">
              €{activeCars.reduce((sum, car) => sum + (car.price_per_day * car.bookings_count), 0)}
            </p>
            <p className="text-sm text-gray-400">Revenue</p>
          </div>
        </div>

        {/* Add New Car CTA */}
        {activeCars.length === 0 && (
          <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-6 mb-6 text-center">
            <Car className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Add Your First Car</h3>
            <p className="text-gray-400 mb-4">
              Start earning money by sharing your car with others
            </p>
            <button 
              onClick={() => router.push('/host/garage/new')}
              className="w-full bg-[#FF2800] text-white py-3 rounded-xl font-medium hover:bg-[#FF2800]/90 transition-colors"
            >
              Add New Car
            </button>
          </div>
        )}

        {/* Tabs */}
        {activeCars.length > 0 && (
          <div className="flex space-x-1 bg-[#2A2A2A] border border-gray-700/50 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'active' 
                  ? 'bg-[#FF2800] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Active ({activeCars.length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'inactive' 
                  ? 'bg-[#FF2800] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Inactive ({inactiveCars.length})
            </button>
          </div>
        )}

        {/* Car List */}
        <div className="space-y-4">
          {(activeTab === 'active' ? activeCars : inactiveCars).map((car) => (
            <div
              key={car.id}
              className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p className="text-gray-400 text-sm">€{car.price_per_day}/day</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-yellow-500 text-sm">★ {car.rating}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{car.bookings_count} bookings</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center py-2 px-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors">
                  <Eye className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-white">View</span>
                </button>
                <button className="flex-1 flex items-center justify-center py-2 px-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors">
                  <Edit className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-white">Edit</span>
                </button>
                <button className="flex-1 flex items-center justify-center py-2 px-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors">
                  <Settings className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-white">Settings</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Car Button */}
        {activeCars.length > 0 && (
          <button 
            onClick={() => router.push('/host/garage/new')}
            className="w-full mt-6 bg-[#FF2800] text-white py-3 rounded-xl font-medium hover:bg-[#FF2800]/90 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Car
          </button>
        )}
      </div>
    </div>
  );
} 