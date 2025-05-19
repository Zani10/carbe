'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from '@/components/carDetail/ImageCarousel';
import CarHeader from '@/components/carDetail/CarHeader';
import SpecsGrid from '@/components/carDetail/SpecsGrid';
import DetailsSection from '@/components/carDetail/DetailsSection';
import StickyFooterBar from '@/components/carDetail/StickyFooterBar';
import HostTab from '@/components/carDetail/HostTab/HostTab';

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

// Mock host data
const mockHostData = {
  name: 'Zani Dobruna',
  description: "Hey, I'm a student living in Brussels City.",
  profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  languages: 'Albanian, Dutch, English & French',
  nationality: 'Kosovo',
  distance: '1.5km',
  rating: 4.8,
  responseRate: 90,
  responseTime: 'Responds within two hours',
  address: 'Avenue de la Diplomé 23',
  city: 'Koekelberg',
  postalCode: '1081',
};

export default function CarDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  
  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="min-h-screen bg-[#212121] text-white overflow-y-auto scroll-smooth">
      <div className="relative">
        {/* Image carousel with integrated tab bar */}
        <div className="relative bg-[#212121]">
          <ImageCarousel 
            images={mockImages} 
            rating={4.8} 
            location="Brussels, BE"
            tabs={['Overview', 'Host', 'Driving', 'Map']}
            onBack={handleBack}
            onTabChange={handleTabChange}
          />
        </div>
        
        {/* Content area based on active tab */}
        <div className="px-5 pt-10 pb-28 bg-[#212121] min-h-[70vh]">
          {activeTab === 'Overview' && (
            <>
              <CarHeader 
                name="BMW B-Series" 
                description="Nice blue family car, good state, available in the weekends." 
              />
              <SpecsGrid specs={mockSpecs} />
              <DetailsSection details={mockDetails} />
            </>
          )}

          {activeTab === 'Host' && (
            <HostTab 
              hostData={mockHostData}
              price={70}
            />
          )}

          {activeTab === 'Driving' && (
            <div className="py-4">
              <h2 className="text-xl font-semibold mb-4">Driving Experience</h2>
              <p className="text-gray-300">Driving details will be displayed here.</p>
            </div>
          )}

          {activeTab === 'Map' && (
            <div className="py-4">
              <h2 className="text-xl font-semibold mb-4">Car Location</h2>
              <p className="text-gray-300">Map will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
      
      <StickyFooterBar price={70} />
    </div>
  );
}
