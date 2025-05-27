'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import RenterBottomNav from '@/components/layout/RenterBottomNav';
import SignInForm from '@/components/forms/SignInForm';
import SignUpForm from '@/components/forms/SignUpForm';
import { 
  LogOut, 
  UserCircle, 
  ChevronRight, 
  Briefcase, 
  Heart, 
  CalendarDays,
  Settings,
  Shield,
  CreditCard,
  Pen,
  Plus,
  Star,
  Languages,
  GraduationCap,
  Building,
  Home
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
      // Switch to host mode - go to host dashboard
      router.push('/host/today');
    }
  };

  const ProfileInfoItem = ({ icon: Icon, title, value, hasValue = false, onClick }: {
    icon: React.ElementType;
    title: string;
    value?: string | null;
    hasValue?: boolean;
    onClick?: () => void;
  }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-xl hover:bg-[#2A2A2A]/80 transition-colors"
    >
      <div className="flex items-center">
        <Icon className="h-5 w-5 text-gray-400 mr-3" />
        <div className="text-left">
          <p className="text-white font-medium">{title}</p>
          {hasValue && value && (
            <p className="text-sm text-gray-400">{value}</p>
          )}
          {!hasValue && (
            <p className="text-sm text-gray-500">Not provided</p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {!hasValue && <Plus className="h-4 w-4 text-gray-500 mr-1" />}
        {hasValue && <Pen className="h-4 w-4 text-gray-500 mr-1" />}
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </button>
  );

  return (
    <>
    <div className="min-h-screen bg-[#212121] pb-24">
      {user ? (
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Profile Header */}
          <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="h-20 w-20 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 mr-4">
                <UserCircle size={48} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-white">
                  {profile?.full_name || user.user_metadata?.full_name || 'Your Name'}
                </h1>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-400">New member</span>
                </div>
              </div>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <Pen className="h-4 w-4 text-gray-300" />
              </button>
            </div>
            
            {!isCurrentlyInHostMode && !profile?.is_host && (
              <button 
                onClick={handleSwitchMode}
                className="w-full flex items-center justify-center px-4 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
              >
                <Briefcase size={18} className="mr-2" />
                Become a Host
              </button>
            )}
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Personal info</h2>
            <div className="space-y-3">
              <ProfileInfoItem
                icon={Home}
                title="Where you live"
                value={profile?.location}
                hasValue={!!profile?.location}
                onClick={() => alert('Edit location functionality coming soon!')}
              />
              <ProfileInfoItem
                icon={Building}
                title="Work"
                value={profile?.work}
                hasValue={!!profile?.work}
                onClick={() => alert('Edit work functionality coming soon!')}
              />
              <ProfileInfoItem
                icon={GraduationCap}
                title="Education"
                value={profile?.education}
                hasValue={!!profile?.education}
                onClick={() => alert('Edit education functionality coming soon!')}
              />
              <ProfileInfoItem
                icon={Languages}
                title="Languages"
                value={profile?.languages}
                hasValue={!!profile?.languages}
                onClick={() => alert('Edit languages functionality coming soon!')}
              />
              <ProfileInfoItem
                icon={UserCircle}
                title="About you"
                value={profile?.bio}
                hasValue={!!profile?.bio}
                onClick={() => alert('Edit bio functionality coming soon!')}
              />
            </div>
          </div>

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

            {(isCurrentlyInHostMode || profile?.is_host) && (
              <button 
                onClick={handleSwitchMode}
                className="w-full flex items-center justify-between p-4 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
              >
                <div className="flex items-center">
                  <Briefcase size={20} className="mr-3" />
                  <span>Switch to {isCurrentlyInHostMode ? 'Renter' : 'Host'}</span>
                </div>
                <ChevronRight size={20} />
              </button>
            )}
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

          {/* Sign Out */}
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center p-4 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors font-medium"
          >
            <LogOut size={20} className="mr-3" />
            Sign out
          </button>
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

