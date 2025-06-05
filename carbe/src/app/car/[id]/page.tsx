'use client';

import { notFound } from 'next/navigation';
import { useCarById } from '@/hooks/useCars';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/booking/useBooking';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share, Heart } from 'lucide-react';
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
import BookingSuccessOverlay from '@/components/booking/BookingSuccessOverlay';

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
      name: 'Car Owner', // Will be replaced with real host data later
      description: 'Passionate about cars and providing excellent service to renters. I take great care of my vehicles and ensure they are always clean and ready for your next adventure.',
      profilePicture: 'https://via.placeholder.com/100x100?text=Host',
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
        return <PickupTab />;
      default:
        return <OverviewTab {...overviewData} carId={car.id} hostId={car.owner_id} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] relative">
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

      {/* Date Picker Modal */}
      <DatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDates={handleDateSelect}
        initialStartDate={selectedStartDate || undefined}
        initialEndDate={selectedEndDate || undefined}
        carId={id}
      />

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
    </div>
  );
}
