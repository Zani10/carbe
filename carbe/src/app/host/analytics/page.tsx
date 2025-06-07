'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Car,
  Star,
  Calendar,
  Users,
  Eye,
  Clock,
  MapPin,
  Filter,
  Download
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface AnalyticsData {
  totalEarnings: number;
  thisMonth: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  viewsData: Array<{
    date: string;
    views: number;
    bookings: number;
  }>;
  popularTimes: Array<{
    hour: number;
    bookings: number;
  }>;
  locationStats: Array<{
    location: string;
    earnings: number;
    bookings: number;
  }>;
}

const ViewsChart: React.FC<{ data: Array<{ date: string; views: number; bookings: number; }> }> = ({ data }) => {
  const maxViews = Math.max(...data.map(d => d.views));
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-40 px-2">
        {data.slice(-7).map((item, index) => {
          const viewHeight = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
          const bookingHeight = item.views > 0 ? (item.bookings / item.views) * viewHeight : 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 relative">
              <div 
                className="w-6 bg-gray-600 rounded-t-lg"
                style={{ height: `${Math.max(viewHeight, 4)}%` }}
              />
              <div 
                className="w-6 bg-[#FF4646] rounded-t-lg absolute bottom-0"
                style={{ height: `${Math.max(bookingHeight, 2)}%` }}
              />
              <span className="text-xs text-gray-400 mt-2 text-center">
                {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-600 rounded mr-2" />
          Views
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FF4646] rounded mr-2" />
          Bookings
        </div>
      </div>
    </div>
  );
};

const PopularTimesChart: React.FC<{ data: Array<{ hour: number; bookings: number; }> }> = ({ data }) => {
  const maxBookings = Math.max(...data.map(d => d.bookings));
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {data.filter(item => item.hour >= 6 && item.hour <= 23).map((item, index) => {
          const intensity = maxBookings > 0 ? item.bookings / maxBookings : 0;
          return (
            <div key={index} className="text-center">
              <div 
                className={`h-8 rounded mb-1 transition-all duration-300 ${
                  intensity > 0.7 ? 'bg-[#FF4646]' :
                  intensity > 0.4 ? 'bg-[#FF4646]/70' :
                  intensity > 0.2 ? 'bg-[#FF4646]/40' :
                  'bg-gray-700'
                }`}
              />
              <span className="text-xs text-gray-400">
                {item.hour.toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 text-center">
        Peak booking hours highlighted in red
      </p>
    </div>
  );
};

export default function HostAnalyticsPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/host/earnings', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Generate mock analytics data
          const mockViewsData = Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
            views: Math.floor(Math.random() * 50) + 10,
            bookings: Math.floor(Math.random() * 5) + 1
          }));
          
          const mockPopularTimes = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            bookings: i >= 6 && i <= 22 ? Math.floor(Math.random() * 10) + 1 : 0
          }));
          
          const mockLocationStats = [
            { location: 'Downtown', earnings: data.thisMonth * 0.4, bookings: Math.floor(data.totalBookings * 0.4) },
            { location: 'Airport', earnings: data.thisMonth * 0.3, bookings: Math.floor(data.totalBookings * 0.3) },
            { location: 'University', earnings: data.thisMonth * 0.3, bookings: Math.floor(data.totalBookings * 0.3) }
          ];
          
          setAnalytics({
            ...data,
            viewsData: mockViewsData,
            popularTimes: mockPopularTimes,
            locationStats: mockLocationStats
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!user || !isHostMode) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">Host Access Required</h2>
          <p className="text-gray-400 mt-2">You need to be a host to view analytics.</p>
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
            <h1 className="text-xl font-semibold text-white">Analytics</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors capitalize ${
                selectedPeriod === period
                  ? 'bg-[#FF4646] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="dark" padding="md" className="text-center">
            <div className="p-2 rounded-lg bg-[#FF4646]/20 inline-flex mb-2">
              <Eye className="h-4 w-4 text-[#FF4646]" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Profile Views</p>
            {isLoading ? (
              <div className="w-12 h-5 bg-gray-700 rounded animate-pulse mx-auto" />
            ) : (
              <p className="text-lg font-bold text-white">
                {analytics?.viewsData?.reduce((sum, item) => sum + item.views, 0) || 0}
              </p>
            )}
          </Card>

          <Card variant="dark" padding="md" className="text-center">
            <div className="p-2 rounded-lg bg-[#FF4646]/20 inline-flex mb-2">
              <Clock className="h-4 w-4 text-[#FF4646]" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Response Time</p>
            <p className="text-lg font-bold text-white">12m</p>
          </Card>

          <Card variant="dark" padding="md" className="text-center">
            <div className="p-2 rounded-lg bg-[#FF4646]/20 inline-flex mb-2">
              <TrendingUp className="h-4 w-4 text-[#FF4646]" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Conversion Rate</p>
            <p className="text-lg font-bold text-white">23%</p>
          </Card>

          <Card variant="dark" padding="md" className="text-center">
            <div className="p-2 rounded-lg bg-[#FF4646]/20 inline-flex mb-2">
              <Star className="h-4 w-4 text-[#FF4646]" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Satisfaction</p>
            <p className="text-lg font-bold text-white">
              {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '—'}
            </p>
          </Card>
        </div>

        {/* Views & Bookings Chart */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Views & Bookings</h3>
          {isLoading ? (
            <div className="h-40 bg-gray-800 rounded-lg animate-pulse" />
          ) : analytics?.viewsData ? (
            <ViewsChart data={analytics.viewsData} />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Popular Booking Times */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Booking Times</h3>
          {isLoading ? (
            <div className="h-20 bg-gray-800 rounded-lg animate-pulse" />
          ) : analytics?.popularTimes ? (
            <PopularTimesChart data={analytics.popularTimes} />
          ) : (
            <div className="h-20 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Location Performance */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Location Performance</h3>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />
              ))
            ) : analytics?.locationStats ? (
              analytics.locationStats.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#2A2A2A] border border-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-[#FF4646] mr-3" />
                    <div>
                      <p className="text-sm font-medium text-white">{location.location}</p>
                      <p className="text-xs text-gray-400">{location.bookings} bookings</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(location.earnings)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No location data available
              </div>
            )}
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <Card variant="dark" padding="lg">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Base Rate</span>
              <span className="text-sm text-white">
                {analytics ? formatCurrency(analytics.thisMonth * 0.7) : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Extras & Fees</span>
              <span className="text-sm text-white">
                {analytics ? formatCurrency(analytics.thisMonth * 0.3) : '$0'}
              </span>
            </div>
            <div className="border-t border-gray-700/50 pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Total</span>
              <span className="text-sm font-semibold text-[#FF4646]">
                {analytics ? formatCurrency(analytics.thisMonth) : '$0'}
              </span>
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card variant="dark" padding="lg" className="border-l-4 border-l-green-500">
          <h4 className="text-sm font-medium text-white mb-2">💡 Insight</h4>
          <p className="text-xs text-gray-400">
            Your listings get 23% more views on weekends. Consider adjusting your pricing strategy 
            for higher demand periods.
          </p>
        </Card>
      </div>
    </div>
  );
} 