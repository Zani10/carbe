'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import ProfileCard from '@/components/layout/ProfileCard';

import Button from '@/components/ui/Button';
import SignInForm from '@/components/forms/SignInForm';
import SignUpForm from '@/components/forms/SignUpForm';
import { 
  LogOut, 
  ChevronRight,
  Heart, 
  CalendarDays,
  Settings,
  Shield,
  CreditCard,
  Briefcase
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, signOut, isLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine if user is currently in host mode based on current route
  const isCurrentlyInHostMode = pathname?.startsWith('/host') || pathname?.startsWith('/dashboard/host');

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Avoid rendering anything on the server to prevent hydration mismatch
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#212121]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF4646]"></div>
      </div>
    );
  }

  const handleSwitchMode = () => {
    if (isCurrentlyInHostMode) {
      // Switch to renter mode - go to main page
      router.push('/');
    } else {
      // Check if user is already a host
      if (profile?.is_host) {
        // User is already a host, go to host dashboard
        router.push('/host/home');
      } else {
        // User is not a host yet, go to host setup
        router.push('/host/setup');
      }
    }
  };

  const handleEditPersonalInfo = () => {
    router.push('/settings/personal');
  };

  return (
    <>
    <div className="min-h-screen bg-[#212121] pb-24">
      {user ? (
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Profile Header */}
          <ProfileCard
            profile={profile}
            user={user}
            memberSince="New member"
            onEditClick={handleEditPersonalInfo}
          />

          {/* Switch to Host Button */}
          {!isCurrentlyInHostMode && (
            <button 
              onClick={handleSwitchMode}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              <Briefcase size={18} className="mr-2" />
              {profile?.is_host ? 'Switch to Host' : 'Become a Host'}
            </button>
          )}

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={() => router.push('/dashboard/renter')}
              className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
            >
              <div className="flex items-center">
                <CalendarDays size={20} className="mr-3 text-gray-400" />
                <span className="font-medium text-white">Past trips</span>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </button>
            
            <button 
              onClick={() => router.push('/favorites')}
              className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
            >
              <div className="flex items-center">
                <Heart size={20} className="mr-3 text-gray-400" />
                <span className="font-medium text-white">Saved</span>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </button>


          </div>

          {/* Settings & Support */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
            <div className="space-y-3">
              <button 
                onClick={() => alert('Account settings coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
              >
                <div className="flex items-center">
                  <Settings size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium text-white">Account settings</span>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </button>
              
              <button 
                onClick={() => alert('Payment methods coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
              >
                <div className="flex items-center">
                  <CreditCard size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium text-white">Payment methods</span>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </button>
              
              <button 
                onClick={() => alert('Privacy settings coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
              >
                <div className="flex items-center">
                  <Shield size={20} className="mr-3 text-gray-400" />
                  <span className="font-medium text-white">Privacy & sharing</span>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">

            
            <Button 
              variant="ghost" 
              className="w-full justify-center text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-[#2A2A2A] p-1" role="group">
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors duration-150
                  ${
                    showSignIn
                      ? 'bg-[#FF4646] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                onClick={() => setShowSignIn(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors duration-150
                  ${
                    !showSignIn
                      ? 'bg-[#FF4646] text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
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
    <RenterBottomNav />
    </>
  );
}

