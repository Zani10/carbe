'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Settings, 
  Star, 
  Eye, 
  Edit2, 
  Trash2,
  MoreHorizontal 
} from 'lucide-react';

// Mock data for demo purposes
const mockListings = [
  {
    id: 'car1',
    name: 'Tesla Model 3',
    type: 'Electric',
    status: 'active',
    location: 'Amsterdam, Netherlands',
    pricePerDay: 80,
    totalBookings: 12,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1617704548623-340376564e13?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dGVzbGElMjBtb2RlbCUyMDN8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
    views: 245
  },
  {
    id: 'car2',
    name: 'BMW 3 Series',
    type: 'Sedan',
    status: 'active',
    location: 'Rotterdam, Netherlands',
    pricePerDay: 70,
    totalBookings: 8,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1523983254932-c7e6571c9d60?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Ym13JTIwM3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    views: 187
  },
  {
    id: 'car3',
    name: 'Audi A4',
    type: 'Sedan',
    status: 'unlisted',
    location: 'Amsterdam, Netherlands',
    pricePerDay: 65,
    totalBookings: 0,
    rating: 0,
    imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YXVkaSUyMGE0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    views: 32
  }
];

export default function HostListingsPage() {
  const { user, isHostMode } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'unlisted'
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  
  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Host Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be in host mode to access this page.
          </p>
          <a 
            href="/profile" 
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }
  
  const filteredListings = activeFilter === 'all' 
    ? mockListings 
    : mockListings.filter(listing => 
        activeFilter === 'active' 
          ? listing.status === 'active' 
          : listing.status === 'unlisted'
      );

  const toggleMenu = (listingId: string) => {
    if (openMenu === listingId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(listingId);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Your Listings</h1>
            <a 
              href="/dashboard/host/listings/new" 
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150"
            >
              <Plus size={18} className="mr-1" />
              Add New Car
            </a>
          </div>
        </div>
      </header>
      
      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-6">
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeFilter === 'all' 
                  ? 'border-red-500 text-red-500' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All ({mockListings.length})
            </button>
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeFilter === 'active' 
                  ? 'border-red-500 text-red-500' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveFilter('active')}
            >
              Active ({mockListings.filter(l => l.status === 'active').length})
            </button>
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeFilter === 'unlisted' 
                  ? 'border-red-500 text-red-500' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveFilter('unlisted')}
            >
              Unlisted ({mockListings.filter(l => l.status === 'unlisted').length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all' 
                  ? "You haven't added any cars yet. Add your first car to start earning." 
                  : `You don't have any ${activeFilter} cars.`}
              </p>
              <a 
                href="/dashboard/host/listings/new" 
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150"
              >
                <Plus size={18} className="mr-1" />
                Add New Car
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Car image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                  <Image 
                    src={listing.imageUrl} 
                    alt={listing.name} 
                    width={400}
                    height={192}
                    className="object-cover w-full h-48"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="relative">
                      <button 
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
                        onClick={() => toggleMenu(listing.id)}
                      >
                        <MoreHorizontal size={16} className="text-gray-600" />
                      </button>
                      
                      {openMenu === listing.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <a 
                              href={`/dashboard/host/listings/${listing.id}/edit`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit2 size={16} className="mr-2" />
                              Edit Listing
                            </a>
                            <a 
                              href={`/dashboard/host/listings/${listing.id}/settings`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Settings size={16} className="mr-2" />
                              Settings
                            </a>
                            <button 
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Car details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{listing.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status === 'active' ? 'Active' : 'Unlisted'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">{listing.type} • {listing.location}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-lg font-semibold">€{listing.pricePerDay} <span className="text-sm font-normal text-gray-500">/ day</span></div>
                    {listing.rating > 0 && (
                      <div className="flex items-center">
                        <Star size={16} className="text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{listing.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye size={16} className="mr-1" />
                      {listing.views} views
                    </div>
                    <div>
                      {listing.totalBookings} bookings
                    </div>
                  </div>
                </div>
                
                {/* Action button */}
                <div className="border-t border-gray-100">
                  <a 
                    href={`/dashboard/host/listings/${listing.id}`}
                    className="block py-3 px-4 text-center font-medium text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 