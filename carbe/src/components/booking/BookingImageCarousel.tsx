'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Car, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function BookingImageCarousel({ images, alt, className = '' }: BookingImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <Car className="h-16 w-16 text-gray-600" />
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left - go to next
      goToNext();
    }
    if (touchStart - touchEnd < -50) {
      // Swipe right - go to previous
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Image with Touch Support */}
      <div 
        ref={carouselRef}
        className="relative w-full h-full overflow-hidden rounded-t-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div 
            key={index} 
            className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(${(index - currentIndex) * 100}%)`
            }}
          >
            <Image
              src={image}
              alt={alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Desktop Navigation Arrows - Only show on desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full items-center justify-center transition-colors z-10"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full items-center justify-center transition-colors z-10"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        {/* Image Counter - Only show if more than 1 image */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 rounded-full">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Dots Indicator - Only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 