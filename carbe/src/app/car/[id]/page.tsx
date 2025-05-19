'use client'

import React from 'react';
import ImageCarousel from '@/components/carDetail/ImageCarousel';
import TabBar from '@/components/carDetail/TabBar';
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
  return (
    <div className="min-h-screen pb-24 bg-black text-white">
      <div className="relative">
        {/* Image carousel with tab bar positioned at the bottom of the carousel */}
        <div className="relative">
          <ImageCarousel 
            images={mockImages} 
            rating={4.8} 
            location="Brussels, BE"
            onBack={() => window.history.back()} 
          />
          <TabBar tabs={['Overview', 'Host', 'Driving', 'Map']} />
        </div>
        
        {/* Car details section */}
        <div className="px-4 pt-4" style={{ backgroundColor: '#292929' }}>
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
