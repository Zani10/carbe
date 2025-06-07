'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HostBottomNav from '@/components/layout/HostBottomNav';
import ProfileCard from '@/components/layout/ProfileCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  DollarSign, 
  Star, 
  User, 
  HelpCircle, 
  Shield, 
  Bell,
  ChevronRight,
  LogOut,
  CreditCard,
  UserCheck,
  Calendar,
  Car,

  BarChart3,
  FileText
} from 'lucide-react';

interface MenuItemProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  onClick: () => void;
  badge?: string;
  variant?: 'default' | 'highlight';
  fullWidth?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  badge,
  variant = 'default',
  fullWidth = false
}) => (
  <Card 
    variant="dark" 
    padding="md" 
    onClick={onClick} 
    className={`text-left transition-all duration-200 hover:bg-[#333333] ${
      variant === 'highlight' ? 'border-green-600/50 bg-green-900/20' : ''
    } ${fullWidth ? 'w-full' : ''}`}
  >
    <div className="flex items-center">
      <div className={`p-2 rounded-lg mr-3 ${
        variant === 'highlight' 
          ? 'bg-green-900/50 text-green-400' 
          : 'bg-gray-700 text-gray-300'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">{title}</h3>
          {badge && (
            <span className="bg-[#FF4646] text-white text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-500" />
    </div>
  </Card>
);

interface StatBoxProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'green' | 'blue';
  onClick: () => void;
  isLoading?: boolean;
}

const StatBox: React.FC<StatBoxProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  onClick, 
  isLoading = false 
}) => (
  <Card 
    variant="dark" 
    padding="lg" 
    onClick={onClick} 
    className="text-center transition-all duration-200 hover:bg-[#333333] relative overflow-hidden"
  >
    {/* Glassmorphism Background Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
    
    <div className={`inline-flex p-3 rounded-full mb-3 relative z-10 ${
      color === 'green' 
        ? 'bg-green-900/50 text-green-400' 
        : 'bg-[#FF4646]/20 text-[#FF4646] shadow-lg shadow-[#FF4646]/20'
    }`}>
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-1 relative z-10">{title}</h3>
    {isLoading ? (
      <div className="w-16 h-6 bg-gray-700 rounded animate-pulse mx-auto mb-1" />
    ) : (
      <p className="text-2xl font-bold text-white mb-1 relative z-10">{value}</p>
    )}
    <p className="text-sm text-gray-400 relative z-10">{subtitle}</p>
  </Card>
);

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
}

export default function HostMenuPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true);

  const handleNavigate = (path: string) => {
    router.push(path);
  };



  const handleSwitchToRenter = () => {
    router.push('/'); // Go back to renter home page
  };

  const handleEditProfile = () => {
    router.push('/host/settings/personal');
  };

  // Fetch earnings data
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      
      try {
        setIsLoadingEarnings(true);
        const response = await fetch('/api/host/earnings', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setEarnings(data);
        } else {
          console.error('Failed to fetch earnings');
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setIsLoadingEarnings(false);
      }
    };

    fetchEarnings();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getHostSince = () => {
    if (profile?.created_at) {
      const year = new Date(profile.created_at).getFullYear();
      return `Host since ${year}`;
    }
    return 'Host since 2023';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Please sign in</h2>
          <p className="text-gray-400 mt-2">You need to be signed in to access the host menu.</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => router.push('/signin')}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#212121] pb-24">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Profile Card */}
          <ProfileCard
            profile={profile}
            user={user}
            memberSince={getHostSince()}
            rating={earnings?.averageRating}
            reviewCount={earnings?.totalReviews}
            onEditClick={handleEditProfile}
          />

          {/* Performance Overview - Two Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatBox
              title="Earnings"
              value={earnings ? formatCurrency(earnings.thisMonth) : '$0'}
              subtitle="This month"
              icon={DollarSign}
              color="green"
              onClick={() => handleNavigate('/host/earnings')}
              isLoading={isLoadingEarnings}
            />
            <StatBox
              title="Reviews"
              value={earnings?.averageRating ? earnings.averageRating.toFixed(1) : '—'}
              subtitle={earnings?.totalReviews ? `${earnings.totalReviews} reviews` : 'No reviews yet'}
              icon={Star}
              color="blue"
              onClick={() => handleNavigate('/host/reviews')}
              isLoading={isLoadingEarnings}
            />
          </div>

          {/* Account & Personal Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Account & Personal</h3>
            <div className="space-y-3">
              <MenuItem
                title="Personal Information"
                description="Manage your profile, contact info, and preferences"
                icon={User}
                onClick={() => handleNavigate('/host/settings/personal')}
                fullWidth
              />
              <MenuItem
                title="Identity Verification"
                description="Verify your identity to increase trust"
                icon={UserCheck}
                onClick={() => handleNavigate('/verify')}
                fullWidth
              />
              <MenuItem
                title="Payment & Taxes"
                description="Manage payout methods and tax information"
                icon={CreditCard}
                onClick={() => handleNavigate('/host/settings/payments')}
                fullWidth
              />
            </div>
          </div>

          {/* Hosting Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Hosting</h3>
            <div className="space-y-3">
              <MenuItem
                title="Your Cars"
                description="Manage your vehicle listings"
                icon={Car}
                onClick={() => handleNavigate('/host/garage')}
                fullWidth
              />
              <MenuItem
                title="Calendar & Availability"
                description="Set availability and pricing"
                icon={Calendar}
                onClick={() => handleNavigate('/host/calendar')}
                fullWidth
              />
              <MenuItem
                title="Performance Insights"
                description="View earnings and booking analytics"
                icon={BarChart3}
                onClick={() => handleNavigate('/host/analytics')}
                fullWidth
              />
            </div>
          </div>

          {/* Support & Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Support & Settings</h3>
            <div className="space-y-3">
              <MenuItem
                title="Notifications"
                description="Control your notification preferences"
                icon={Bell}
                onClick={() => handleNavigate('/host/settings/notifications')}
                fullWidth
              />
              <MenuItem
                title="Privacy & Security"
                description="Manage privacy settings and account security"
                icon={Shield}
                onClick={() => handleNavigate('/host/settings/privacy')}
                fullWidth
              />
              <MenuItem
                title="Help & Support"
                description="Get help, contact support, or report issues"
                icon={HelpCircle}
                onClick={() => handleNavigate('/host/help')}
                fullWidth
              />
              <MenuItem
                title="Legal & Policies"
                description="Terms of service, privacy policy, and guidelines"
                icon={FileText}
                onClick={() => handleNavigate('/host/legal')}
                fullWidth
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={handleSwitchToRenter}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#FF4646] text-white rounded-xl hover:bg-[#FF4646]/90 transition-colors font-medium"
            >
              <User className="h-5 w-5 mr-2" />
              Switch to Renter
            </button>
            
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
      </div>
      <HostBottomNav />
    </>
  );
} 