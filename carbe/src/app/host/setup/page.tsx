'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Check, Plus } from 'lucide-react';

// Simplified setup steps for now, can be expanded later
const setupSteps = [
  {
    id: 'intro',
    title: 'Become a Carbe Host',
    description: 'Start earning money by renting out your car when you\'re not using it.'
  },
  {
    id: 'car-basics',
    title: 'Tell us about your car',
    description: 'What kind of car do you have?'
  },
  {
    id: 'location',
    title: 'Where is your car located?',
    description: 'Choose a convenient pickup location for your guests.'
  },
  {
    id: 'photos',
    title: 'Add photos of your car',
    description: 'High-quality photos help you get more bookings.'
  },
  {
    id: 'pricing',
    title: 'Set your pricing',
    description: 'How much would you like to charge per day?'
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    description: 'Your car is now listed on Carbe.'
  }
];

export default function HostSetupPage() {
  const { user, isHostMode, updateProfile, isLoading } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    carType: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    location: '',
    photos: [],
    pricePerDay: ''
  });
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    if (!user) {
      console.log('No user, redirecting to /signin');
      router.push('/signin');
    }
  }, [user, router, isLoading]);
  
  // Redirect if already a host
  useEffect(() => {
    if (isHostMode) {
      console.log('User is already a host, redirecting to host dashboard');
      router.push('/dashboard/host/today');
    }
  }, [isHostMode, router]);
  
  const currentStep = setupSteps[currentStepIndex];
  
  const handleNext = async () => {
    if (currentStepIndex === setupSteps.length - 1) {
      try {
        console.log('Updating profile to mark as host...');
        const updates = { is_host: true };
        console.log('Updates:', updates);
        const updatedProfile = await updateProfile(updates);
        console.log('Profile updated successfully:', updatedProfile);
        
        // The useEffect hook will handle the redirect when isHostMode becomes true
        // No need to manually redirect here as the state update will trigger the useEffect
      } catch (error) {
        console.error('Error completing host setup:', error);
      }
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      // First step, go back to profile
      router.push('/profile');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'intro':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              Thousands of travelers are looking for unique cars like yours. Earn extra income sharing your car on Carbe.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <Check size={14} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Set your own schedule</p>
                  <p className="text-sm text-gray-500">Make your car available when you&apos;re not using it</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <Check size={14} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Earn extra income</p>
                  <p className="text-sm text-gray-500">Most hosts earn $500-$1000 per month</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <Check size={14} className="text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">We&apos;ve got your back</p>
                  <p className="text-sm text-gray-500">$1M insurance protection for every trip</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'car-basics':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="carBrand" className="block text-sm font-medium text-gray-700">Car Brand</label>
                <input
                  type="text"
                  name="carBrand"
                  id="carBrand"
                  value={formData.carBrand}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota, BMW, Tesla"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="carModel" className="block text-sm font-medium text-gray-700">Car Model</label>
                <input
                  type="text"
                  name="carModel"
                  id="carModel"
                  value={formData.carModel}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry, 3 Series, Model Y"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="carYear" className="block text-sm font-medium text-gray-700">Car Year</label>
                <input
                  type="text"
                  name="carYear"
                  id="carYear"
                  value={formData.carYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2021"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="carType" className="block text-sm font-medium text-gray-700">Car Type</label>
                <select
                  name="carType"
                  id="carType"
                  value={formData.carType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a car type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="convertible">Convertible</option>
                  <option value="luxury">Luxury</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 'location':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your address"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Map view will appear here</p>
            </div>
            
            <p className="text-sm text-gray-500">
              This is where renters will pick up and return your car.
              Make sure it&apos;s a safe and convenient location.
            </p>
          </div>
        );
        
      case 'photos':
        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              Photos are one of the most important factors in getting your car booked.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num} 
                  className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Plus size={20} className="text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-500 mt-2">Add photo</span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500">
              Include photos of the exterior, interior, and any special features.
            </p>
          </div>
        );
        
      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price per day (€)</label>
              <input
                type="number"
                name="pricePerDay"
                id="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-medium text-gray-700">Pricing tips</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Similar cars in your area rent for €40-€80 per day</li>
                <li>• Newer and luxury cars can charge more</li>
                <li>• You can adjust your pricing anytime</li>
                <li>• Consider offering weekly and monthly discounts</li>
              </ul>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check size={32} className="text-green-600" />
            </div>
            
            <div>
              <p className="text-gray-600">
                Congratulations! Your car is now listed on Carbe.
                You can manage your listing and check your bookings in the host dashboard.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {setupSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex-1 ${index < setupSteps.length - 1 ? 'relative' : ''}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStepIndex 
                      ? 'bg-green-500 text-white' 
                      : index === currentStepIndex 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                
                {index < setupSteps.length - 1 && (
                  <div 
                    className={`absolute top-4 -right-full h-0.5 w-full ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentStep.title}
          </h2>
          <p className="text-gray-500 mb-6">
            {currentStep.description}
          </p>
          
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {currentStepIndex === setupSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 