'use client';

import { notFound } from 'next/navigation';
import { useCarById } from '@/hooks/useCars';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Share, Heart, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import all the beautiful existing components
import ImageCarousel from '@/components/carDetail/ImageCarousel';
import OverviewTab from '@/components/carDetail/OverviewTab/OverviewTab';
import DetailsTab from '@/components/carDetail/Details/DetailsTab';
import HostTab from '@/components/carDetail/HostTab/HostTab';
import PickupTab from '@/components/carDetail/Pickup/PickupTab';
import StickyFooterBar from '@/components/carDetail/StickyFooterBar';
import BookingFooter from '@/components/booking/BookingFooter';
import DatePicker from '@/components/booking/DatePicker';
import DesktopDatePicker from '@/components/booking/DesktopDatePicker';
import BookingSuccessOverlay from '@/components/booking/BookingSuccessOverlay';
import MapView from '@/components/home/MapView';
import { differenceInDays, format } from 'date-fns';

interface CarDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { createBooking, isCreating } = useBooking();
  const [id, setId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    totalAmount: number;
  } | null>(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  
  useEffect(() => {
    params.then(resolvedParams => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const { car, isLoading, error } = useCarById(id);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share && car) {
      try {
        await navigator.share({
          title: `${car.make} ${car.model} - Carbe`,
          text: `Check out this ${car.make} ${car.model} on Carbe!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    
    await toggleFavorite(id);
  };

  const handleDateSelect = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setIsDatePickerOpen(false);
  };

    const handleRequestBooking = async () => {
    if (!car || !selectedStartDate || !selectedEndDate || isCreating) return;
    
    // Check if user is authenticated
    if (!user || !profile) {
      toast.error('Please sign in to book a car');
      router.push('/signin');
      return;
    }

    // Calculate dates and pricing
    const startDateStr = selectedStartDate.toISOString().split('T')[0];
    const endDateStr = selectedEndDate.toISOString().split('T')[0];
    const days = Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = days * car.price_per_day;
    const serviceFee = Math.round(subtotal * 0.1); // 10% service fee
    const totalAmount = subtotal + serviceFee;

    try {
      // Create the booking directly
      const result = await createBooking({
        car_id: car.id,
        start_date: startDateStr,
        end_date: endDateStr,
        daily_rate: car.price_per_day,
        subtotal,
        service_fee: serviceFee,
        total_amount: totalAmount,
        special_requests: '',
        requiresApproval: false, // Default to false, will add this field to car schema later
      });

      if (result) {
        // Set booking result and show success overlay
        setBookingResult({ totalAmount });
        setShowSuccessOverlay(true);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccessOverlay(false);
    setBookingResult(null);
    // Redirect to renter dashboard
    router.push('/dashboard/renter');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#212121]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF2800]"></div>
      </div>
    );
  }

  if (error || !car) {
    notFound();
  }

  // Define the tabs
  const tabs = ['Overview', 'Details', 'Host', 'Pickup'];

  // Prepare data for Overview tab
  const overviewData = {
    carName: `${car.make} ${car.model}`,
    description: car.description || `Experience the ${car.year} ${car.make} ${car.model} - a perfect blend of performance and comfort.`,
    specs: [
      {
        icon: 'range' as const,
        value: '400 km', // Static value since range_km doesn't exist in DB
        subtext: 'Range'
      },
      {
        icon: 'seats' as const,
        value: car.seats ? `${car.seats}` : '5',
        subtext: 'Seats'
      },
      {
        icon: 'powertrain' as const,
        value: car.fuel_type || 'Petrol',
        subtext: 'Fuel Type'
      }
    ],
    details: [
      {
        label: 'Make',
        value: car.make
      },
      {
        label: 'Model',
        value: car.model
      },
      {
        label: 'Year',
        value: car.year.toString()
      },
      {
        label: 'Transmission',
        value: car.transmission || 'Automatic'
      },
      {
        label: 'Location',
        value: car.location || 'Available on request'
      }
    ]
  };

  // Prepare data for Host tab  
  const hostData = {
    hostData: {
      name: car.profiles?.full_name || 'Car Owner',
      description: 'Passionate about cars and providing excellent service to renters. I take great care of my vehicles and ensure they are always clean and ready for your next adventure.',
      profilePicture: car.profiles?.profile_image || 'https://via.placeholder.com/100x100?text=Host',
      languages: 'English, French, Dutch',
      nationality: 'Belgian',
      distance: '1.2 km away',
      rating: 4.8,
      responseRate: 95,
      responseTime: 'Within an hour',
      address: car.location || 'Brussels',
      city: 'Brussels',
      postalCode: '1081'
    },
    price: car.price_per_day
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab {...overviewData} carId={car.id} hostId={car.owner_id} />;
      case 'Details':
        return <DetailsTab />;
      case 'Host':
        return <HostTab {...hostData} />;
      case 'Pickup':
        return <PickupTab car={car} />;
      default:
        return <OverviewTab {...overviewData} carId={car.id} hostId={car.owner_id} />;
    }
  };

  return (
    <>
      {/* Mobile Layout - Hidden on Desktop */}
      <div className="lg:hidden min-h-screen bg-[#212121] relative">
        {/* Fixed Navigation Header - Fades when sticky header shows */}
        <div className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 transition-opacity duration-300 ${showStickyHeader ? 'opacity-30' : 'opacity-100'}`}>
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all"
            >
              <Share size={18} />
            </button>
            
            <button
              onClick={handleToggleFavorite}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all"
            >
              <Heart 
                size={18} 
                className={isFavorite(id) ? 'fill-red-500 text-red-500' : ''} 
              />
            </button>
          </div>
        </div>

        {/* Sticky Header on Scroll */}
        {showStickyHeader && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-[#212121]/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 transition-all duration-300">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              
              <h1 className="text-white font-bold text-lg">{car.make} {car.model}</h1>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all"
                >
                  <Share size={18} />
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all"
                >
                  <Heart 
                    size={18} 
                    className={isFavorite(id) ? 'fill-red-500 text-red-500' : ''} 
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Carousel with integrated tabs */}
        <div className={showStickyHeader ? 'pt-20' : ''}>
          <ImageCarousel
            images={car.images || ['https://via.placeholder.com/800x400?text=No+Image']}
            rating={car.rating || 4.5}
            location={car.location || 'Location not specified'}
            tabs={tabs}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className={`px-4 py-6 ${selectedStartDate && selectedEndDate ? 'pb-40' : 'pb-32'}`}>
          {renderTabContent()}
        </div>

        {/* Footer - show BookingFooter if dates selected, otherwise StickyFooterBar */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          {selectedStartDate && selectedEndDate ? (
            <BookingFooter
              pricePerDay={car.price_per_day}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onConfirm={handleRequestBooking}
              onEditDates={() => setIsDatePickerOpen(true)}
            />
          ) : (
            <StickyFooterBar
              price={car.price_per_day}
              onSelectDates={() => setIsDatePickerOpen(true)}
              carId={id}
            />
          )}
        </div>
      </div>

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden lg:block min-h-screen bg-[#212121]">
        {/* Desktop Navigation Bar - Clean Design */}
        <nav className="bg-[#212121] border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left - Back Button Only */}
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Back</span>
                </button>
              </div>

              {/* Right - Actions Only */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333333] text-white transition-colors duration-200 cursor-pointer"
                >
                  <Share size={16} />
                  <span className="text-sm">Share</span>
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                    isFavorite(id) 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-[#2A2A2A] hover:bg-[#333333] text-white'
                  }`}
                >
                  <Heart 
                    size={16} 
                    className={isFavorite(id) ? 'fill-current' : ''} 
                  />
                  <span className="text-sm">
                    {isFavorite(id) ? 'Saved' : 'Save'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery - Smart Layout with Placeholders */}
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
                {/* Main Image - Takes 2x2 space */}
                <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                  <Image
                    src={car.images?.[0] || 'https://via.placeholder.com/800x400?text=No+Image'}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    priority
                  />
                  
                  {/* Rating & Location Overlay */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-white text-sm font-medium">{car.location}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white text-sm font-medium">{(car.rating || 4.5).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Images with Smart Placeholders */}
                {[1, 2, 3, 4].map((position) => {
                  const image = car.images?.[position];
                  const isLastSlot = position === 4;
                  const remainingImages = car.images ? car.images.length - 5 : 0;
                  
                  return (
                    <div 
                      key={position} 
                      className="relative group cursor-pointer" 
                      onClick={() => image ? setSelectedImageIndex(position) : null}
                    >
                      {image ? (
                        <>
                          <Image
                            src={image}
                            alt={`${car.make} ${car.model} - ${position + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 1024px) 25vw, 16vw"
                          />
                          {/* Show +X more overlay on last slot if there are more images */}
                          {isLastSlot && remainingImages > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                              <span className="text-white font-semibold text-sm">
                                +{remainingImages} more
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Empty placeholder */
                        <div className="w-full h-full bg-[#2A2A2A] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-1 opacity-40">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Car Title & Basic Info */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-white">
                  {car.make} {car.model}
                </h1>
                <p className="text-gray-400 text-lg">{car.year} • {car.location}</p>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span>{(car.rating || 4.5).toFixed(1)}</span>
                    <span>(27 trips)</span>
                  </div>
                  <div>Hosted by {car.profiles?.full_name || 'Car Owner'}</div>
                </div>
              </div>

              {/* Desktop Tab Navigation */}
              <div className="border-b border-gray-700">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 cursor-pointer ${
                        activeTab === tab
                          ? 'border-[#FF4646] text-[#FF4646]'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="text-white">
                {renderTabContent()}
              </div>
            </div>

                        {/* Right Column - Booking Card & Map */}
            <div className="lg:col-span-1 space-y-6">
              {/* Booking Card */}
              <div className="sticky top-24">
                <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-gray-700 shadow-2xl">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-white">
                        €{car.price_per_day}
                      </span>
                      <span className="text-gray-400 text-lg">/day</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Prices may vary by date</p>
                  </div>

                  {/* Simplified Date Selection */}
                  <button 
                    onClick={() => setIsDatePickerOpen(true)}
                    className="w-full text-left p-4 border border-gray-600 rounded-xl hover:border-gray-500 transition-colors cursor-pointer mb-6"
                  >
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Select dates</div>
                    {selectedStartDate && selectedEndDate ? (
                      <div className="text-white font-medium">
                        {format(selectedStartDate, 'MMM d')} - {format(selectedEndDate, 'MMM d')}
                      </div>
                    ) : (
                      <div className="text-gray-300">Add your travel dates</div>
                    )}
                  </button>

                  {/* Booking Summary */}
                  {selectedStartDate && selectedEndDate && (
                    <div className="mb-6 p-4 bg-[#212121] rounded-xl border border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            €{car.price_per_day} × {differenceInDays(selectedEndDate, selectedStartDate) + 1} days
                          </span>
                          <span className="text-white">
                            €{car.price_per_day * (differenceInDays(selectedEndDate, selectedStartDate) + 1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Service fee</span>
                          <span className="text-white">
                            €{Math.round(car.price_per_day * (differenceInDays(selectedEndDate, selectedStartDate) + 1) * 0.1)}
                          </span>
                        </div>
                        <hr className="border-gray-600" />
                        <div className="flex justify-between font-semibold text-white">
                          <span>Total</span>
                          <span>
                            €{car.price_per_day * (differenceInDays(selectedEndDate, selectedStartDate) + 1) + Math.round(car.price_per_day * (differenceInDays(selectedEndDate, selectedStartDate) + 1) * 0.1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={selectedStartDate && selectedEndDate ? handleRequestBooking : () => setIsDatePickerOpen(true)}
                    disabled={isCreating}
                    className="w-full bg-[#FF4646] hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : selectedStartDate && selectedEndDate ? (
                      'Request to book'
                    ) : (
                      'Check availability'
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    You won&apos;t be charged yet
                  </p>
                </div>

                {/* Location Map - Below booking card */}
                <div className="mt-6 bg-[#2A2A2A] rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Where you&apos;ll pick up</h3>
                  
                  {/* Real Map Integration */}
                  <div className="w-full h-64 rounded-xl overflow-hidden">
                    <MapView
                      listings={[{
                        id: car.id,
                        make: car.make,
                        model: car.model,
                        location: car.location || 'Brussels',
                        pricePerDay: car.price_per_day,
                        lat: 50.8503, // Default Brussels coordinates
                        lng: 4.3517,
                        images: car.images || [],
                        rating: car.rating || 4.5
                      }]}
                      mapCenter={{
                        lat: 50.8503,
                        lng: 4.3517,
                        zoom: 15
                      }}
                      activeId={car.id}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-4">
                    Exact location will be provided after booking confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>
                 </div>
       </div>

      {/* Date Picker Modal - Mobile */}
      <div className="lg:hidden">
        <DatePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDates={handleDateSelect}
          initialStartDate={selectedStartDate || undefined}
          initialEndDate={selectedEndDate || undefined}
          carId={id}
        />
      </div>

      {/* Desktop Date Picker */}
      <div className="hidden lg:block">
        <DesktopDatePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onSelectDates={handleDateSelect}
          initialStartDate={selectedStartDate || undefined}
          initialEndDate={selectedEndDate || undefined}
          carId={id}
        />
      </div>

      {/* Success Overlay */}
      {showSuccessOverlay && bookingResult && (
        <BookingSuccessOverlay
          isVisible={showSuccessOverlay}
          onComplete={handleSuccessComplete}
          carData={{
            make: car.make,
            model: car.model,
            year: car.year,
            image: car.images?.[0],
            location: car.location || undefined,
          }}
          bookingData={{
            startDate: selectedStartDate!.toISOString().split('T')[0],
            endDate: selectedEndDate!.toISOString().split('T')[0],
            totalAmount: bookingResult.totalAmount,
          }}
          duration={3500}
        />
      )}

      {/* Image Modal */}
      {selectedImageIndex !== null && car.images && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X size={24} />
            </button>
            
            <Image
              src={car.images[selectedImageIndex]}
              alt={`${car.make} ${car.model} - Image ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
            
            {car.images.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : car.images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                
                {/* Next Button */}
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex < car.images.length - 1 ? selectedImageIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ArrowLeft size={24} className="rotate-180" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-3 py-1">
                  <span className="text-white text-sm">
                    {selectedImageIndex + 1} / {car.images.length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
