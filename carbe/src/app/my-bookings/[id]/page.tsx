'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  MessageSquare,
  Phone,
  Car,
  Key,
  Smartphone,
  FileText,
  Navigation,
  User,
  Shield,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { BookingWithCar } from '@/types/booking';
import { useBooking } from '@/hooks/booking/useBooking';
import Button from '@/components/ui/Button';

interface BookingDetailsPageProps {
  params: {
    id: string;
  };
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const router = useRouter();
  const { getBookingDetails } = useBooking();
  const [booking, setBooking] = useState<BookingWithCar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingData = await getBookingDetails(params.id);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.id, getBookingDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2800]"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Booking not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isActive = () => {
    const now = new Date();
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    return now >= startDate && now <= endDate;
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d');
  };

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={() => router.back()}
                className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Rides
              </button>
              <h1 className="text-2xl font-bold text-white">Your Booking</h1>
              <p className="text-gray-400">
                {booking.cars.make} {booking.cars.model} • {booking.cars.year}
              </p>
            </div>
            {booking.status === 'confirmed' && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Confirmed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Image & Basic Info */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="aspect-[16/9] relative">
                {booking.cars.images && booking.cars.images.length > 0 ? (
                  <Image
                    src={booking.cars.images[0]}
                    alt={`${booking.cars.make} ${booking.cars.model}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Car className="h-16 w-16 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {booking.cars.make} {booking.cars.model}
                </h2>
                <p className="text-gray-400">{booking.cars.year} • Available for your trip</p>
              </div>
            </div>

            {/* Check-in & Check-out */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Check-in</p>
                      <p className="font-semibold text-white">{formatDate(booking.start_date)}</p>
                      <p className="text-sm text-gray-400">{formatTime(booking.start_date)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Check-out</p>
                      <p className="font-semibold text-white">{formatDate(booking.end_date)}</p>
                      <p className="text-sm text-gray-400">{formatTime(booking.end_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup & Return */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pickup & Return</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-white">Contact host for pickup location</p>
                    <p className="text-sm text-gray-400">Pickup and return location details</p>
                  </div>
                  <button className="flex items-center space-x-1 text-[#FF2800] hover:text-[#FF2800]/80 text-sm font-medium transition-colors">
                    <Navigation className="h-4 w-4" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Access */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vehicle Access</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Key className="h-5 w-5 text-amber-400 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-300">Key Exchange Required</p>
                    <p className="text-sm text-amber-200 mt-1">
                      Contact the host to arrange key pickup. Their contact details are provided below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules & Guidelines */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rules & Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">No smoking in the vehicle</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">Return with same fuel level</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">Report any damages immediately</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300">Maximum speed limit as per local laws</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Special Requests</h3>
                <p className="text-gray-300 leading-relaxed">{booking.special_requests}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Info */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Host Information</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Car Host</p>
                  <p className="text-sm text-gray-400">Host since 2022</p>
                </div>
              </div>
              <div className="space-y-3">
                <button 
                  className="w-full flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 text-left transition-colors"
                  onClick={() => router.push(`/chat/${booking.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-white">Message host</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 text-left transition-colors">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-white">Call host</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Daily rate</span>
                  <span className="text-sm font-medium text-white">€{booking.daily_rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Service fee</span>
                  <span className="text-sm font-medium text-white">€{booking.service_fee}</span>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Total paid</span>
                    <span className="font-semibold text-white">€{booking.total_amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-300 mb-2">Important</h4>
                  <ul className="text-sm text-amber-200 space-y-1">
                    <li>• Bring a valid driver&apos;s license</li>
                    <li>• Arrive on time for pickup</li>
                    <li>• Contact host if you&apos;re running late</li>
                    <li>• Take photos before and after</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Get Receipt */}
            <button className="w-full flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-700/50 rounded-2xl hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-white">Get receipt</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 