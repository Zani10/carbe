'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CarDraftState, CarBasicInfo, CarSpecs, CarPricing } from '@/types/car';

interface AddCarContextType {
  draftState: CarDraftState;
  currentStep: number;
  setStep: (step: number) => void;
  updateBasicInfo: (data: Partial<CarBasicInfo>) => void;
  updateSpecs: (data: Partial<CarSpecs>) => void;
  updatePricing: (data: Partial<CarPricing>) => void;
  updatePhotos: (photos: File[]) => void;
  resetDraft: () => void;
  isStepComplete: (step: number) => boolean;
}

const AddCarContext = createContext<AddCarContextType | undefined>(undefined);

const initialDraftState: CarDraftState = {
  step: 1,
  basicInfo: {},
  specs: {},
  pricing: {},
  photos: []
};

export function AddCarProvider({ children }: { children: ReactNode }) {
  const [draftState, setDraftState] = useState<CarDraftState>(initialDraftState);

  const setStep = (step: number) => {
    setDraftState(prev => ({ ...prev, step }));
  };

  const updateBasicInfo = (data: Partial<CarBasicInfo>) => {
    setDraftState(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data }
    }));
  };

  const updateSpecs = (data: Partial<CarSpecs>) => {
    setDraftState(prev => ({
      ...prev,
      specs: { ...prev.specs, ...data }
    }));
  };

  const updatePricing = (data: Partial<CarPricing>) => {
    setDraftState(prev => ({
      ...prev,
      pricing: { ...prev.pricing, ...data }
    }));
  };

  const updatePhotos = (photos: File[]) => {
    setDraftState(prev => ({
      ...prev,
      photos
    }));
  };

  const resetDraft = () => {
    setDraftState(initialDraftState);
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        const { make, model, year, seats, location } = draftState.basicInfo;
        return !!(make && model && year && seats && location);
      
      case 2: // Specs
        const { transmission, fuel_type, range_km, lock_type } = draftState.specs;
        return !!(transmission && fuel_type && range_km && lock_type);
      
      case 3: // Pricing
        const { price_per_day } = draftState.pricing;
        return !!price_per_day;
      
      case 4: // Photos
        return draftState.photos.length >= 3;
      
      default:
        return false;
    }
  };

  const value: AddCarContextType = {
    draftState,
    currentStep: draftState.step,
    setStep,
    updateBasicInfo,
    updateSpecs,
    updatePricing,
    updatePhotos,
    resetDraft,
    isStepComplete
  };

  return (
    <AddCarContext.Provider value={value}>
      {children}
    </AddCarContext.Provider>
  );
}

export function useAddCar() {
  const context = useContext(AddCarContext);
  if (context === undefined) {
    throw new Error('useAddCar must be used within an AddCarProvider');
  }
  return context;
} 