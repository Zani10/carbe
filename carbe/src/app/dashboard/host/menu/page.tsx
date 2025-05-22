'use client';

import { useAuth } from '@/hooks/useAuth';
import { 
  UserCircle, 
  Car, 
  DollarSign, 
  Star, 
  Settings, 
  CreditCard,
  FileText,
  Shield,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

// Mock data for demo purposes
const mockEarnings = {
  currentMonth: 840,
  lastMonth: 720,
  total: 5460,
  pendingPayout: 320,
  nextPayoutDate: '2023-12-15'
};

export default function HostMenuPage() {
  const { user, isHostMode, profile, toggleHostMode } = useAuth();
  
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
  
  const handleSwitchToRenter = () => {
    toggleHostMode();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User profile section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
              <UserCircle size={40} strokeWidth={1.5} />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {user.user_metadata?.full_name || user.email}
              </h2>
              <p className="text-gray-500">{user.email}</p>
              <button 
                onClick={handleSwitchToRenter}
                className="text-sm text-red-500 font-medium mt-1 flex items-center"
              >
                Switch to renter mode <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick stats boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Earnings summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Earnings</h3>
              <a 
                href="/dashboard/host/earnings" 
                className="text-sm text-red-500 flex items-center"
              >
                Details <ArrowUpRight size={16} />
              </a>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This month</span>
                <span className="font-medium">€{mockEarnings.currentMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last month</span>
                <span className="font-medium">€{mockEarnings.lastMonth}</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Total earnings</span>
                <span>€{mockEarnings.total}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending payout</span>
                  <span className="font-medium">€{mockEarnings.pendingPayout}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Next payout on {new Date(mockEarnings.nextPayoutDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance/reviews summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
              <a 
                href="/dashboard/host/reviews" 
                className="text-sm text-red-500 flex items-center"
              >
                View all <ArrowUpRight size={16} />
              </a>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall rating</span>
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-500 mr-1" />
                  <span className="font-medium">4.8</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total reviews</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Response rate</span>
                <span className="font-medium">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Acceptance rate</span>
                <span className="font-medium">92%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu links */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            <a 
              href="/dashboard/host/listings" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Car size={20} className="text-red-500" />
                </div>
                <span className="ml-3 font-medium">My Cars</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
            
            <a 
              href="/dashboard/host/earnings" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign size={20} className="text-green-500" />
                </div>
                <span className="ml-3 font-medium">Earnings & Payouts</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
            
            <a 
              href="/dashboard/host/reviews" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star size={20} className="text-yellow-500" />
                </div>
                <span className="ml-3 font-medium">Reviews</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
            
            <a 
              href="/dashboard/host/payment-methods" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard size={20} className="text-blue-500" />
                </div>
                <span className="ml-3 font-medium">Payment Methods</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
            
            <a 
              href="/dashboard/host/tax-documents" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText size={20} className="text-purple-500" />
                </div>
                <span className="ml-3 font-medium">Tax Documents</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
            
            <a 
              href="/dashboard/host/settings" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Settings size={20} className="text-gray-500" />
                </div>
                <span className="ml-3 font-medium">Settings</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
            
            <a 
              href="/help" 
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Shield size={20} className="text-gray-500" />
                </div>
                <span className="ml-3 font-medium">Help & Support</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 