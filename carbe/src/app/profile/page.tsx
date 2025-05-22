'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SignInForm from '@/components/forms/SignInForm';
import SignUpForm from '@/components/forms/SignUpForm';

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Avoid rendering anything on the server to prevent hydration mismatch
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {user ? (
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
          
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-gray-600">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0] || '?'}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">
                  {user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="space-y-4">
                <a href="/dashboard" className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center">
                    <span className="flex-1 font-medium">My Bookings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </a>
                
                <a href="/favorites" className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center">
                    <span className="flex-1 font-medium">My Favorites</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </a>
                
                <button 
                  onClick={() => signOut()}
                  className="w-full mt-6 px-4 py-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-left font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <div className="space-x-2">
              <button
                className={`px-4 py-2 ${
                  showSignIn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                } rounded-lg font-medium`}
                onClick={() => setShowSignIn(true)}
              >
                Sign In
              </button>
              <button
                className={`px-4 py-2 ${
                  !showSignIn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                } rounded-lg font-medium`}
                onClick={() => setShowSignIn(false)}
              >
                Sign Up
              </button>
            </div>
          </div>

          {showSignIn ? <SignInForm /> : <SignUpForm />}
        </div>
      )}
    </div>
  );
}

