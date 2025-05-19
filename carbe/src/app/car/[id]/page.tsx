'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from '@/components/carDetail/ImageCarousel';
import CarHeader from '@/components/carDetail/CarHeader';
import SpecsGrid from '@/components/carDetail/SpecsGrid';
import DetailsSection from '@/components/carDetail/DetailsSection';
import StickyFooterBar from '@/components/carDetail/StickyFooterBar';

// Mock data
const mockImages = [
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym13fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Ym13fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJtd3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJtd3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1611821064430-0d40291922b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGJtd3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
];

const mockSpecs = [
  { icon: 'range' as const, value: '855km', subtext: 'Range' },
  { icon: 'seats' as const, value: '5', subtext: 'Seats' },
  { icon: 'powertrain' as const, value: 'Hybrid', subtext: 'Powertrain' },
];

const mockDetails = [
  { label: 'Charging Type', value: 'Type 2 - abto50', iconUrl: '/images/charging-cable.png' },
  { label: 'Transmission', value: 'Automatic' },
];

export default function CarDetailPage() {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="min-h-screen pb-28 bg-[#212121] text-white">
      <div className="relative">
        {/* Image carousel with integrated tab bar */}
        <div className="relative bg-[#212121]">
          <ImageCarousel 
            images={mockImages} 
            rating={4.8} 
            location="Brussels, BE"
            tabs={['Overview', 'Host', 'Driving', 'Map']}
            onBack={handleBack} 
          />
        </div>
        
        {/* Car details section */}
        <div className="px-5 pt-10 pb-20 bg-[#212121]">
          <CarHeader 
            name="BMW B-Series" 
            description="Nice blue family car, good state, available in the weekends." 
          />
          
          <SpecsGrid specs={mockSpecs} />
          
          <DetailsSection details={mockDetails} />
        </div>
      </div>
      
      <StickyFooterBar price={70} />
    </div>
  );
}
