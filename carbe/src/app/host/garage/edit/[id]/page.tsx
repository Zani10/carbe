'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { COLORS } from '@/constants/colors';
import GlassCard from '@/components/ui/GlassCard';

// Import edit step components (we'll create these)
import EditBasicInfoStep from '@/components/car/editCar/EditBasicInfoStep';
import EditSpecsStep from '@/components/car/editCar/EditSpecsStep';
import EditPricingStep from '@/components/car/editCar/EditPricingStep';
import EditPhotosStep from '@/components/car/editCar/EditPhotosStep';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Make, model, and location' },
  { id: 2, title: 'Specifications', description: 'Technical details' },
  { id: 3, title: 'Pricing', description: 'Update your rates' },
  { id: 4, title: 'Photos', description: 'Manage car images' }
];

interface EditCarPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCarPage({ params }: EditCarPageProps) {
  const { user, isHostMode } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [carData, setCarData] = useState<any>(null);
  
  // Unwrap params
  const { id } = React.use(params);

  useEffect(() => {
    if (user && isHostMode && id) {
      loadCarData();
    }
  }, [user, isHostMode, id]);

  const loadCarData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement car data loading
      // const car = await getCarById(id);
      // setCarData(car);
      
      // Mock data for now
      setCarData({
        id,
        make: 'BMW',
        model: '3 Series',
        year: 2022,
        seats: 5,
        location: 'Amsterdam, Netherlands',
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        range_km: 500,
        lock_type: 'smart',
        price_per_day: 75,
        smart_pricing_enabled: true,
        images: []
      });
    } catch (error) {
      console.error('Error loading car data:', error);
      toast.error('Failed to load car data');
      router.push('/host/garage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement car update logic
      // await updateCar(id, editedData);
      
      toast.success('Car listing updated successfully!');
      router.push('/host/garage');
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (!carData) return null;
    
    switch (currentStep) {
      case 1:
        return <EditBasicInfoStep carData={carData} onUpdate={setCarData} />;
      case 2:
        return <EditSpecsStep carData={carData} onUpdate={setCarData} />;
      case 3:
        return <EditPricingStep carData={carData} onUpdate={setCarData} />;
      case 4:
        return <EditPhotosStep carData={carData} onUpdate={setCarData} />;
      default:
        return <EditBasicInfoStep carData={carData} onUpdate={setCarData} />;
    }
  };

  if (!user || !isHostMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] p-4">
        <GlassCard padding="lg" className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Host Access Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be in host mode to edit car listings.
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
        </GlassCard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: COLORS.primary.red, borderTopColor: 'transparent' }}
          />
          <p className="text-gray-400">Loading car details...</p>
        </div>
      </div>
    );
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
              <h1 className="text-lg font-semibold text-white">Edit Car</h1>
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

      {/* Car Info Header */}
      {carData && (
        <div className="bg-[#1F1F1F] border-b border-gray-700/50 px-4 py-3">
          <div className="max-w-md mx-auto">
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: `${COLORS.primary.red}20` }}
              >
                <span className="text-lg font-bold" style={{ color: COLORS.primary.red }}>
                  {carData.make.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {carData.make} {carData.model}
                </h3>
                <p className="text-sm text-gray-400">
                  {carData.year} • {carData.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors text-white"
            style={{ backgroundColor: COLORS.primary.red }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = COLORS.primary.redHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = COLORS.primary.red;
              }
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : currentStep === 4 ? (
              <div className="flex items-center justify-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </div>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 