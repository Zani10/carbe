'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import SignInForm from '@/components/forms/SignInForm';
import SignUpForm from '@/components/forms/SignUpForm';
import { LogOut, UserCircle, ChevronRight, Briefcase, Heart, CalendarDays } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut, isLoading, toggleHostMode, isHostMode } = useAuth();
  const [showSignIn, setShowSignIn] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Avoid rendering anything on the server to prevent hydration mismatch
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
      </div>
    );
  }

  const handleSwitchToHost = () => {
    if (isHostMode) {
      // If already in host mode, just toggle back to renter mode
      toggleHostMode();
      router.push('/');
    } else {
      // If in renter mode, toggle to host mode and redirect to setup or dashboard
      toggleHostMode();
      router.push('/dashboard/host/setup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {user ? (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-800">
                <UserCircle size={48} strokeWidth={1.5} />
              </div>
              <div className="ml-5">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                  {user.user_metadata?.full_name || 'User Profile'}
                </h1>
                <p className="text-gray-500 text-sm md:text-base">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <a 
                href="/dashboard/renter" 
                className="flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-150 text-gray-800"
              >
                <div className="flex items-center">
                  <CalendarDays size={20} className="mr-3 text-gray-600" />
                  <span className="font-medium">My Bookings</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </a>
              
              <a 
                href="/favorites" 
                className="flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-150 text-gray-800"
              >
                <div className="flex items-center">
                  <Heart size={20} className="mr-3 text-gray-600" />
                  <span className="font-medium">My Favorites</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </a>

              <button 
                onClick={handleSwitchToHost}
                className="w-full flex items-center justify-between px-4 py-4 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
              >
                <div className="flex items-center">
                  <Briefcase size={20} className="mr-3" />
                  <span>{isHostMode ? 'Switch to Renter' : 'Switch to Host'}</span>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>

          </div>

          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center mt-6 px-4 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-10 md:mt-20">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium rounded-l-lg transition-colors duration-150 focus:z-10 focus:ring-2 focus:ring-red-400
                  ${
                    showSignIn
                      ? 'bg-red-500 text-white border border-red-500'
                      : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => setShowSignIn(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium rounded-r-lg transition-colors duration-150 focus:z-10 focus:ring-2 focus:ring-red-400
                  ${
                    !showSignIn
                      ? 'bg-red-500 text-white border border-red-500'
                      : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => setShowSignIn(false)}
              >
                Sign Up
              </button>
            </div>
          </div>

          {showSignIn ? <SignInForm /> : 
          <SignUpForm />}
        </div>
      )}
    </div>
  );
}

