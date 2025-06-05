'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Car, 
  MapPin, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Smartphone,
  Eye,
  Lock,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { COLORS } from '@/constants/colors';

export default function HostSettingsPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] p-4">
        <GlassCard padding="lg" className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to access settings.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-block px-6 py-3 text-white rounded-xl transition-colors"
            style={{ backgroundColor: COLORS.primary.red }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.redHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.red}
          >
            Go to Profile
          </button>
        </GlassCard>
      </div>
    );
  }

  const settingsCategories = [
    {
      id: 'profile',
      title: 'Profile & Account',
      description: 'Manage your host profile and account settings',
      icon: User,
      color: 'blue',
      items: [
        'Host profile information',
        'Contact details',
        'Host verification status',
        'Account preferences',
        'Language & region'
      ]
    },
    {
      id: 'listings',
      title: 'Listing Management',
      description: 'Default settings for your car listings',
      icon: Car,
      color: 'red',
      items: [
        'Default pricing strategy',
        'Availability preferences',
        'Instant booking settings',
        'Minimum/maximum rental duration',
        'Cancellation policy'
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control when and how you receive notifications',
      icon: Bell,
      color: 'yellow',
      items: [
        'Booking notifications',
        'Message alerts',
        'Calendar reminders',
        'Payment notifications',
        'Marketing communications'
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar & Availability',
      description: 'Manage your calendar and availability settings',
      icon: Calendar,
      color: 'green',
      items: [
        'Default availability windows',
        'Buffer time between bookings',
        'Automatic calendar sync',
        'Holiday and vacation mode',
        'Advance booking requirements'
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing & Payouts',
      description: 'Configure pricing rules and payout settings',
      icon: DollarSign,
      color: 'emerald',
      items: [
        'Smart pricing automation',
        'Seasonal pricing adjustments',
        'Discount management',
        'Payout frequency',
        'Tax information'
      ]
    },
    {
      id: 'location',
      title: 'Location & Pickup',
      description: 'Set default pickup locations and radius',
      icon: MapPin,
      color: 'purple',
      items: [
        'Default pickup locations',
        'Service radius',
        'Delivery preferences',
        'Parking instructions',
        'Location visibility'
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Manage how you communicate with renters',
      icon: MessageSquare,
      color: 'cyan',
      items: [
        'Auto-response templates',
        'Response time goals',
        'Communication preferences',
        'Language preferences',
        'Professional messaging tools'
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Control security and privacy settings',
      icon: Shield,
      color: 'red',
      items: [
        'Two-factor authentication',
        'Login activity monitoring',
        'Data privacy controls',
        'Renter verification requirements',
        'Insurance preferences'
      ]
    },
    {
      id: 'smart-features',
      title: 'Smart Features',
      description: 'Configure smart lock and IoT integrations',
      icon: Smartphone,
      color: 'indigo',
      items: [
        'Smart lock management',
        'Remote monitoring',
        'Automated check-in/out',
        'Vehicle tracking',
        'Maintenance alerts'
      ]
    },
    {
      id: 'payments',
      title: 'Payment Settings',
      description: 'Manage payment methods and billing',
      icon: CreditCard,
      color: 'pink',
      items: [
        'Payout account setup',
        'Payment processing fees',
        'Billing history',
        'Tax documents',
        'Refund management'
      ]
    }
  ];

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: '#3B82F6',
      red: COLORS.primary.red,
      yellow: '#F59E0B',
      green: '#10B981',
      emerald: '#059669',
      purple: '#8B5CF6',
      cyan: '#06B6D4',
      indigo: '#6366F1',
      pink: '#EC4899'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: `${COLORS.primary.red}20` }}
              >
                <SettingsIcon className="h-5 w-5" style={{ color: COLORS.primary.red }} />
              </div>
              <h1 className="text-lg font-semibold text-white">Host Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Quick Stats */}
        <GlassCard gradient="accent" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Host Level</h3>
              <p className="text-sm text-gray-300">Professional Host</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Settings Completion</div>
              <div className="text-lg font-bold text-white">85%</div>
            </div>
          </div>
        </GlassCard>

        {/* Settings Categories */}
        <div className="space-y-3">
          {settingsCategories.map((category) => {
            const IconComponent = category.icon;
            const isExpanded = activeSection === category.id;
            
            return (
              <GlassCard key={category.id} padding="none" className="overflow-hidden">
                <button
                  onClick={() => setActiveSection(isExpanded ? null : category.id)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${getIconColor(category.color)}20` }}
                      >
                        <IconComponent 
                          className="h-5 w-5" 
                          style={{ color: getIconColor(category.color) }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{category.title}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-700/30">
                    <div className="pt-3 space-y-2">
                      <p className="text-sm text-gray-300 mb-3">Available options:</p>
                      {category.items.map((item, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3" />
                          {item}
                        </div>
                      ))}
                      <div className="pt-3">
                        <div 
                          className="text-xs px-3 py-2 rounded-lg text-center"
                          style={{ 
                            backgroundColor: `${COLORS.primary.red}20`,
                            color: COLORS.primary.red 
                          }}
                        >
                          Coming in next update
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>

        {/* Feature Request */}
        <GlassCard gradient="subtle" padding="md" className="mt-6">
          <div className="text-center">
            <h3 className="text-white font-semibold mb-2">Missing a Setting?</h3>
            <p className="text-sm text-gray-300 mb-4">
              Let us know what settings you'd like to see and we'll prioritize them for future updates.
            </p>
            <button 
              className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
              onClick={() => {
                // TODO: Implement feedback form
                router.push('/host/messages');
              }}
            >
              Send Feedback
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 