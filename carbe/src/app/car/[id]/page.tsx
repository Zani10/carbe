'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from '@/components/carDetail/ImageCarousel';
import StickyFooterBar from '@/components/carDetail/StickyFooterBar';
import HostTab from '@/components/carDetail/HostTab/HostTab';
import DetailsTab from '@/components/carDetail/Details/DetailsTab';
import PickupTab from '@/components/carDetail/Pickup/PickupTab';
import OverviewTab from '@/components/carDetail/OverviewTab/OverviewTab';
import HeaderBar from '@/components/layout/HeaderBar';

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

const CAR_NAME = "BMW B-Series";

export default function CarDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerThreshold = 150; // Threshold for header appearance

  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleShare = () => {
    // Share functionality
    console.log('Share car:', CAR_NAME);
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    console.log(`${isFavorite ? 'Removed from' : 'Added to'} favorites:`, CAR_NAME);
  };

  // Handle scroll events with throttling for better performance
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setScrollPosition(contentRef.current.scrollTop);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      let isScrolling = false;
      
      const onScroll = () => {
        if (!isScrolling) {
          window.requestAnimationFrame(() => {
            handleScroll();
            isScrolling = false;
          });
          isScrolling = true;
        }
      };
      
      contentElement.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        contentElement.removeEventListener('scroll', onScroll);
      };
    }
  }, []);

  // Calculate header styles based on scroll position
  const isHeaderSolid = scrollPosition > headerThreshold;
  const showTitle = scrollPosition > headerThreshold * 1.2;
  
  return (
    <div className="h-full w-full bg-[#212121] text-white flex flex-col relative">
      <div 
        ref={contentRef} 
        className="h-full w-full overflow-y-auto pb-28 overscroll-none"
      >
        {/* Carousel section */}
        <ImageCarousel 
          images={mockImages} 
          rating={4.8} 
          location="Brussels, BE"
          tabs={['Overview', 'Host', 'Details', 'Pickup']}
          onTabChange={handleTabChange}
        />
        
        {/* Content section */}
        <div className="px-5 pt-4">
          {activeTab === 'Overview' && (
            <OverviewTab 
              carName={CAR_NAME}
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

      {/* Fixed Header that changes based on scroll */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <HeaderBar 
            showTitle={showTitle}
            title={CAR_NAME}
            isFavorite={isFavorite}
            isTransparent={!isHeaderSolid}
            onBack={handleBack}
            onShare={handleShare}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </div>

      {/* Footer */}
      <StickyFooterBar price={70} />
    </div>
  );
}
