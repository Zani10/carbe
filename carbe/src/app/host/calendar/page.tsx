'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  ArrowLeft,
  Settings,
  DollarSign,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';

// Mock booked dates
const bookedDates = [
  new Date('2024-01-15'),
  new Date('2024-01-16'),
  new Date('2024-01-17'),
  new Date('2024-01-22'),
  new Date('2024-01-23'),
];

// Mock blocked dates (manually blocked by host)
const blockedDates = [
  new Date('2024-01-10'),
  new Date('2024-01-11'),
];

export default function HostCalendarPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'settings'>('calendar');
  const [selectedPricing, setSelectedPricing] = useState<'default' | 'custom'>('default');
  const [customPrice, setCustomPrice] = useState('85');
  
  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] p-4">
        <div className="bg-[#2A2A2A] p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to access the calendar.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-block px-6 py-3 bg-[#FF2800] text-white rounded-xl hover:bg-[#FF2800]/90"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => isSameDay(date, blockedDate));
  };

  const isDateAvailable = (date: Date) => {
    return !isDateBooked(date) && !isDateBlocked(date);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      if (isDateBooked(date)) {
        return 'booked-date';
      }
      if (isDateBlocked(date)) {
        return 'blocked-date';
      }
      if (isDateAvailable(date)) {
        return 'available-date';
      }
    }
    return '';
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      if (isDateBooked(date)) {
        return <div className="tile-indicator booked"></div>;
      }
      if (isDateBlocked(date)) {
        return <div className="tile-indicator blocked"></div>;
      }
    }
    return null;
  };

  const handleDateClick = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const toggleDateAvailability = () => {
    if (!selectedDate) return;
    
    if (isDateBlocked(selectedDate)) {
      // Remove from blocked dates
      const index = blockedDates.findIndex(d => isSameDay(d, selectedDate));
      if (index > -1) {
        blockedDates.splice(index, 1);
      }
    } else if (isDateAvailable(selectedDate)) {
      // Add to blocked dates
      blockedDates.push(selectedDate);
    }
    // Force re-render
    setSelectedDate(new Date(selectedDate));
  };

  return (
    <div className="min-h-screen bg-[#212121] pb-20">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">Calendar</h1>
            </div>
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'calendar' 
                  ? 'border-[#FF2800] text-[#FF2800]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('calendar')}
            >
              Calendar
            </button>
            <button
              className={`py-4 px-1 font-medium text-sm border-b-2 ${
                activeTab === 'settings' 
                  ? 'border-[#FF2800] text-[#FF2800]' 
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Pricing
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'calendar' && (
          <>
            {/* Legend */}
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-white font-medium mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-gray-300">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#FF2800] rounded mr-3"></div>
                  <span className="text-gray-300">Booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mr-3"></div>
                  <span className="text-gray-300">Blocked</span>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 mb-6">
              <style jsx global>{`
                .react-calendar {
                  background: transparent;
                  border: none;
                  color: white;
                  font-family: inherit;
                  width: 100%;
                }
                
                .react-calendar__navigation {
                  margin-bottom: 1rem;
                }
                
                .react-calendar__navigation button {
                  background: #1F1F1F;
                  border: 1px solid #374151;
                  color: white;
                  font-size: 16px;
                  font-weight: 500;
                  padding: 8px 12px;
                  margin: 0 2px;
                  border-radius: 8px;
                }
                
                .react-calendar__navigation button:hover {
                  background: #374151;
                }
                
                .react-calendar__navigation button:disabled {
                  background: #111827;
                  color: #6B7280;
                }
                
                .react-calendar__month-view__weekdays {
                  text-align: center;
                  text-transform: uppercase;
                  font-weight: 500;
                  font-size: 12px;
                  color: #9CA3AF;
                  margin-bottom: 8px;
                }
                
                .react-calendar__month-view__weekdays__weekday {
                  padding: 8px 0;
                  border: none;
                }
                
                .react-calendar__month-view__days__day {
                  position: relative;
                  background: #1F1F1F;
                  border: 1px solid #374151;
                  color: white;
                  padding: 12px 4px;
                  margin: 1px;
                  border-radius: 8px;
                  cursor: pointer;
                  font-weight: 500;
                }
                
                .react-calendar__month-view__days__day:hover {
                  background: #374151;
                }
                
                .react-calendar__month-view__days__day--neighboringMonth {
                  color: #6B7280;
                }
                
                .react-calendar__tile--active {
                  background: #FF2800 !important;
                  color: white !important;
                }
                
                .react-calendar__tile.booked-date {
                  background: #FF2800 !important;
                  color: white !important;
                }
                
                .react-calendar__tile.blocked-date {
                  background: #6B7280 !important;
                  color: white !important;
                }
                
                .react-calendar__tile.available-date {
                  background: #059669 !important;
                  color: white !important;
                }
                
                .tile-indicator {
                  position: absolute;
                  bottom: 2px;
                  right: 2px;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                }
                
                .tile-indicator.booked {
                  background: #FEF3C7;
                }
                
                .tile-indicator.blocked {
                  background: #FEE2E2;
                }
              `}</style>
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileClassName={tileClassName}
                tileContent={tileContent}
                minDate={new Date()}
                locale="en-US"
              />
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 mb-6">
                <h3 className="text-white font-medium mb-3">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                
                <div className="space-y-3">
                  {isDateBooked(selectedDate) && (
                    <div className="flex items-center p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                      <div>
                        <p className="text-red-300 font-medium">Booked</p>
                        <p className="text-red-400 text-sm">This date is already booked by a guest</p>
                      </div>
                    </div>
                  )}
                  
                  {isDateBlocked(selectedDate) && (
                    <div className="flex items-center p-3 bg-gray-900/20 border border-gray-700/50 rounded-lg">
                      <X className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-gray-300 font-medium">Blocked</p>
                        <p className="text-gray-400 text-sm">You&apos;ve blocked this date</p>
                      </div>
                    </div>
                  )}
                  
                  {isDateAvailable(selectedDate) && (
                    <div className="flex items-center p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <Check className="h-5 w-5 text-green-400 mr-3" />
                      <div>
                        <p className="text-green-300 font-medium">Available</p>
                        <p className="text-green-400 text-sm">Ready for bookings at €85/day</p>
                      </div>
                    </div>
                  )}
                  
                  {!isDateBooked(selectedDate) && (
                    <button
                      onClick={toggleDateAvailability}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-colors ${
                        isDateBlocked(selectedDate)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {isDateBlocked(selectedDate) ? 'Unblock Date' : 'Block Date'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Default Pricing */}
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Default Pricing</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="default-pricing"
                    name="pricing"
                    checked={selectedPricing === 'default'}
                    onChange={() => setSelectedPricing('default')}
                    className="w-4 h-4 text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2"
                  />
                  <label htmlFor="default-pricing" className="ml-2 text-white">
                    Use default price (€85/day)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom-pricing"
                    name="pricing"
                    checked={selectedPricing === 'custom'}
                    onChange={() => setSelectedPricing('custom')}
                    className="w-4 h-4 text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2"
                  />
                  <label htmlFor="custom-pricing" className="ml-2 text-white">
                    Set custom price
                  </label>
                </div>
                
                {selectedPricing === 'custom' && (
                  <div className="ml-6">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="bg-[#1F1F1F] border border-gray-600 text-white rounded-lg px-3 py-2 w-20 mr-2 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                        min="1"
                      />
                      <span className="text-gray-400">per day</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Quick Settings</h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Block next 7 days</p>
                      <p className="text-gray-400 text-sm">Quickly block a week</p>
                    </div>
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                
                <button className="w-full text-left p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Weekend pricing</p>
                      <p className="text-gray-400 text-sm">Set higher prices for weekends</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                
                <button className="w-full text-left p-3 bg-[#1F1F1F] border border-gray-700/50 rounded-lg hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Minimum stay</p>
                      <p className="text-gray-400 text-sm">Set minimum booking length</p>
                    </div>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Save Changes */}
            <button className="w-full bg-[#FF2800] text-white py-3 rounded-xl font-medium hover:bg-[#FF2800]/90 transition-colors">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 