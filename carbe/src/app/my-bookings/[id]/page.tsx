'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Calendar,
  Phone,
  Key,
  FileText,
  User,
  Shield,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Info,
  Car,
  Fuel
} from 'lucide-react';
import { BookingWithCar } from '@/types/booking';
import { useBooking } from '@/hooks/booking/useBooking';
import Button from '@/components/ui/Button';
import BookingImageCarousel from '@/components/booking/BookingImageCarousel';
import PickupLocationMap from '@/components/maps/PickupLocationMap';
import MessageBookingButton from '@/components/booking/MessageBookingButton';
import { DEFAULT_PICKUP_LOCATION, DEFAULT_ADDITIONAL_INFO, DEFAULT_FUEL_DEPOSIT } from '@/constants/pricing';

interface BookingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Extended booking data with host-editable fields
interface BookingWithHostData extends BookingWithCar {
  fuel_deposit?: number;
  pickup_location?: string;
  additional_info?: string;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const router = useRouter();
  const { getBookingDetails } = useBooking();
  const [booking, setBooking] = useState<BookingWithHostData | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingData = await getBookingDetails(resolvedParams.id);
        // TODO: Fetch host-editable fields from booking_details table
        // This should eventually call: getBookingDetailsWithHostData(bookingId)
        // which fetches from both bookings table + booking_details table
        // For now, using defaults from constants
        const extendedBookingData = {
          ...bookingData,
          fuel_deposit: DEFAULT_FUEL_DEPOSIT,
          pickup_location: DEFAULT_PICKUP_LOCATION,
          additional_info: DEFAULT_ADDITIONAL_INFO
        } as BookingWithHostData;
        setBooking(extendedBookingData);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [resolvedParams.id, getBookingDetails]);

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

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d');
  };

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const isUpcoming = now < startDate;
    const isActive = now >= startDate && now <= endDate;
    const isCompleted = now > endDate;

    if (booking.status === 'cancelled') {
      return { text: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-400/20' };
    }
    if (isCompleted) {
      return { text: 'Completed', color: 'text-blue-400', bgColor: 'bg-blue-400/20' };
    }
    if (isActive) {
      return { text: 'Active - Enjoy your trip!', color: 'text-green-400', bgColor: 'bg-green-400/20' };
    }
    if (isUpcoming) {
      return { text: 'Upcoming', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' };
    }
    return { text: 'Confirmed', color: 'text-green-400', bgColor: 'bg-green-400/20' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-[#212121]">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-[#2A2A2A] border-b border-gray-700/50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Your Ride</h1>
              <p className="text-gray-400 text-sm">
                {booking.cars.make} {booking.cars.model}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} border border-opacity-20`}>
            <CheckCircle className="h-4 w-4" />
            <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
        </div>
      </div>

            {/* Desktop Header */}
      <div className="hidden lg:block bg-[#212121] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-4 w-px bg-gray-700"></div>
              <h1 className="text-xl font-semibold text-white">Your Ride</h1>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} `}>
              <CheckCircle className="h-4 w-4" />
              <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Image Carousel */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 overflow-hidden">
              <BookingImageCarousel
                images={booking.cars.images || []}
                alt={`${booking.cars.make} ${booking.cars.model}`}
                className="aspect-[16/9]"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {booking.cars.make} {booking.cars.model}
                </h2>
                <p className="text-gray-400">Available for your trip</p>
              </div>
            </div>

            {/* Trip Details */}
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

            {/* Enhanced Pickup & Return with Dynamic Location */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Pickup & Return Location</h3>
              </div>
              
              {/* Dynamic pickup location from host */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                  {booking.pickup_location || booking.cars.location || "Contact host for pickup locations details"}
                </p>
              </div>
              
              <PickupLocationMap 
                address={booking.pickup_location || booking.cars.location || "Amsterdam, Netherlands"}
              />
            </div>

            {/* Vehicle Status */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Vehicle Status</h3>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Ready for pickup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">Full tank</span>
                </div>
              </div>
            </div>

            {/* Trip Information from Host */}
            {booking.additional_info && (
              <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Important Information</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {booking.additional_info}
                </p>
              </div>
            )}

            {/* Host Information - Moved here */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MessageBookingButton
                  carId={booking.cars.id}
                  hostId={booking.cars.owner_id}
                  renterId={booking.renter_id}
                  bookingId={booking.id}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                />
                
                <button className="flex items-center justify-center space-x-2 p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 text-left transition-colors">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">Call</span>
                </button>
              </div>
            </div>

            {/* Vehicle Access */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vehicle Access</h3>
              <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Key className="h-5 w-5 text-amber-400 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-amber-300">Key Exchange Required</p>
                  <p className="text-sm text-amber-200 mt-1">
                    Contact the host to arrange key pickup. Their contact details are provided above.
                  </p>
                </div>
              </div>
            </div>

            {/* Rules & Guidelines */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rules & Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-300">No smoking in the vehicle</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-300">Return with same fuel level</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-300">Report any damages immediately</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-300">Maximum speed limit as per local laws</p>
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
            {/* Important Info - Moved before Payment Summary */}
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

            {/* Enhanced Payment Summary with Fuel Deposit */}
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Fuel deposit</span>
                  <span className="text-sm font-medium text-white">€{booking.fuel_deposit || DEFAULT_FUEL_DEPOSIT}</span>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Total paid</span>
                    <span className="font-semibold text-white">€{booking.total_amount}</span>
                  </div>
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