'use client';

import { notFound, useRouter } from 'next/navigation';
import { useCarById } from '@/hooks/useCars';
import { useBooking } from '@/hooks/booking/useBooking';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import DatePicker from '@/components/booking/DatePicker';
import PaymentForm from '@/components/booking/PaymentForm';

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { createBooking, isCreating } = useBooking();
  
  const [id, setId] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'dates' | 'details' | 'payment'>('dates');
  
  // Payment state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialRequests: '',
  });

  useEffect(() => {
    params.then(resolvedParams => {
      setId(resolvedParams.id);
    });
  }, [params]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [user]);

  const { car, isLoading, error } = useCarById(id);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      toast.error('Please sign in to book a car');
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  const calculateDays = () => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateSubtotal = () => {
    if (!car || !selectedStartDate || !selectedEndDate) return 0;
    return calculateDays() * car.price_per_day;
  };

  const calculateServiceFee = () => {
    return Math.round(calculateSubtotal() * 0.12); // 12% service fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceFee();
  };

  const handleDateSelect = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setIsDatePickerOpen(false);
    if (currentStep === 'dates') {
      setCurrentStep('details');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.phone && formData.licenseNumber;
  };

  const handleContinueToPayment = async () => {
    if (!isFormValid() || !selectedStartDate || !selectedEndDate || !car) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create booking with payment intent
      const result = await createBooking({
        car_id: car.id,
        start_date: selectedStartDate.toISOString().split('T')[0],
        end_date: selectedEndDate.toISOString().split('T')[0],
        daily_rate: car.price_per_day,
        subtotal: calculateSubtotal(),
        service_fee: calculateServiceFee(),
        total_amount: calculateTotal(),
        special_requests: formData.specialRequests,
        requiresApproval: false, // Default to false until schema is updated
      });

      if (result) {
        setClientSecret(result.paymentIntent.client_secret);
        setRequiresApproval(false); // Default to false until schema is updated
      setCurrentStep('payment');
    }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    toast.success(
      requiresApproval 
        ? 'Payment authorized! Waiting for host approval.' 
        : 'Booking confirmed! Check your email for details.'
    );
    
    // Redirect to appropriate page
    setTimeout(() => {
      router.push(requiresApproval ? '/dashboard/renter' : '/confirm');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    toast.error(`Payment failed: ${error}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF2800]"></div>
      </div>
    );
  }

  if (error || !car) {
    notFound();
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to book a car</p>
          <button
            onClick={() => router.push('/signin')}
            className="bg-[#FF2800] text-white px-6 py-2 rounded-lg hover:bg-[#E02400]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Book Your Car</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold mb-4">Your Car</h2>
              <div className="flex space-x-4">
                <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={car.images?.[0] || 'https://via.placeholder.com/96x64?text=Car'}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{car.make} {car.model}</h3>
                  <p className="text-gray-600 text-sm">{car.year} • {car.transmission} • {car.fuel_type}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{car.location}</span>
                  </div>
                  {/* Host approval indicator will be shown once schema is updated */}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">€{car.price_per_day}</p>
                  <p className="text-sm text-gray-600">per day</p>
                </div>
              </div>
            </div>

            {/* Step 1: Date Selection */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">1. Select Dates</h2>
                {selectedStartDate && selectedEndDate && currentStep !== 'payment' && (
                  <button
                    onClick={() => setIsDatePickerOpen(true)}
                    className="text-[#FF2800] text-sm font-medium hover:underline"
                  >
                    Change dates
                  </button>
                )}
              </div>
              
              {selectedStartDate && selectedEndDate ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-medium">{selectedStartDate.toLocaleDateString()}</p>
                    </div>
                    <div className="text-center px-4">
                      <Clock size={20} className="text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">{calculateDays()} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-medium">{selectedEndDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#FF2800] transition-colors"
                >
                  <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Select your rental dates</p>
                </button>
              )}
            </div>

            {/* Step 2: Details Form */}
            {selectedStartDate && selectedEndDate && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4">2. Your Details</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      disabled={currentStep === 'payment'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent disabled:bg-gray-100"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      disabled={currentStep === 'payment'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent disabled:bg-gray-100"
                      placeholder="Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      disabled={currentStep === 'payment'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent disabled:bg-gray-100"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      disabled={currentStep === 'payment'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent disabled:bg-gray-100"
                      placeholder="+32 123 456 789"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver&apos;s License Number *
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
                      disabled={currentStep === 'payment'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent disabled:bg-gray-100"
                      placeholder="Your license number"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleFormChange('specialRequests', e.target.value)}
                      disabled={currentStep === 'payment'}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent disabled:bg-gray-100"
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>

                {currentStep !== 'payment' && (
                <div className="mt-6">
                  <button
                    onClick={handleContinueToPayment}
                      disabled={!isFormValid() || isCreating}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isFormValid() && !isCreating
                        ? 'bg-[#FF2800] text-white hover:bg-[#E02400]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                      {isCreating ? 'Creating booking...' : 'Continue to Payment'}
                  </button>
                </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && clientSecret && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4">3. Secure Payment</h2>
                
                {requiresApproval && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        <strong>Host Approval Required:</strong> Your payment will be authorized but not charged until the host approves your booking.
                      </p>
                    </div>
                  </div>
                )}
                
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={calculateTotal()}
                  currency="EUR"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-bold mb-4">Price Summary</h3>
              
              {selectedStartDate && selectedEndDate ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">€{car.price_per_day} × {calculateDays()} days</span>
                    <span>€{calculateSubtotal()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span>€{calculateServiceFee()}</span>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>€{calculateTotal()}</span>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800 text-sm">
                      🚗 Free cancellation up to 24 hours before pickup
                    </p>
                  </div>

                  {requiresApproval && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        ⏱️ Host has 24 hours to approve your request
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Select dates to see pricing</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
    </div>
  );
}
