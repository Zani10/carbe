'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from '@/components/carDetail/ImageCarousel';
import StickyFooterBar from '@/components/carDetail/StickyFooterBar';
import HostTab from '@/components/carDetail/HostTab/HostTab';
import DetailsTab from '@/components/carDetail/Details/DetailsTab';
import PickupTab from '@/components/carDetail/Pickup/PickupTab';
import OverviewTab from '@/components/carDetail/OverviewTab/OverviewTab';

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
    <div className="h-full w-full bg-[#212121] text-white flex flex-col">
      <div className="h-full w-full overflow-y-auto pb-28">
        {/* Carousel section */}
        <ImageCarousel 
          images={mockImages} 
          rating={4.8} 
          location="Brussels, BE"
          tabs={['Overview', 'Host', 'Details', 'Pickup']}
          onBack={handleBack}
          onTabChange={handleTabChange}
        />
        
        {/* Content section */}
        <div className="px-5 pt-4">
          {activeTab === 'Overview' && (
            <OverviewTab 
              carName="BMW B-Series"
              description="Nice blue family car, good state, available in the weekends."
              specs={mockSpecs}
              details={mockDetails}
            />
          )}

          {activeTab === 'Host' && (
            <HostTab 
              hostData={mockHostData}
              price={70}
            />
          )}

          {activeTab === 'Details' && (
            <DetailsTab />
          )}

          {activeTab === 'Pickup' && (
            <PickupTab />
          )}
        </div>
      </div>

      {/* Footer */}
      <StickyFooterBar price={70} />
    </div>
  );
}
