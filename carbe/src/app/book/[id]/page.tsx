'use client';

import { notFound, useRouter } from 'next/navigation';
import { useCarById } from '@/hooks/useCars';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, CreditCard } from 'lucide-react';
import Image from 'next/image';
import DatePicker from '@/components/booking/DatePicker';

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'dates' | 'details' | 'payment'>('dates');
  
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

  const { car, isLoading, error } = useCarById(id);

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

  const handleContinueToPayment = () => {
    if (isFormValid()) {
      setCurrentStep('payment');
    }
  };

  const handleBooking = () => {
    // TODO: Implement actual booking logic
    alert('Booking functionality will be implemented next!');
    router.push('/dashboard/renter'); // Redirect to user dashboard
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
                {selectedStartDate && selectedEndDate && (
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
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
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                      placeholder="Any special requests or notes..."
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!isFormValid()}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      isFormValid()
                        ? 'bg-[#FF2800] text-white hover:bg-[#E02400]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4">3. Payment</h2>
                
                <div className="text-center py-8">
                  <CreditCard size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Payment Integration</h3>
                  <p className="text-gray-600 mb-6">
                    Payment processing will be implemented with Stripe
                  </p>
                  
                  <button
                    onClick={handleBooking}
                    className="bg-[#FF2800] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#E02400] transition-colors"
                  >
                    Complete Booking (Demo)
                  </button>
                </div>
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
      />
    </div>
  );
}
