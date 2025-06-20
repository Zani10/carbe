'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AddCarProvider, useAddCar } from '@/contexts/AddCarContext';
import { ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { createCar } from '@/lib/car/createCar';
import { COLORS } from '@/constants/colors';

// Import step components
import BasicInfoStep from '@/components/car/addCar/BasicInfoStep';
import SpecsStep from '@/components/car/addCar/SpecsStep';
import PricingStep from '@/components/car/addCar/PricingStep';
import PhotosStep from '@/components/car/addCar/PhotosStep';
import SuccessScreen from '@/components/car/addCar/SuccessScreen';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Make, model, and location' },
  { id: 2, title: 'Specifications', description: 'Technical details' },
  { id: 3, title: 'Pricing', description: 'Set your daily rate' },
  { id: 4, title: 'Photos', description: 'Upload car images' }
];

function AddCarWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const { currentStep, setStep, draftState, isStepComplete, resetDraft } = useAddCar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const handleNext = () => {
    if (currentStep < 4) {
      setStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to add a car');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine all form data
      const formData = {
        ...draftState.basicInfo,
        ...draftState.specs,
        ...draftState.pricing,
        photos: draftState.photos
      };

      // Create properly typed form data
      const carData = {
        make: formData.make as string,
        model: formData.model as string,
        year: formData.year as number,
        seats: formData.seats as number,
        location: formData.location as string,
        transmission: formData.transmission as 'Manual' | 'Automatic',
        fuel_type: formData.fuel_type as 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid',
        range_km: formData.range_km as number,
        lock_type: formData.lock_type as 'manual' | 'smart',
        price_per_day: formData.price_per_day as number,
        smart_pricing_enabled: formData.smart_pricing_enabled as boolean,
        photos: formData.photos as File[]
      };

      const result = await createCar(
        carData,
        user.id,
        (photoIndex, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [photoIndex]: progress
          }));
        }
      );

      if (result.success) {
        setShowSuccess(true);
        resetDraft();
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/host/garage');
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to create car listing');
      }
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  const canProceed = isStepComplete(currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <SpecsStep />;
      case 3:
        return <PricingStep />;
      case 4:
        return <PhotosStep uploadProgress={uploadProgress} />;
      default:
        return <BasicInfoStep />;
    }
  };

  if (showSuccess) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/host/garage')}
                className="mr-3 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">Add New Car</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#2A2A2A] border-b border-gray-700/50 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step.id <= currentStep
                        ? 'text-white'
                        : 'border-gray-600 text-gray-500'
                    }`}
                    style={step.id <= currentStep ? {
                      backgroundColor: COLORS.primary.red,
                      borderColor: COLORS.primary.red
                    } : {}}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      step.id < currentStep ? '' : 'bg-gray-600'
                    }`}
                    style={step.id < currentStep ? {
                      backgroundColor: COLORS.primary.red
                    } : {}}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white mb-1">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 max-w-md mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-[#2A2A2A] border-t border-gray-700/50 px-4 py-4 mt-auto">
        <div className="max-w-md mx-auto flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              canProceed && !isSubmitting
                ? 'text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            style={canProceed && !isSubmitting ? {
              backgroundColor: COLORS.primary.red
            } : {}}
            onMouseEnter={(e) => {
              if (canProceed && !isSubmitting) {
                e.currentTarget.style.backgroundColor = COLORS.primary.redHover;
              }
            }}
            onMouseLeave={(e) => {
              if (canProceed && !isSubmitting) {
                e.currentTarget.style.backgroundColor = COLORS.primary.red;
              }
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : currentStep === 4 ? (
              'Create Listing'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddCarPage() {
  const { user, isHostMode } = useAuth();
  const router = useRouter();

  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] p-4">
        <div className="bg-[#2A2A2A] p-8 rounded-2xl shadow-md max-w-md w-full text-center border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to add a car.
          </p>
          <button 
            onClick={() => router.push('/profile')}
            className="inline-block px-6 py-3 text-white rounded-xl transition-colors"
            style={{ backgroundColor: COLORS.primary.red }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.redHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary.red}
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <AddCarProvider>
      <AddCarWizard />
    </AddCarProvider>
  );
} 