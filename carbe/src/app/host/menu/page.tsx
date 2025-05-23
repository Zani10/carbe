'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  DollarSign, 
  Star, 
  User, 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Car,
  BarChart3,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface MenuItemProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  onClick: () => void;
  badge?: string;
  variant?: 'default' | 'highlight';
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  badge,
  variant = 'default'
}) => (
  <Card 
    variant="light" 
    padding="md" 
    onClick={onClick} 
    className={`text-left ${variant === 'highlight' ? 'border-green-200 bg-green-50' : ''}`}
  >
    <div className="flex items-center">
      <div className={`p-2 rounded-lg mr-3 ${
        variant === 'highlight' 
          ? 'bg-green-100 text-green-600' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {badge && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400" />
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
}

const StatBox: React.FC<StatBoxProps> = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
  <Card variant="light" padding="lg" onClick={onClick} className="text-center">
    <div className={`inline-flex p-3 rounded-full mb-3 ${
      color === 'green' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
    }`}>
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-600">{subtitle}</p>
  </Card>
);

export default function HostMenuPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSwitchToRenter = () => {
    router.push('/'); // Go back to renter home page
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please sign in</h2>
          <p className="text-gray-600 mt-2">You need to be signed in to access the host menu.</p>
          <Button 
            variant="host-primary" 
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="mr-3 text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Menu</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card variant="light" padding="md">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-800 mr-4">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {profile?.full_name || 'Host Profile'}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">4.8 · Host since 2023</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Overview - Two Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatBox
            title="Earnings"
            value="$2,847"
            subtitle="This month"
            icon={DollarSign}
            color="green"
            onClick={() => handleNavigate('/host/earnings')}
          />
          <StatBox
            title="Reviews"
            value="4.8"
            subtitle="42 reviews"
            icon={Star}
            color="blue"
            onClick={() => handleNavigate('/host/reviews')}
          />
        </div>

        {/* Host Tools */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Host Tools</h3>
          <div className="space-y-3">
            <MenuItem
              title="Manage Listings"
              description="Add, edit, or remove your cars"
              icon={Car}
              onClick={() => handleNavigate('/host/listings')}
            />
            <MenuItem
              title="Calendar & Availability"
              description="Set your availability and pricing"
              icon={Calendar}
              onClick={() => handleNavigate('/host/calendar')}
            />
            <MenuItem
              title="Messages"
              description="Communicate with your guests"
              icon={MessageSquare}
              badge="2"
              onClick={() => handleNavigate('/host/messages')}
            />
            <MenuItem
              title="Performance"
              description="View insights and analytics"
              icon={BarChart3}
              onClick={() => handleNavigate('/host/performance')}
            />
          </div>
        </div>

        {/* Support & Settings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Support & Settings</h3>
          <div className="space-y-3">
            <MenuItem
              title="Account Settings"
              description="Manage your account preferences"
              icon={Settings}
              onClick={() => handleNavigate('/host/settings')}
            />
            <MenuItem
              title="Notifications"
              description="Control your notification preferences"
              icon={Bell}
              onClick={() => handleNavigate('/host/notifications')}
            />
            <MenuItem
              title="Trust & Safety"
              description="Security and verification settings"
              icon={Shield}
              onClick={() => handleNavigate('/host/safety')}
            />
            <MenuItem
              title="Help Center"
              description="Get help and support"
              icon={HelpCircle}
              onClick={() => handleNavigate('/host/help')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="host-secondary" 
            className="w-full justify-between"
            onClick={handleSwitchToRenter}
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Switch to Renter Mode
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 