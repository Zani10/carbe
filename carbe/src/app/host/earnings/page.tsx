'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Car,
  Download,
  Star,
  Calendar,
  Users,
  Award,
  BarChart3,
  PieChart,
  ChevronDown,
  Eye,
  Info
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  monthlyData: Array<{
    month: string;
    earnings: number;
    bookings: number;
  }>;
  topPerformingCar: {
    make: string;
    model: string;
    earnings: number;
  } | null;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendDirection = 'neutral',
  isLoading = false 
}) => (
  <Card variant="dark" padding="lg" className="relative overflow-hidden">
    {/* Glassmorphism effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-[#FF4646]/20">
          <Icon className="h-5 w-5 text-[#FF4646]" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
            trendDirection === 'up' ? 'bg-green-900/50 text-green-400' :
            trendDirection === 'down' ? 'bg-red-900/50 text-red-400' :
            'bg-gray-800 text-gray-400'
          }`}>
            {trend}
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
      {isLoading ? (
        <div className="w-20 h-7 bg-gray-700 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
      )}
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </Card>
);

const SimpleChart: React.FC<{ data: Array<{ month: string; earnings: number; }> }> = ({ data }) => {
  const maxEarnings = Math.max(...data.map(d => d.earnings));
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-32 px-2">
        {data.slice(-6).map((item, index) => {
          const height = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-8 bg-gradient-to-t from-[#FF4646] to-[#FF4646]/60 rounded-t-lg transition-all duration-500 hover:scale-105"
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span className="text-xs text-gray-400 mt-2 text-center">
                {item.month.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FF4646] rounded mr-2" />
          Monthly Earnings
        </div>
      </div>
    </div>
  );
};

export default function HostEarningsPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/host/earnings', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Generate some mock monthly data for the chart
          const mockMonthlyData = [
            { month: 'January', earnings: data.thisMonth * 0.8, bookings: 3 },
            { month: 'February', earnings: data.thisMonth * 0.9, bookings: 4 },
            { month: 'March', earnings: data.thisMonth * 1.1, bookings: 5 },
            { month: 'April', earnings: data.thisMonth * 0.7, bookings: 2 },
            { month: 'May', earnings: data.thisMonth * 1.2, bookings: 6 },
            { month: 'June', earnings: data.thisMonth, bookings: data.totalBookings },
          ];
          setEarnings({
            ...data,
            lastMonth: data.thisMonth * 0.9,
            monthlyData: mockMonthlyData,
            topPerformingCar: {
              make: 'Tesla',
              model: 'Model 3',
              earnings: data.thisMonth * 0.6
            }
          });
        } else {
          console.error('Failed to fetch earnings');
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setIsLoading(false);
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

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { text: 'New', direction: 'neutral' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      text: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      direction: change >= 0 ? 'up' as const : 'down' as const
    };
  };

  if (!user || !isHostMode) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Host Access Required</h2>
          <p className="text-gray-400 mt-2">You need to be a host to view earnings.</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => router.push('/host/setup')}
          >
            Become a Host
          </Button>
        </div>
      </div>
    );
  }

  const thisMonthTrend = earnings ? calculateTrend(earnings.thisMonth, earnings.lastMonth) : null;

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">Earnings</h1>
          </div>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="This Month"
            value={earnings ? formatCurrency(earnings.thisMonth) : '$0'}
            subtitle={`${earnings?.totalBookings || 0} bookings`}
            icon={DollarSign}
            trend={thisMonthTrend?.text}
            trendDirection={thisMonthTrend?.direction}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Total Earnings"
            value={earnings ? formatCurrency(earnings.totalEarnings) : '$0'}
            subtitle="All time"
            icon={TrendingUp}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Average Rating"
            value={earnings?.averageRating ? earnings.averageRating.toFixed(1) : '—'}
            subtitle={`${earnings?.totalReviews || 0} reviews`}
            icon={Star}
            isLoading={isLoading}
          />
          
          <MetricCard
            title="Response Rate"
            value="98%"
            subtitle="Within 1 hour"
            icon={Users}
            isLoading={isLoading}
          />
        </div>

        {/* Earnings Chart */}
        <Card variant="dark" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Earnings Overview</h3>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === 'month'
                    ? 'bg-[#FF4646] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setSelectedPeriod('year')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === 'year'
                    ? 'bg-[#FF4646] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                1Y
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
          ) : earnings?.monthlyData ? (
            <SimpleChart data={earnings.monthlyData} />
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Performance Insights */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-white">Top Performer</p>
                  <p className="text-xs text-gray-400">Your best earning vehicle</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {earnings?.topPerformingCar ? 
                    `${earnings.topPerformingCar.make} ${earnings.topPerformingCar.model}` : 
                    'No data'}
                </p>
                <p className="text-xs text-green-400">
                  {earnings?.topPerformingCar ? formatCurrency(earnings.topPerformingCar.earnings) : '$0'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#2A2A2A] border border-gray-700/50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-[#FF4646] mr-2" />
                  <span className="text-sm text-gray-400">Booking Rate</span>
                </div>
                <p className="text-lg font-semibold text-white">87%</p>
              </div>
              
              <div className="p-3 bg-[#2A2A2A] border border-gray-700/50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Car className="h-4 w-4 text-[#FF4646] mr-2" />
                  <span className="text-sm text-gray-400">Active Cars</span>
                </div>
                <p className="text-lg font-semibold text-white">3</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex items-center justify-center py-3"
            onClick={() => router.push('/host/analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center py-3"
            onClick={() => alert('Export feature coming soon!')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Tips */}
        <Card variant="dark" padding="md" className="border-l-4 border-l-[#FF4646]">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-[#FF4646] mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Maximize Your Earnings</h4>
              <p className="text-xs text-gray-400">
                Update your calendar regularly and respond to bookings quickly to improve your hosting performance.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 