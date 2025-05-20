'use client'

import React, { useState, useRef } from 'react';
import TabBar from './TabBar';

interface ImageCarouselProps {
  images: string[];
  rating: number;
  location: string;
  tabs: string[];
  onTabChange?: (tab: string) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  rating,
  location,
  tabs,
  onTabChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      goToNext();
    }
    if (touchStart - touchEnd < -50) {
      // Swipe right
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative w-full bg-[#212121]">
      {/* Main Image with rounded corners at bottom */}
      <div 
        ref={carouselRef}
        className="relative w-full h-[50vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((img, index) => (
          <div 
            key={index} 
            className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(${(index - currentIndex) * 100}%)`
            }}
          >
            <img
              src={img}
              alt={`Car image ${index + 1}`}
              className="w-full h-full object-cover rounded-b-[35px]"
            />
          </div>
        ))}
      </div>

      {/* Location and Rating indicators group */}
      <div className="absolute bottom-28 left-4 flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-white text-sm font-medium">{location}</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="text-yellow-400">★</span>
          <span className="text-white text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Image progress line indicator with pagination */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
            />
          </div>
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full flex-shrink-0">
            <span className="text-white text-sm">
              {currentIndex + 1}/{images.length}
            </span>
          </div>
        </div>
      </div>

      {/* TabBar integrated at the bottom */}
      <div className="absolute left-0 right-0">
        <TabBar tabs={tabs} onTabChange={onTabChange} />
      </div>
    </div>
  );
};

export default ImageCarousel; 